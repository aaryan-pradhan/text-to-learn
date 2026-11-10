const router = require("express").Router;
const { validateTopic, validateId } = require("../middlewares/validate");

// Express 4 doesn't catch rejected promises; forward them to the error handler.
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

module.exports = ({ auth, courses, lessons }) => {
  const r = router();
  r.use(auth);
  r.post("/", validateTopic, wrap(courses.create));
  r.get("/", wrap(courses.list));
  r.get("/:id", validateId, wrap(courses.get));
  r.delete("/:id", validateId, wrap(courses.remove));
  r.get("/:id/modules/:m/lessons/:l", validateId, wrap(lessons.get));
  return r;
};
