# MindMate AI

An AI-powered learning assistant with chat, a study planner, dynamic Groq model
selection, and **RAG (Retrieval-Augmented Generation)** over your own uploaded
PDFs/notes.

## Features
- JWT login/signup, per-user conversation history, study-plan generator.
- Dynamic Groq model dropdown (models fetched live from Groq, cached, validated).
- **RAG**: upload PDFs, the app extracts text, chunks it, embeds the chunks, and
  stores them in PostgreSQL. When you ask a question with "Ask my docs" on, it
  retrieves the most relevant chunks and grounds the Groq answer in them, with
  document/page citations.

## Tech stack
- **Backend**: Node.js built-in `http` module (no Express), JWT auth, rate limiting.
- **Frontend**: React + Vite.
- **AI**: Groq chat completions (model selector).
- **Database**: PostgreSQL (`pg`).
- **PDF text extraction**: `pdf-parse` v2.
- **Embeddings**: `@xenova/transformers` (all-MiniLM-L6-v2, 384-dim, runs locally,
  free) — or a `mock` provider for offline testing.
- **Vector storage**: `pgvector` when available, with a JSONB fallback.

## Prerequisites
- Node.js 20.16+ (pdf-parse v2 requires this).
- PostgreSQL 13+.
- A Groq API key.
- (Recommended) the `pgvector` extension installed in your Postgres. If it is not
  installed, the app automatically falls back to JSONB storage with Node-side
  cosine ranking (works, but slower for large datasets).

## Setup

### 1. Backend
```powershell
npm install
cp .env.example .env   # then fill in real values
```

`.env` variables (see `.env.example`):
| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | yes | Groq API key (kept only on the backend). |
| `GROQ_MODEL` | no | Preferred default model (must exist among Groq's available models). |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `JWT_SECRET` | yes | A long random secret for signing JWTs. |
| `NODE_ENV` | no | `development`/`production`. |
| `MODELS_CACHE_TTL_MS` | no | Groq model-list cache TTL (default 900000). |
| `EMBEDDING_PROVIDER` | no | `local` (default, transformers.js) or `mock` (offline test). |
| `EMBEDDING_DIM` | no | Embedding dimension (default 384, matches MiniLM). |

### 2. Database / pgvector
Tables (`users`, `documents`, `chunks`) are created automatically on first use
with `CREATE ... IF NOT EXISTS` — no existing data is dropped.

To enable fast vector search, install `pgvector` once (so the `vector` type and
`<=>` cosine operator are available). The app runs `CREATE EXTENSION IF NOT EXISTS
vector;` at startup and uses it if present:
- **Ubuntu/Debian**: `sudo apt install postgresql-<ver>-pgvector` then in psql:
  `CREATE EXTENSION vector;`
- **Docker**: use the `pgvector/pgvector:pg16` image.
- **Managed** (Supabase/Neon): pgvector is available by default.

If pgvector is not installed, the app logs `rag_schema_vector: false` and stores
embeddings as JSONB, ranking with cosine similarity in Node (fine for
resume-scale data).

### 3. Frontend
```powershell
cd frontend
npm install
```

## Running
```powershell
# backend (root) — http://localhost:3000
npm run dev

# frontend (separate terminal) — http://localhost:5173, proxies /api -> :3000
cd frontend
npm run dev
```
Open `http://localhost:5173`, sign up, and start chatting.

## Using RAG
1. Go to the **Documents** tab and upload a PDF (max 5 MB, text-based PDFs only).
   The app extracts text, chunks it (~1000 chars, 150 overlap, page-aware), embeds
   each chunk, and stores it scoped to your account.
2. Go to **AI Chat**, type a question, and toggle **Ask my docs** before sending.
   The backend embeds your question, finds the most relevant chunks in **your**
   documents, and feeds them to Groq as reference material. The answer cites the
   source document and page where possible, and the UI lists the **Sources** used.
3. With **Ask my docs** off, normal chat is unchanged.

> Scanned PDFs (no extractable text) return a clear error — OCR is not supported.

## API (RAG endpoints)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | **none** | Health check — returns `{status:"ok", uptime, timestamp}`. Used by Render and UptimeRobot. |
| `POST` | `/api/documents` | yes (multipart `file`) | Upload + extract + chunk + embed + store; returns metadata + preview. |
| `GET` | `/api/documents` | yes | List the caller's documents. |
| `GET` | `/api/documents/:id` | yes | Get one document's metadata. |
| `DELETE` | `/api/documents/:id` | yes | Delete a document and its chunks (owner-scoped). |
| `POST` | `/api/conversations/:id/chat` | yes | Chat; send `rag: true` to answer from your documents (returns `sources`). |

## Security notes
- `GROQ_API_KEY`, `DATABASE_URL`, and `JWT_SECRET` stay server-side; they are
  never sent to the frontend.
- Every document/chunk row stores `owner_id`; all reads/writes/deletes are
  scoped to the authenticated user — a user cannot access another user's data.
- Uploads are validated by MIME type **and** the `%PDF-` file signature, capped
  at 5 MB, and processed in memory (never written to disk or a public folder).
- Only a 500-character preview is returned; the full document text is not exposed.
- SQL uses parameterized queries throughout.

## Notes for development / testing
- Set `EMBEDDING_PROVIDER=mock` to run the RAG pipeline offline without the
  model download (vectors are deterministic but **not** semantic — useful for
  wiring tests only).
- The first `local` embedding call downloads the MiniLM model (~25 MB) and caches
  it, so the first upload is slower.

## Tests
Unit tests run anywhere (no database, no model download) with `npm test`. They
cover chunking, mock embeddings + cosine retrieval, upload validation
(MIME/signature/field), `pdf-parse` extraction + malformed-PDF handling, input
validators, and the Groq model cache/probe with a stubbed SDK.

Opt-in integration tests need your PostgreSQL and are skipped by default:
```powershell
$env:RUN_INTEGRATION="1"; npm test
```
These exercise real DB storage + owner scoping (`test/rag-db.test.js`) and the
full HTTP flow over a spawned server (`test/http.test.js`), using mock embeddings
and the "no documents" RAG path so no Groq call is made.

To test the real `local` embedding model (downloads on first use):
```powershell
$env:RUN_LOCAL_EMBEDDING="1"; npm test
```

This is a learning/resume project. Do not put real credentials in `.env` or commit it.

---

## Deployment

### Backend — Render

The backend is deployed on [Render](https://render.com). A `render.yaml` is included at the repo root; Render reads it automatically when you connect the repository.

**First deploy steps:**
1. Push this repository to GitHub (already done).
2. In [Render Dashboard](https://dashboard.render.com) → **New → Web Service** → connect the GitHub repo.
3. Render detects `render.yaml` and pre-fills build/start commands.
4. In **Environment** tab, add the secret variables (they are marked `sync: false` in `render.yaml` so they are never committed):
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `CORS_ORIGIN` → set to your Vercel frontend URL, e.g. `https://mind-mate-ai-theta.vercel.app`
5. Click **Deploy**.

Render uses `GET /api/health` (declared in `render.yaml` as `healthCheckPath`) to verify a successful deploy.

### Frontend — Vercel

1. In [Vercel Dashboard](https://vercel.com) → **Import Project** → connect the GitHub repo, set **Root Directory** to `frontend`.
2. Add environment variable: `VITE_API_URL` → your Render backend URL, e.g. `https://mindmate-ai-cbdb.onrender.com`
3. Deploy.

---

## Health Check & Uptime Monitoring

### Health endpoint

```
GET /api/health
```

- **No authentication required.**
- **No database queries** — reads only `process.uptime()` and `new Date()`.
- Response (HTTP 200):
  ```json
  { "status": "ok", "uptime": 4217, "timestamp": "2026-10-27T14:05:00.000Z" }
  ```
- Response time: < 5 ms.
- Does **not** expose secrets, environment variables, or any internal state.

### Why this is needed

Render's **free tier** spins down a web service after **15 minutes of inactivity**. The next request after a cold start takes 30–60 seconds to respond, which makes the app feel broken for the first user. Pinging the health endpoint every **14 minutes** keeps the dyno warm.

> ⚠️ **Limitation**: Render free-tier dynos are allowed a maximum of **750 instance-hours per month**. Keeping a dyno awake 24/7 consumes all 720 of those hours. If you exceed the limit mid-month, Render suspends the service until the next billing cycle. For a portfolio project with light traffic this is acceptable; for production use, upgrade to the **Starter** plan ($7/month) which removes cold starts entirely.

### Configuring UptimeRobot (free — recommended)

UptimeRobot's free tier supports up to 50 monitors with a minimum interval of 5 minutes.

1. Create a free account at [https://uptimerobot.com](https://uptimerobot.com).
2. Click **Add New Monitor**.
3. Fill in the form:

   | Field | Value |
   |---|---|
   | Monitor Type | `HTTP(s)` |
   | Friendly Name | `MindMate AI – Health` |
   | URL | `https://mindmate-ai-cbdb.onrender.com/api/health` |
   | Monitoring Interval | `14 minutes` (or `15 minutes` — both work) |
   | Monitor Timeout | `30` seconds |
   | HTTP Method | `GET` |
   | Alert Contacts | your email (optional) |

4. Click **Create Monitor**.

UptimeRobot will now send `GET https://mindmate-ai-cbdb.onrender.com/api/health` every 14 minutes. Because Render spins down after 15 minutes of inactivity, a 14-minute ping interval keeps the dyno awake.

> **Your production backend URL is `https://mindmate-ai-cbdb.onrender.com`** — confirmed by the `VITE_API_URL` comment in `frontend/src/api.js`. Update the URL above if Render assigns a different hostname.

### Alternative: Cron-job.org (free, no signup friction)

If you prefer not to create a UptimeRobot account:

1. Go to [https://cron-job.org](https://cron-job.org) (free, no credit card).
2. Sign up → **CREATE CRONJOB**.
3. Set:
   - **URL**: `https://mindmate-ai-cbdb.onrender.com/api/health`
   - **Schedule**: every 14 minutes (use custom: `*/14 * * * *`)
   - **Request method**: `GET`
4. Save.

### Verifying the health endpoint locally

```powershell
# Start the backend
npm run dev

# In a second terminal — should print {"status":"ok","uptime":…,"timestamp":…}
curl http://localhost:3000/api/health
# or
Invoke-RestMethod http://localhost:3000/api/health
```

### Verifying the production endpoint

```powershell
# Replace with your actual Render URL
curl https://mindmate-ai-cbdb.onrender.com/api/health
```

Expected: HTTP 200 with `{"status":"ok","uptime":…,"timestamp":"…"}`.
If you get a timeout on first hit, the dyno was sleeping — wait 30–60 seconds and retry.
