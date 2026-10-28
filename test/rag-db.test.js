// Integration test: RAG storage + owner scoping against a real PostgreSQL.
// Skipped unless RUN_INTEGRATION=1 (and PostgreSQL is reachable via DATABASE_URL).
require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");

const enabled = process.env.RUN_INTEGRATION === "1";
const skip = enabled ? false : "set RUN_INTEGRATION=1 (and ensure PostgreSQL is running) to run";

const db = require("../db");

// A 384-dim unit vector (non-zero, so cosine is well-defined in both paths).
function unit() {
    const v = new Array(384).fill(0);
    v[0] = 1;
    return v;
}

async function makeUser(email) {
    return db.createUser({ id: crypto.randomUUID(), email, passwordHash: await bcrypt.hash("password123", 10) });
}

test("owner scoping: a user cannot see, retrieve, or delete another user's documents", { skip }, async () => {
    const a = await makeUser("ragtest-a@example.com");
    const b = await makeUser("ragtest-b@example.com");
    try {
        const doc = await db.createDocument({
            id: crypto.randomUUID(),
            ownerId: a.id,
            filename: "a.pdf",
            sizeBytes: 100,
            totalPages: 1,
            charCount: 50,
        });
        await db.addChunks(doc.id, a.id, [{ text: "alpha chunk", page: 1, index: 0, embedding: unit() }]);

        // A sees it, B does not
        assert.ok((await db.listDocuments(a.id)).some((d) => d.id === doc.id));
        assert.equal((await db.listDocuments(b.id)).length, 0);

        // B cannot fetch or delete A's document
        assert.equal(await db.getDocument(b.id, doc.id), null);
        assert.equal(await db.deleteDocument(b.id, doc.id), false);

        // Retrieval is scoped: A gets A's chunk, B gets nothing
        assert.ok((await db.retrieveChunks(a.id, unit(), { topK: 5 })).some((c) => c.documentId === doc.id));
        assert.equal((await db.retrieveChunks(b.id, unit(), { topK: 5 })).length, 0);

        // A can delete its own document
        assert.equal(await db.deleteDocument(a.id, doc.id), true);
        assert.equal((await db.listDocuments(a.id)).length, 0);
    } finally {
        await db.deleteUserByEmail("ragtest-a@example.com");
        await db.deleteUserByEmail("ragtest-b@example.com");
        await db.close();
    }
});
