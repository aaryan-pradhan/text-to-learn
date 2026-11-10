const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/error");
const { requireAuth } = require("./middlewares/auth");
const courseController = require("./controllers/courseController");
const lessonController = require("./controllers/lessonController");
const courseRoutes = require("./routes/courses");
const youtubeRoutes = require("./routes/youtube");

// Dependencies are injectable so tests can swap the AI, auth and search.
function createApp({ ai = require("./services/ai"), verify, search = require("./services/youtube").searchVideos } = {}) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
  app.use(express.json({ limit: "100kb" }));

  const auth = requireAuth(verify);
  const courses = courseController(ai);
  const lessons = lessonController(ai, courses.ownCourse);

  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/courses", courseRoutes({ auth, courses, lessons }));
  app.use("/api/youtube", youtubeRoutes({ auth, search }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
