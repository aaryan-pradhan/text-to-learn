// Validate and normalise AI output before it touches the database.
const str = (v) => (typeof v === "string" ? v.trim() : "");
const strList = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

function validateCourse(raw) {
  const modules = (Array.isArray(raw?.modules) ? raw.modules : [])
    .map((m) => ({ title: str(m?.title), lessons: strList(m?.lessons).slice(0, 5) }))
    .filter((m) => m.title && m.lessons.length >= 3)
    .slice(0, 6);
  if (!str(raw?.title)) throw new Error("Course has no title");
  if (modules.length < 3) throw new Error("Course needs 3-6 modules with 3-5 lessons each");
  return { title: str(raw.title), description: str(raw.description), tags: strList(raw.tags).slice(0, 8), modules };
}

const BLOCKS = {
  heading: (b) => str(b.text) && { type: "heading", text: str(b.text) },
  paragraph: (b) => str(b.text) && { type: "paragraph", text: str(b.text) },
  code: (b) => str(b.text) && { type: "code", language: str(b.language) || "text", text: b.text },
  video: (b) => str(b.query) && { type: "video", query: str(b.query) },
  mcq: (b) => {
    const options = strList(b.options);
    const answer = Number(b.answer);
    if (!str(b.question) || options.length < 2 || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
    return { type: "mcq", question: str(b.question), options, answer, explanation: str(b.explanation) };
  },
};

function validateLesson(raw) {
  const content = (Array.isArray(raw?.content) ? raw.content : [])
    .map((b) => BLOCKS[b?.type]?.(b))
    .filter(Boolean);
  if (!content.some((b) => b.type === "paragraph")) throw new Error("Lesson has no explanation");
  const readings = (Array.isArray(raw?.readings) ? raw.readings : [])
    .map((r) => ({ title: str(r?.title), url: str(r?.url) }))
    .filter((r) => r.title && /^https?:\/\//.test(r.url));
  return { objectives: strList(raw.objectives), keyTopics: strList(raw.keyTopics), content, readings };
}

module.exports = { validateCourse, validateLesson };
