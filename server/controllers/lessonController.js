const Lesson = require("../models/Lesson");
const prompts = require("../services/prompts");
const { validateLesson } = require("../utils/validate");
const { httpError } = require("../middlewares/error");

// Two clicks on the same lesson share one AI call instead of generating twice.
const pending = new Map();

module.exports = (ai, ownCourse) => {
  async function enrich(lesson, course, mod) {
    if (lesson.isEnriched) return lesson;
    const key = String(lesson._id);
    if (!pending.has(key)) {
      const job = (async () => {
        const raw = await ai.generateJSON(prompts.generateLessonPrompt(course.title, mod.title, lesson.title));
        Object.assign(lesson, validateLesson(raw), { isEnriched: true });
        return lesson.save();
      })().finally(() => pending.delete(key));
      pending.set(key, job);
    }
    return pending.get(key);
  }

  return {
    // GET /api/courses/:id/modules/:m/lessons/:l — generated on first open, then served from MongoDB.
    async get(req, res) {
      const course = await ownCourse(req.params.id, req.user);
      const mod = course.modules[Number(req.params.m)];
      const ref = mod?.lessons[Number(req.params.l)];
      if (!ref) throw httpError(404, "Lesson not found");
      const lesson = await enrich(await Lesson.findById(ref._id), course, mod);
      res.json({ courseTitle: course.title, moduleTitle: mod.title, lesson });
    },

    // POST /api/lessons/:id/hinglish — Hinglish explanation of the lesson, cached on the lesson.
    // The browser speaks it aloud with the Web Speech API (no TTS key needed).
    async hinglish(req, res) {
      const lesson = await Lesson.findById(req.params.id).populate({ path: "module", populate: { path: "course", select: "creator" } });
      if (!lesson || lesson.module?.course?.creator !== req.user.sub) throw httpError(404, "Lesson not found");
      if (!lesson.isEnriched) throw httpError(409, "Lesson is not generated yet");
      if (!lesson.hinglish) {
        const text = lesson.content.filter((b) => b.type === "paragraph").map((b) => b.text).join("\n");
        const { hinglish } = await ai.generateJSON(prompts.generateHinglishPrompt(text));
        if (typeof hinglish !== "string" || !hinglish.trim()) throw httpError(502, "Translation failed");
        lesson.hinglish = hinglish.trim();
        await lesson.save();
      }
      res.json({ hinglish: lesson.hinglish });
    },
  };
};
