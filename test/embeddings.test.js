// Unit tests for the mock embedding provider (no download, no API key).
process.env.EMBEDDING_PROVIDER = "mock";

const test = require("node:test");
const assert = require("node:assert/strict");
const embeddings = require("../embeddings");

test("mock embeddings are 384-dim and L2-normalized", async () => {
    const [v] = await embeddings.embedTexts(["react hooks"]);
    assert.equal(v.length, 384);
    const norm = v.reduce((s, x) => s + x * x, 0);
    assert.ok(Math.abs(norm - 1) < 1e-6, `expected unit norm, got ${norm}`);
});

test("embedText returns a single 384-dim vector", async () => {
    const v = await embeddings.embedText("hello world");
    assert.equal(v.length, 384);
});

test("mock retrieval ranks the matching chunk first", async () => {
    const texts = [
        "React hooks useEffect state",
        "PostgreSQL index performance tuning",
        "Node.js http server streams",
    ];
    const vecs = await embeddings.embedTexts(texts);
    const q = await embeddings.embedText("react hooks state");
    const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
    const scores = vecs.map((v) => dot(v, q));
    const top = scores.indexOf(Math.max(...scores));
    assert.match(texts[top], /React hooks/);
});

// The "local" provider (transformers.js) downloads a ~25MB model on first use.
// Run it explicitly with: RUN_LOCAL_EMBEDDING=1 npm test
test("local provider produces a 384-dim vector", { skip: process.env.RUN_LOCAL_EMBEDDING === "1" ? false : "set RUN_LOCAL_EMBEDDING=1 (downloads model)" }, async () => {
    process.env.EMBEDDING_PROVIDER = "local";
    // Re-require a fresh module instance so provider selection re-reads env.
    delete require.cache[require.resolve("../embeddings")];
    const local = require("../embeddings");
    const v = await local.embedText("semantic search test");
    assert.equal(v.length, 384);
});
