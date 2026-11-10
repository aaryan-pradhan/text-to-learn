const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const prompts = require("../services/prompts");
const { validateCourse } = require("../utils/validate");
const { httpError } = require("../middlewares/error");

const populated = (id) =>
  Course.findById(id).populate({ path: "modules", populate: { path: "lessons", select: "title isEnriched" } });

// Load a course and make sure the logged-in user owns it.
async function ownCourse(id, user) {
  const course = await populated(id);
  if (!course || course.creator !== user.sub) throw httpError(404, "Course not found");
  return course;
}

module.exports = (ai) => ({
  ownCourse,

  async create(req, res) {
    const outline = validateCourse(await ai.generateJSON(prompts.generateCoursePrompt(req.body.topic)));
    const course = await Course.create({
      title: outline.title,
      description: outline.description,
      tags: outline.tags,
      creator: req.user.sub,
    });
    for (const m of outline.modules) {
      const mod = await Module.create({ title: m.title, course: course._id });
      const lessons = await Lesson.insertMany(m.lessons.map((title) => ({ title, module: mod._id })));
      mod.lessons = lessons.map((l) => l._id);
      await mod.save();
      course.modules.push(mod._id);
    }
    await course.save();
    res.status(201).json(await populated(course._id));
  },

  async list(req, res) {
    res.json(await Course.find({ creator: req.user.sub }).sort({ createdAt: -1 }).select("title description tags createdAt"));
  },

  async get(req, res) {
    res.json(await ownCourse(req.params.id, req.user));
  },

  async remove(req, res) {
    const course = await ownCourse(req.params.id, req.user);
    const moduleIds = course.modules.map((m) => m._id);
    await Lesson.deleteMany({ module: { $in: moduleIds } });
    await Module.deleteMany({ _id: { $in: moduleIds } });
    await course.deleteOne();
    res.status(204).end();
  },
});
