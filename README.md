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
