const test = require("node:test");
const assert = require("node:assert");
const { validateCourse, validateLesson } = require("../utils/validate");
const { parseJSON } = require("../services/ai");

const mod = (n, lessons = 3) => ({ title: `M${n}`, lessons: Array.from({ length: lessons }, (_, i) => `L${i}`) });

test("validateCourse keeps 3-6 modules with 3-5 lessons", () => {
  const c = validateCourse({ title: " React ", description: "d", modules: [mod(1, 7), mod(2), mod(3), mod(4), mod(5), mod(6), mod(7)] });
  assert.equal(c.title, "React");
  assert.equal(c.modules.length, 6);
  assert.equal(c.modules[0].lessons.length, 5);
});

test("validateCourse drops thin modules and rejects too few", () => {
  assert.throws(() => validateCourse({ title: "X", modules: [mod(1), mod(2), mod(3, 2)] }), /3-6 modules/);
  assert.throws(() => validateCourse({ modules: [mod(1), mod(2), mod(3)] }), /title/);
});

test("validateLesson keeps valid blocks and drops broken ones", () => {
  const l = validateLesson({
    objectives: ["Understand X"],
    content: [
      { type: "paragraph", text: "Hi" },
      { type: "mcq", question: "Q?", options: ["a", "b"], answer: 5 },
      { type: "mcq", question: "Q?", options: ["a", "b"], answer: 1, explanation: "b" },
      { type: "video", query: "x tutorial" },
      { type: "script", text: "bad" },
    ],
    readings: [{ title: "MDN", url: "https://developer.mozilla.org" }, { title: "bad", url: "javascript:alert(1)" }],
  });
  assert.deepEqual(l.content.map((b) => b.type), ["paragraph", "mcq", "video"]);
  assert.equal(l.readings.length, 1);
});

test("validateLesson rejects a lesson with no explanation", () => {
  assert.throws(() => validateLesson({ content: [{ type: "heading", text: "x" }] }), /explanation/);
});

test("parseJSON extracts JSON from fenced replies", () => {
  assert.deepEqual(parseJSON('Sure!\n```json\n{"a":1}\n```'), { a: 1 });
  assert.throws(() => parseJSON("no json"), /no JSON/);
});
