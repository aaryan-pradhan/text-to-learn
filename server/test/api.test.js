const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const createApp = require("../app");

const outline = {
  title: "Intro to React Hooks",
  description: "Learn hooks.",
  tags: ["react"],
  modules: [1, 2, 3].map((n) => ({ title: `Module ${n}`, lessons: ["A", "B", "C"] })),
};
const lessonJSON = {
  objectives: ["Understand useState"],
  keyTopics: ["state"],
  content: [
    { type: "paragraph", text: "useState stores state." },
    { type: "mcq", question: "Q?", options: ["x", "y"], answer: 1, explanation: "y" },
  ],
  readings: [{ title: "React docs", url: "https://react.dev" }],
};

let mongo, app, aiCalls;
const fakeAI = {
  generateJSON: async (prompt) => {
    aiCalls++;
    if (prompt.includes("Hinglish")) return { hinglish: "useState state store karta hai." };
    return prompt.includes("curriculum designer") ? outline : lessonJSON;
  },
};
const verify = async (token) => {
  if (!token.startsWith("user-")) throw new Error("bad");
  return { sub: token, email: `${token}@x.com` };
};
const as = (user) => ({ Authorization: `Bearer ${user}` });

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp({ ai: fakeAI, verify, search: async (q) => [{ videoId: "abc", title: q }] });
});
test.after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
test.beforeEach(() => (aiCalls = 0));

test("rejects requests without a valid token", async () => {
  await request(app).get("/api/courses").expect(401);
  await request(app).get("/api/courses").set(as("hacker")).expect(401);
});

test("rejects an empty topic", async () => {
  await request(app).post("/api/courses").set(as("user-1")).send({ topic: " " }).expect(400);
});

test("creates a course, lists it, and hides it from other users", async () => {
  const { body } = await request(app).post("/api/courses").set(as("user-1")).send({ topic: "React hooks" }).expect(201);
  assert.equal(body.title, "Intro to React Hooks");
  assert.equal(body.modules.length, 3);
  assert.equal(body.modules[0].lessons.length, 3);
  assert.equal(body.modules[0].lessons[0].isEnriched, false);

  const list = await request(app).get("/api/courses").set(as("user-1")).expect(200);
  assert.equal(list.body.length, 1);
  await request(app).get(`/api/courses/${body._id}`).set(as("user-2")).expect(404);
});

test("generates a lesson once, then serves it from the database", async () => {
  const { body: course } = await request(app).post("/api/courses").set(as("user-1")).send({ topic: "React" });
  aiCalls = 0;
  const url = `/api/courses/${course._id}/modules/0/lessons/1`;
  const [a, b] = await Promise.all([request(app).get(url).set(as("user-1")), request(app).get(url).set(as("user-1"))]);
  assert.equal(a.status, 200);
  assert.equal(b.body.lesson._id, a.body.lesson._id);
  assert.equal(a.body.lesson.isEnriched, true);
  assert.deepEqual(a.body.lesson.objectives, ["Understand useState"]);
  await request(app).get(url).set(as("user-1")).expect(200);
  assert.equal(aiCalls, 1);
  await request(app).get(`/api/courses/${course._id}/modules/9/lessons/0`).set(as("user-1")).expect(404);
});

test("deletes a course for its owner only", async () => {
  const { body: course } = await request(app).post("/api/courses").set(as("user-1")).send({ topic: "React" });
  await request(app).delete(`/api/courses/${course._id}`).set(as("user-2")).expect(404);
  await request(app).delete(`/api/courses/${course._id}`).set(as("user-1")).expect(204);
  await request(app).get(`/api/courses/${course._id}`).set(as("user-1")).expect(404);
});

test("searches YouTube videos for a query", async () => {
  await request(app).get("/api/youtube").set(as("user-1")).expect(400);
  const { body } = await request(app).get("/api/youtube?query=react%20hooks").set(as("user-1")).expect(200);
  assert.deepEqual(body, [{ videoId: "abc", title: "react hooks" }]);
});

test("returns a cached Hinglish explanation for the owner only", async () => {
  const { body: course } = await request(app).post("/api/courses").set(as("user-1")).send({ topic: "React" });
  const lessonId = course.modules[0].lessons[0]._id;
  await request(app).post(`/api/lessons/${lessonId}/hinglish`).set(as("user-1")).expect(409);
  await request(app).get(`/api/courses/${course._id}/modules/0/lessons/0`).set(as("user-1")).expect(200);
  await request(app).post(`/api/lessons/${lessonId}/hinglish`).set(as("user-2")).expect(404);
  aiCalls = 0;
  for (let i = 0; i < 2; i++) {
    const { body } = await request(app).post(`/api/lessons/${lessonId}/hinglish`).set(as("user-1")).expect(200);
    assert.equal(body.hinglish, "useState state store karta hai.");
  }
  assert.equal(aiCalls, 1);
});
