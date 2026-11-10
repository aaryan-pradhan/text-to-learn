# Text-to-Learn

Type a topic and get a full course: 3–6 modules of 3–5 lessons each. Every lesson includes objectives, key topics, explanations, code examples, a YouTube video, a quiz and suggested readings. Lessons can also be explained in Hinglish (read aloud) and downloaded as a PDF.

**Live:** _LIVE_URL_ · **Repo:** https://github.com/aaryan-pradhan/text-to-learn

## Features

| Feature | How it works |
|---|---|
| Course generation | The AI writes a title, a description, tags and a module/lesson outline from one prompt. The outline is validated (3–6 modules, 3–5 lessons) and saved to MongoDB. |
| Lessons on demand | A lesson is written by the AI the first time it is opened, then stored, so it opens instantly after that. Simultaneous requests for the same lesson share one AI call. |
| Rich lesson content | Lessons are made of blocks: heading, paragraph, code, video, MCQ. Each block type has its own React component. |
| Videos | The server searches YouTube for each video block (keyless, via `yt-search`, cached) and embeds the result with `youtube-nocookie`. |
| Quizzes | Interactive MCQs with instant feedback and an explanation. |
| Hinglish | The AI translates a lesson into Hinglish, which is cached. The browser's built-in speech engine (Web Speech API) reads it aloud. |
| PDF export | A print-styled copy of the lesson is rendered with `html2canvas` and paged into an A4 PDF with `jsPDF`. |
| Auth | Google sign-in with Firebase Authentication (OAuth). The server checks the Firebase ID token on every API call, and each user sees only their own courses. |
| Persistence | Courses, modules and lessons are stored in MongoDB with Mongoose. |

Everything runs on free services that need no API key: Pollinations for the AI, `yt-search` for YouTube, the Web Speech API for audio, and Firebase's free tier for sign-in.

## Architecture

```
React (Vite, Tailwind, React Router)  ──fetch + Bearer ID token──▶  Express API  ──▶ MongoDB (Mongoose)
        │                                                    │
        └── Firebase Auth (Google)                           ├──▶ Pollinations AI (gpt-oss-20b, JSON mode)
                                                             └──▶ YouTube search (yt-search)
```

In production, a single Render web service serves both the API and the built React app, so there is one URL and no CORS setup.

### Server (`server/`)

| Path | Role |
|---|---|
| `app.js` | Builds the Express app. AI, auth and search are injectable so tests can swap them. |
| `models/` | `Course` → `Module` → `Lesson` (ObjectId references). `Course.creator` holds the Firebase uid. |
| `routes/`, `controllers/` | The REST endpoints below. |
| `middlewares/` | `auth.js` verifies the Firebase JWT with `jose` against Google's public keys. `validate.js` checks inputs. `error.js` is the central error handler. |
| `services/ai.js` | Chat calls in JSON mode, plus a throttle and retry for the free tier's 1-request-per-45 s limit. |
| `services/prompts.js` | Prompts for the course outline, the lesson and the Hinglish translation. |
| `utils/validate.js` | Cleans the AI output before it is saved (block types, MCQ answers, http(s) links). |

### API

All routes except health need `Authorization: Bearer <Firebase ID token>`.

| Method | Route | Does |
|---|---|---|
| GET | `/api/health` | Liveness check |
| POST | `/api/courses` | `{ topic }` → generate and save a course |
| GET | `/api/courses` | List my courses |
| GET | `/api/courses/:id` | One course with its modules and lessons |
| DELETE | `/api/courses/:id` | Delete a course and its modules and lessons |
| GET | `/api/courses/:id/modules/:m/lessons/:l` | Get a lesson, generating it on first open |
| POST | `/api/lessons/:id/hinglish` | Hinglish explanation (cached) |
| GET | `/api/youtube?query=` | Top YouTube results for a query |

### Client (`client/src/`)

- `pages/`: Login, Home (prompt and course list), Course (syllabus), Lesson.
- `components/`:
  - Sidebar.
  - PromptForm.
  - LessonRenderer, which maps each block type to a component in `blocks/`.
  - HinglishExplainer.
  - LessonPDFExporter.
  - LoadingSpinner and ErrorMessage.
- `context/AuthContext.jsx`: the Firebase user, with login and logout.
- `utils/api.js`: a fetch wrapper that attaches the ID token and unwraps errors.

## Run locally

You need Node 20+ and a MongoDB URI (a free Atlas M0 cluster works).

```bash
# API on :5000
cd server && cp .env.example .env   # set MONGO_URI
npm install && npm run dev

# React app on :5173 (proxies /api to :5000)
cd client && npm install && npm run dev
```

| Variable | Where | Meaning |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string |
| `FIREBASE_PROJECT_ID` | server | Firebase project whose ID tokens are accepted |
| `PORT` | server | Defaults to 5000 |
| `CLIENT_URL` | server | CORS origin, only needed if the client is hosted separately |
| `VITE_API_URL` | client | API base URL; leave empty for the same origin |

## Tests

```bash
cd server && npm test   # node:test + supertest + in-memory MongoDB
cd client && npm test   # Vitest + React Testing Library
```

- **Server tests:**
  - Auth rejection.
  - Input validation.
  - Course creation, listing, and isolation between users.
  - A lesson is generated once, even when requested concurrently.
  - Delete by owner only.
  - YouTube search.
  - Hinglish caching and ownership.
  - The AI output validators.
- **Client tests:** every block renders, MCQ feedback works, and the prompt form submits.

GitHub Actions runs both suites and the client build on every push.

## Deploy

1. On Render, choose **New → Blueprint** and pick this repo; `render.yaml` defines the free web service. Set `MONGO_URI` when prompted.
2. In Firebase → Authentication → Settings → Authorized domains, add the Render domain.

## Notes

- **Auth0 → Firebase.** The brief names Auth0. This project uses Firebase Authentication (Google OAuth) for the same flow: the frontend signs in, and the backend verifies a JWT and protects the routes.
- **Free-tier AI.** The keyless AI allows about one request every 45 seconds. Course creation and the first open of each lesson can take up to a minute; requests are queued and retried automatically.
- **Hinglish audio** uses the browser's speech engine, which avoids paid TTS keys. Voice quality depends on the browser and OS, and Chrome and Edge include Hindi voices.
