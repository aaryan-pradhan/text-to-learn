const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/error");

// Dependencies are injectable so tests can swap the AI, auth and search.
function createApp(deps = {}) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
