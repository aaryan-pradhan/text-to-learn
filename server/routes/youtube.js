const router = require("express").Router;
const { httpError } = require("../middlewares/error");

// GET /api/youtube?query=... -> [{ videoId, title, author }]
module.exports = ({ auth, search }) => {
  const r = router();
  r.get("/", auth, (req, res, next) => {
    const query = String(req.query.query || "").trim();
    if (!query || query.length > 200) return next(httpError(400, "query is required"));
    search(query).then((videos) => res.json(videos), next);
  });
  return r;
};
