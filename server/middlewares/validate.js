const { httpError } = require("./error");
const mongoose = require("mongoose");

function validateTopic(req, res, next) {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
  if (topic.length < 2 || topic.length > 200) return next(httpError(400, "Topic must be 2-200 characters"));
  req.body.topic = topic;
  next();
}

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return next(httpError(404, "Not found"));
  next();
}

module.exports = { validateTopic, validateId };
