const router = require("express").Router;
const { validateId } = require("../middlewares/validate");

module.exports = ({ auth, lessons }) => {
  const r = router();
  r.post("/:id/hinglish", auth, validateId, (req, res, next) => lessons.hinglish(req, res).catch(next));
  return r;
};
