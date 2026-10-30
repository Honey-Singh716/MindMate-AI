const { Pool } = require("pg");
const crypto = require("node:crypto");

let pool;
let schemaReady;
let ragSchemaReady;
let conversationSchemaReady;
// Set to true once the pgvector extension is confirmed available; false means
// we store embeddings as JSONB and rank with cosine similarity in Node.
let useVector = null;

function getPool() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing.");
    }
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production"
                ? { rejectUnauthorized: false }
                : false,
        });
    }
    return pool;
}

async function ensureSchema() {
    if (!schemaReady) {
        schemaReady = getPool().query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `).catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    await schemaReady;
}

// RAG schema: documents + chunks. Uses pgvector for the embedding column when
// the extension is available; otherwise falls back to JSONB + Node-side cosine
// similarity (works on plain Postgres, fine for resume-scale data). Nothing
// existing is dropped — every statement is CREATE ... IF NOT EXISTS.
async function ensureRagSchema() {
    if (!ragSchemaReady) {
        ragSchemaReady = (async () => {
            await ensureSchema();

            try {
                await getPool().query("CREATE EXTENSION IF NOT EXISTS vector;");
                const ext = await getPool().query("SELECT 1 FROM pg_extension WHERE extname = 'vector'");
                useVector = ext.rowCount > 0;
            } catch {
                useVector = false;
            }
            console.info(JSON.stringify({ event: "rag_schema_vector", useVector }));

            const dim = Number(process.env.EMBEDDING_DIM) || 384;
            const embeddingType = useVector ? `vector(${dim})` : "JSONB";

            await getPool().query(`
                CREATE TABLE IF NOT EXISTS documents (
                    id UUID PRIMARY KEY,
                    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    filename TEXT NOT NULL,
                    size_bytes INTEGER NOT NULL,
                    total_pages INTEGER,
                    char_count INTEGER NOT NULL,
                    chunk_count INTEGER NOT NULL DEFAULT 0,
                    status TEXT NOT NULL DEFAULT 'ready',
                    error TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);
            await getPool().query(`
                CREATE TABLE IF NOT EXISTS chunks (
                    id UUID PRIMARY KEY,
                    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    page INTEGER,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding ${embeddingType},
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);
            await getPool().query("CREATE INDEX IF NOT EXISTS documents_owner_idx ON documents(owner_id)");
            await getPool().query("CREATE INDEX IF NOT EXISTS chunks_owner_idx ON chunks(owner_id)");
            await getPool().query("CREATE INDEX IF NOT EXISTS chunks_document_idx ON chunks(document_id)");
        })().catch((error) => {
            ragSchemaReady = null;
            throw error;
        });
    }
    await ragSchemaReady;
}

// ----------------------------- CONVERSATIONS --------------------------------
// Store conversations in PostgreSQL so they survive Render restarts / redeploys.
async function ensureConversationSchema() {
    if (!conversationSchemaReady) {
        conversationSchemaReady = (async () => {
            await ensureSchema();
            await getPool().query(`
                CREATE TABLE IF NOT EXISTS conversations (
                    id          UUID        PRIMARY KEY,
                    owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title       TEXT        NOT NULL DEFAULT 'New conversation',
                    pinned      BOOLEAN     NOT NULL DEFAULT FALSE,
                    summary     TEXT        NOT NULL DEFAULT '',
                    history     JSONB       NOT NULL DEFAULT '[]',
                    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);
            await getPool().query(
                "CREATE INDEX IF NOT EXISTS conversations_owner_idx ON conversations(owner_id)"
            );
        })().catch((error) => {
            conversationSchemaReady = null;
            throw error;
        });
    }
    await conversationSchemaReady;
}

function normalizeDbConversation(row) {
    if (!row) return null;
    return {
        id: row.id,
        ownerId: row.owner_id,
        title: row.title,
        pinned: row.pinned,
        summary: row.summary || "",
        history: Array.isArray(row.history)
            ? row.history
            : (typeof row.history === "string" ? JSON.parse(row.history) : []),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
}

async function createConversationRecord({ id, ownerId, title = "New conversation" }) {
    await ensureConversationSchema();
    const result = await getPool().query(
        `INSERT INTO conversations (id, owner_id, title)
         VALUES ($1, $2, $3)
         RETURNING id, owner_id, title, pinned, summary, history, created_at, updated_at`,
        [id, ownerId, title]
    );
    return normalizeDbConversation(result.rows[0]);
}

async function getConversationRecord(ownerId, id) {
    await ensureConversationSchema();
    const result = await getPool().query(
        `SELECT id, owner_id, title, pinned, summary, history, created_at, updated_at
         FROM conversations WHERE id = $1 AND owner_id = $2`,
        [id, ownerId]
    );
    return normalizeDbConversation(result.rows[0]);
}

async function listConversationRecords(ownerId) {
    await ensureConversationSchema();
    const result = await getPool().query(
        `SELECT id, owner_id, title, pinned, summary, history, created_at, updated_at
         FROM conversations WHERE owner_id = $1
         ORDER BY pinned DESC, updated_at DESC`,
        [ownerId]
    );
    return result.rows.map(normalizeDbConversation);
}

async function updateConversationRecord(ownerId, id, fields) {
    await ensureConversationSchema();
    const allowed = ["title", "pinned", "summary", "history"];
    const sets = [];
    const params = [];
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
            params.push(key === "history" ? JSON.stringify(fields[key]) : fields[key]);
            sets.push(`${key} = $${params.length}`);
        }
    }
    if (sets.length === 0) return null;
    sets.push("updated_at = NOW()");
    params.push(id, ownerId);
    const result = await getPool().query(
        `UPDATE conversations SET ${sets.join(", ")}
         WHERE id = $${params.length - 1} AND owner_id = $${params.length}
         RETURNING id, owner_id, title, pinned, summary, history, created_at, updated_at`,
        params
    );
    return normalizeDbConversation(result.rows[0]);
}

async function deleteConversationRecord(ownerId, id) {
    await ensureConversationSchema();
    const result = await getPool().query(
        "DELETE FROM conversations WHERE id = $1 AND owner_id = $2",
        [id, ownerId]
    );
    return (result.rowCount || 0) > 0;
}

// Format a JS number[] for the configured column type. For pgvector we pass the
// canonical vector text "[1,2,3]"; for JSONB we pass the array directly.
function toEmbeddingParam(arr) {
    return useVector ? `[${arr.map(Number).join(",")}]` : arr;
}

async function findUserByEmail(email) {
    await ensureSchema();
    const result = await getPool().query(
        "SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
        [email]
    );
    return result.rows[0] || null;
}

async function createUser({ id, email, passwordHash }) {
    await ensureSchema();
    const result = await getPool().query(
        `INSERT INTO users (id, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, created_at`,
        [id, email, passwordHash]
    );
    return result.rows[0];
}

// ----------------------------- RAG CRUD -------------------------------------
// Every function takes the authenticated user's id and scopes all reads/writes
// to it, so a user can never touch another user's documents or chunks.

async function createDocument({ id, ownerId, filename, sizeBytes, totalPages, charCount }) {
    await ensureRagSchema();
    const result = await getPool().query(
        `INSERT INTO documents (id, owner_id, filename, size_bytes, total_pages, char_count, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ready')
         RETURNING id, filename, size_bytes, total_pages, char_count, chunk_count, status, created_at`,
        [id, ownerId, filename, sizeBytes, totalPages, charCount]
    );
    return result.rows[0];
}

async function addChunks(documentId, ownerId, chunks) {
    await ensureRagSchema();
    if (!chunks.length) return;

    const BATCH_SIZE = 50;
    for (let start = 0; start < chunks.length; start += BATCH_SIZE) {
        const slice = chunks.slice(start, start + BATCH_SIZE);
        const values = [];
        const params = [];
        for (let i = 0; i < slice.length; i += 1) {
            const chunk = slice[i];
            const base = i * 7;
            values.push(`(${base + 1}, ${base + 2}, ${base + 3}, ${base + 4}, ${base + 5}, ${base + 6}, ${base + 7}${useVector ? "::vector" : "::jsonb"})`);
            params.push(
                crypto.randomUUID(),
                documentId,
                ownerId,
                chunk.page ?? null,
                chunk.index,
                chunk.text,
                toEmbeddingParam(chunk.embedding)
            );
        }
        await getPool().query(
            `INSERT INTO chunks (id, document_id, owner_id, page, chunk_index, content, embedding)
             VALUES ${values.join(", ")}`,
            params
        );
    }
    await getPool().query(
        "UPDATE documents SET chunk_count = $1 WHERE id = $2 AND owner_id = $3",
        [chunks.length, documentId, ownerId]
    );
}

async function listDocuments(ownerId) {
    await ensureRagSchema();
    const result = await getPool().query(
        `SELECT id, filename, size_bytes, total_pages, char_count, chunk_count, status, created_at
         FROM documents WHERE owner_id = $1 ORDER BY created_at DESC`,
        [ownerId]
    );
    return result.rows;
}

async function getDocument(ownerId, documentId) {
    await ensureRagSchema();
    const result = await getPool().query(
        `SELECT id, filename, size_bytes, total_pages, char_count, chunk_count, status, created_at
         FROM documents WHERE id = $1 AND owner_id = $2`,
        [documentId, ownerId]
    );
    return result.rows[0] || null;
}

async function deleteDocument(ownerId, documentId) {
    await ensureRagSchema();
    const result = await getPool().query(
        "DELETE FROM documents WHERE id = $1 AND owner_id = $2",
        [documentId, ownerId]
    );
    return (result.rowCount || 0) > 0;
}

// Used by tests/seed scripts to remove test accounts. Via ON DELETE CASCADE
// this also removes their documents and chunks. Not exposed over HTTP.
async function deleteUserByEmail(email) {
    await ensureSchema();
    await getPool().query("DELETE FROM users WHERE email = $1", [email]);
}

async function close() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

function cosine(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i += 1) {
        const av = a[i] || 0;
        const bv = b[i] || 0;
        dot += av * bv;
        na += av * av;
        nb += bv * bv;
    }
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Returns the most relevant chunks for a question embedding, scoped to the
// user. With pgvector: ORDER BY embedding <=> query (cosine distance). Without
// pgvector: fetch the user's chunks and rank with cosine similarity in Node.
async function retrieveChunks(ownerId, queryEmbedding, { documentIds = null, topK = 5 } = {}) {
    await ensureRagSchema();

    if (useVector) {
        const queryVec = toEmbeddingParam(queryEmbedding);
        const params = [queryVec, ownerId];
        let filterIds = "";
        if (Array.isArray(documentIds) && documentIds.length) {
            filterIds = " AND c.document_id = ANY($3)";
            params.push(documentIds);
        }
        params.push(topK);
        const limitParam = `$${params.length}`;
        const result = await getPool().query(
            `SELECT c.content, c.page, d.id AS document_id, d.filename,
                    1 - (c.embedding <=> $1::vector) AS score
             FROM chunks c JOIN documents d ON d.id = c.document_id
             WHERE c.owner_id = $2${filterIds}
             ORDER BY c.embedding <=> $1::vector
             LIMIT ${limitParam}`,
            params
        );
        return result.rows.map((r) => ({
            content: r.content,
            page: r.page,
            documentId: r.document_id,
            filename: r.filename,
            score: r.score,
        }));
    }

    const params = [ownerId];
    let filterIds = "";
    if (Array.isArray(documentIds) && documentIds.length) {
        filterIds = " AND c.document_id = ANY($2)";
        params.push(documentIds);
    }
    const result = await getPool().query(
        `SELECT c.content, c.page, c.embedding, d.id AS document_id, d.filename
         FROM chunks c JOIN documents d ON d.id = c.document_id
         WHERE c.owner_id = $1${filterIds}`,
        params
    );
    const scored = result.rows.map((r) => {
        const emb = Array.isArray(r.embedding) ? r.embedding : JSON.parse(r.embedding || "[]");
        return {
            content: r.content,
            page: r.page,
            documentId: r.document_id,
            filename: r.filename,
            score: cosine(queryEmbedding, emb),
        };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
}

module.exports = {
    createUser,
    findUserByEmail,
    deleteUserByEmail,
    createDocument,
    addChunks,
    listDocuments,
    getDocument,
    deleteDocument,
    retrieveChunks,
    createConversationRecord,
    getConversationRecord,
    listConversationRecords,
    updateConversationRecord,
    deleteConversationRecord,
    close,
};
