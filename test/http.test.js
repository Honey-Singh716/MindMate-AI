// Integration test: full HTTP flow over the real server (auth, upload, owner
// scoping, RAG chat "no documents" path). Uses mock embeddings so no model
// download is needed and does NOT call Groq. Skipped unless RUN_INTEGRATION=1.
require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");

const enabled = process.env.RUN_INTEGRATION === "1";
const skip = enabled ? false : "set RUN_INTEGRATION=1 (and ensure PostgreSQL is running) to run";

const PORT = 5199; // dedicated test port to avoid clashing with dev server

function makeTextPdf(text) {
    const stream = `BT /F1 24 Tf 72 720 Td (${text}) Tj ET`;
    const objs = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
        `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [];
    for (const obj of objs) {
        offsets.push(Buffer.byteLength(pdf, "latin1"));
        pdf += obj;
    }
    const xrefStart = Buffer.byteLength(pdf, "latin1");
    let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) xref += String(off).padStart(10, "0") + " 00000 n \n";
    pdf += xref + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, "latin1");
}

let serverProc;
let tempHistory;

async function startServer() {
    tempHistory = path.join(os.tmpdir(), `mindmate-test-history-${Date.now()}.json`);
    await fs.writeFile(tempHistory, JSON.stringify({ version: 2, conversations: [] }), "utf8");
    return new Promise((resolve, reject) => {
        serverProc = spawn("node", ["server.js"], {
            cwd: path.join(__dirname, ".."),
            env: { ...process.env, PORT: String(PORT), EMBEDDING_PROVIDER: "mock", HISTORY_FILE: tempHistory },
            stdio: ["ignore", "pipe", "pipe"],
        });
        let started = false;
        const onLine = (chunk) => {
            const line = chunk.toString();
            if (!started && line.includes("is running at")) {
                started = true;
                resolve();
            }
        };
        serverProc.stdout.on("data", onLine);
        serverProc.stderr.on("data", onLine);
        serverProc.on("error", reject);
        setTimeout(() => !started && reject(new Error("server did not start in time")), 15000);
    });
}

function stopServer() {
    if (serverProc) serverProc.kill("SIGTERM");
}

function req(method, urlPath, { token, contentType, body } = {}) {
    return new Promise((resolve, reject) => {
        const headers = {};
        if (contentType) headers["Content-Type"] = contentType;
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (body) headers["Content-Length"] = Buffer.byteLength(body);
        const r = http.request({ host: "127.0.0.1", port: PORT, method, path: urlPath, headers }, (res) => {
            let data = "";
            res.on("data", (c) => (data += c.toString("latin1")));
            res.on("end", () => {
                let json = {};
                try { json = JSON.parse(data); } catch { json = { raw: data }; }
                resolve({ status: res.statusCode, json });
            });
        });
        r.on("error", reject);
        r.setTimeout(30000, () => r.destroy(new Error("timeout")));
        if (body) r.write(body);
        r.end();
    });
}

const json = (obj) => ({ contentType: "application/json", body: Buffer.from(JSON.stringify(obj)) });
const multipart = (field, filename, mime, buffer) => {
    const boundary = "----mindmatehttpboundary";
    const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`, "latin1");
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, "latin1");
    return { contentType: `multipart/form-data; boundary=${boundary}`, body: Buffer.concat([head, buffer, tail]) };
};

async function signupLogin(email) {
    await req("POST", "/api/auth/signup", json({ email, password: "password123" }));
    const login = await req("POST", "/api/auth/login", json({ email, password: "password123" }));
    return login.json.token;
}

test("HTTP RAG flow + owner scoping", { skip }, async () => {
    await startServer();
    const stamp = Date.now();
    const emailA = `raghttp-a-${stamp}@example.com`;
    const emailB = `raghttp-b-${stamp}@example.com`;
    let docId;
    let convB;
    try {
        // Missing and invalid JWTs are rejected
        assert.equal((await req("GET", "/api/documents")).status, 401);
        assert.equal((await req("GET", "/api/documents", { token: "not-a-jwt" })).status, 401);

        const tokenA = await signupLogin(emailA);
        const tokenB = await signupLogin(emailB);

        // A uploads a PDF (mock embeddings, no model download)
        const up = await req("POST", "/api/documents", { token: tokenA, ...multipart("file", "note.pdf", "application/pdf", makeTextPdf("Owner scoping test page")) });
        assert.equal(up.status, 201);
        docId = up.json.id;
        assert.ok(docId);
        assert.ok((up.json.preview || "").includes("Owner scoping test"));

        // A sees it, B does not
        assert.ok((await req("GET", "/api/documents", { token: tokenA })).json.documents.some((d) => d.id === docId));
        assert.equal((await req("GET", "/api/documents", { token: tokenB })).json.documents.length, 0);

        // B cannot fetch or delete A's document
        assert.equal((await req("GET", `/api/documents/${docId}`, { token: tokenB })).status, 404);
        assert.equal((await req("DELETE", `/api/documents/${docId}`, { token: tokenB })).status, 404);

        // A deletes its own document
        assert.equal((await req("DELETE", `/api/documents/${docId}`, { token: tokenA })).status, 200);

        // RAG chat "no documents" path for B (no Groq call): returns the no-docs answer
        convB = await req("POST", "/api/conversations", { token: tokenB, ...json({}) });
        assert.equal(convB.status, 201);
        const chat = await req("POST", `/api/conversations/${convB.json.conversation.id}/chat`, {
            token: tokenB,
            ...json({ message: "what is in my documents?", rag: true }),
        });
        assert.equal(chat.status, 200);
        assert.match(chat.json.answer, /could not|couldn't find/i);
        assert.deepEqual(chat.json.sources, []);
    } finally {
        stopServer();
        if (tempHistory) await fs.rm(tempHistory, { force: true });
        // clean up test users (cascade removes any leftover docs/chunks)
        const db = require("../db");
        await db.deleteUserByEmail(emailA).catch(() => {});
        await db.deleteUserByEmail(emailB).catch(() => {});
        await db.close().catch(() => {});
    }
});
