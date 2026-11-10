// Text generation through Pollinations' OpenAI-compatible endpoint.
// Free, no API key, open-source model (gpt-oss-20b). Override with AI_URL / AI_MODEL.
// The keyless tier allows one reply every ~45 s per IP, so calls are serialised and spaced.
const AI_URL = process.env.AI_URL || "https://text.pollinations.ai/openai";
const AI_MODEL = process.env.AI_MODEL || "openai";
const MIN_GAP_MS = Number(process.env.AI_MIN_GAP_MS ?? 46_000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pull the first JSON object out of a reply, tolerating ```json fences or stray text.
function parseJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("AI reply had no JSON object");
  return JSON.parse(text.slice(start, end + 1));
}

async function chat(prompt) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_MODEL,
      reasoning_effort: "low", // reasoning tokens count against the free tier's 1500-token cap
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const body = await res.text();
    const wait = Number(body.match(/Retry after (\d+)s/)?.[1] ?? 0) * 1000;
    throw Object.assign(new Error(`AI request failed: ${res.status}`), {
      retry: res.status === 402 || res.status === 429 || res.status >= 500 || /output_token_limit/.test(body),
      wait,
    });
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// ponytail: one global queue for the whole process; per-user queues only if a paid key is added.
let queue = Promise.resolve();
let lastCall = 0;
function throttled(fn) {
  const run = queue.then(async () => {
    await sleep(Math.max(0, lastCall + MIN_GAP_MS - Date.now()));
    try {
      return await fn();
    } finally {
      lastCall = Date.now();
    }
  });
  queue = run.catch(() => {});
  return run;
}

// Ask for JSON; retry on rate limits, server errors and unparseable replies.
async function generateJSON(prompt, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      return parseJSON(await throttled(() => chat(prompt)));
    } catch (err) {
      if (i >= tries || err.retry === false) throw err;
      await sleep(err.wait || 0);
    }
  }
}

module.exports = { generateJSON, parseJSON, chat };
