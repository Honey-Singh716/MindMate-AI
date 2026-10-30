// health.test.js — verifies GET /api/health without auth always returns 200.
//
// This test spawns the real server on a dedicated port. It does NOT need
// PostgreSQL, Groq, or any env vars beyond what .env already provides.
// It is NOT skipped — it runs on every `npm test`.
//
// Regression guard: this test would have caught the Render 401 incident.
// If it ever fails with 401 it means the health route has been moved
// below the global auth guard in server.js, which must be reverted.

require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");

const PORT = 5201; // dedicated port — does not clash with dev server or other tests

function get(urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            { host: "127.0.0.1", port: PORT, method: "GET", path: urlPath },
            (res) => {
                let body = "";
                res.on("data", (c) => (body += c));
                res.on("end", () => {
                    let json = {};
                    try { json = JSON.parse(body); } catch { json = { raw: body }; }
                    resolve({ status: res.statusCode, json });
                });
            }
        );
        req.on("error", reject);
        req.setTimeout(15000, () => req.destroy(new Error("request timed out")));
        req.end();
    });
}

let serverProc;
let tempHistory;

async function startServer() {
    tempHistory = path.join(os.tmpdir(), `mindmate-health-test-${Date.now()}.json`);
    await fs.writeFile(tempHistory, JSON.stringify({ version: 2, conversations: [] }), "utf8");
    return new Promise((resolve, reject) => {
        serverProc = spawn("node", ["server.js"], {
            cwd: path.join(__dirname, ".."),
            env: {
                ...process.env,
                PORT: String(PORT),
                EMBEDDING_PROVIDER: "mock",
                HISTORY_FILE: tempHistory,
                // Intentionally omit DATABASE_URL to confirm health route
                // does NOT need the DB (it must respond before any DB call).
                DATABASE_URL: process.env.DATABASE_URL || "",
            },
            stdio: ["ignore", "pipe", "pipe"],
        });
        let ready = false;
        const onData = (chunk) => {
            if (!ready && chunk.toString().includes("is running at")) {
                ready = true;
                resolve();
            }
        };
        serverProc.stdout.on("data", onData);
        serverProc.stderr.on("data", onData);
        serverProc.on("error", reject);
        setTimeout(() => !ready && reject(new Error("server did not start within 12 s")), 12000);
    });
}

function stopServer() {
    if (serverProc) serverProc.kill("SIGTERM");
}

test("GET /api/health returns 200 with no Authorization header", async () => {
    await startServer();
    try {
        const res = await get("/api/health");

        // Must be 200 — never 401, never 404, never 500.
        assert.equal(res.status, 200,
            `Expected HTTP 200 but got ${res.status}. ` +
            `If this is 401 the health route has been moved below the auth guard. ` +
            `If this is 404 the route is missing. Body: ${JSON.stringify(res.json)}`
        );

        // Response shape validation.
        assert.equal(res.json.status, "ok", `Expected status "ok", got: ${JSON.stringify(res.json)}`);
        assert.equal(typeof res.json.uptime, "number", "uptime must be a number");
        assert.equal(typeof res.json.timestamp, "string", "timestamp must be a string");
        assert.match(res.json.timestamp, /^\d{4}-\d{2}-\d{2}T/, "timestamp must be ISO 8601");
    } finally {
        stopServer();
        if (tempHistory) await fs.rm(tempHistory, { force: true }).catch(() => {});
    }
});

test("GET /api/health responds in under 500 ms", async () => {
    await startServer();
    try {
        const start = Date.now();
        const res = await get("/api/health");
        const ms = Date.now() - start;
        assert.equal(res.status, 200);
        assert.ok(ms < 500, `Health check took ${ms} ms — expected under 500 ms`);
    } finally {
        stopServer();
        if (tempHistory) await fs.rm(tempHistory, { force: true }).catch(() => {});
    }
});
