// YouTube search without an API key (yt-search reads YouTube's public results page).
const yts = require("yt-search");

// ponytail: in-process cache, lost on restart; move to MongoDB if search volume grows.
const cache = new Map();

async function searchVideos(query, max = 2) {
  const key = query.toLowerCase();
  if (!cache.has(key)) {
    const { videos } = await yts(query);
    cache.set(key, videos.slice(0, max).map((v) => ({ videoId: v.videoId, title: v.title, author: v.author?.name })));
  }
  return cache.get(key);
}

module.exports = { searchVideos };
