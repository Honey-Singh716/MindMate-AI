// health.test.js — regression tests for GET /api/health and HEAD /api/health.
//
// Root cause of the UptimeRobot 401 incident (Oct 31 2026):
// UptimeRobot sends HEAD requests by default, not GET. The route only matched
// GET, so HEAD fell through to the global auth guard → 401 Unauthorized.
// Fix: the route now matches both GET and HEAD.
//
// These tests spawn the real server on a dedicated port.
// They do NOT need PostgreSQL, Groq, or any paid services.
// They are NOT skipped — they run on every `npm test`.

require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");

const PORT = 5201;

function httpRequest(method, urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            { host: "127.0.0.1", port: PORT, method, path: urlPath },
            (res) => {
                let body = "";
                res.on("data", (c) => (body += c));
                res.on("end", () => {
                    let json = {};
                    try { json = JSON.parse(body); } catch { json = { raw: body }; }
                    resolve({ status: res.statusCode, headers: res.headers, json, body });
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
        setTimeout(() => !ready && reject(new Error("server did not start within 12s")), 12000);
    });
}

function stopServer() {
    if (serverProc) { serverProc.kill("SIGTERM"); serverProc = null; }
}

// --- GET ---
test("GET /api/health returns 200 with no Authorization header", async () => {
    await startServer();
    try {
        const res = await httpRequest("GET", "/api/health");
        assert.equal(res.status, 200,
            `Expected 200 got ${res.status}. If 401: route is below auth guard. Body: ${JSON.stringify(res.json)}`
        );
        assert.equal(res.json.status, "ok");
        assert.equal(typeof res.json.uptime, "number");
        assert.match(res.json.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    } finally { stopServer(); await fs.rm(tempHistory, { force: true }).catch(() => {}); }
});

// --- HEAD (this is what UptimeRobot sends by default) ---
test("HEAD /api/health returns 200 with no body — matches UptimeRobot behaviour", async () => {
    await startServer();
    try {
        const res = await httpRequest("HEAD", "/api/health");

        // This assertion would have caught the Oct 31 2026 incident.
        // If it fails with 401, the HEAD method is not handled before the auth guard.
        assert.equal(res.status, 200,
            `HEAD /api/health returned ${res.status}. ` +
            `UptimeRobot sends HEAD — if this is 401 the route does not handle HEAD. ` +
            `Body: ${res.body}`
        );

        // HEAD responses must have correct Content-Type but empty body (HTTP spec).
        assert.match(res.headers["content-type"] || "", /application\/json/,
            "Content-Type header should be application/json even for HEAD"
        );
        assert.equal(res.body, "",
            "HEAD response must have an empty body per HTTP spec"
        );
    } finally { stopServer(); await fs.rm(tempHistory, { force: true }).catch(() => {}); }
});

// --- Response time ---
test("GET /api/health responds in under 500 ms", async () => {
    await startServer();
    try {
        const start = Date.now();
        const res = await httpRequest("GET", "/api/health");
        const ms = Date.now() - start;
        assert.equal(res.status, 200);
        assert.ok(ms < 500, `Health check took ${ms} ms — expected under 500 ms`);
    } finally { stopServer(); await fs.rm(tempHistory, { force: true }).catch(() => {}); }
});
