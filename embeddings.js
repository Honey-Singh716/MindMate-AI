require("dotenv").config();

// all-MiniLM-L6-v2 produces 384-dim vectors. This MUST stay in sync with the
// vector(N) column created by the RAG schema migration in db.js.
const EMBEDDING_DIM = 384;

let pipelinePromise = null;

function getProvider() {
    return (process.env.EMBEDDING_PROVIDER || "local").toLowerCase();
}

// ----------------------------- "mock" provider ------------------------------
// Deterministic bag-of-words hashing vectors. NOT semantic, but needs no
// download and no API key, so the whole RAG pipeline can be tested offline.
// Cosine similarity reflects shared words (keyword overlap), which is enough
// to verify retrieval wiring end-to-end.
function hash32(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
}

function mockEmbed(text) {
    const vec = new Array(EMBEDDING_DIM).fill(0);
    const tokens = String(text || "").toLowerCase().split(/\s+/).filter(Boolean);
    for (const token of tokens) {
        vec[hash32(token) % EMBEDDING_DIM] += 1;
        vec[hash32(token + "#") % EMBEDDING_DIM] += 0.5;
    }
    let norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (!norm) norm = 1;
    return vec.map((v) => v / norm);
}

async function mockEmbedBatch(texts) {
    return texts.map(mockEmbed);
}

// ---------------------------- "local" provider -------------------------------
// transformers.js running all-MiniLM-L6-v2 fully in Node (free, no API key).
// The model (~25MB, quantized) is downloaded and cached on first use.
async function getPipeline() {
    if (!pipelinePromise) {
        pipelinePromise = (async () => {
            const transformers = await import("@xenova/transformers");
            return transformers.pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });
        })();
    }
    return pipelinePromise;
}

async function localEmbedBatch(texts) {
    const extractor = await getPipeline();
    const output = await extractor(texts, { pooling: "mean", normalize: true });
    let list = output.tolist();
    if (list.length && !Array.isArray(list[0])) {
        list = [list]; // a single-result 1D tensor -> 2D
    }
    return list.map((row) => Array.from(row));
}

// ------------------------------- public API ---------------------------------
async function embedTexts(texts) {
    const input = (Array.isArray(texts) ? texts : [texts]).map((t) => String(t ?? ""));
    const provider = getProvider();
    if (provider === "mock") return mockEmbedBatch(input);
    if (provider === "local") return localEmbedBatch(input);
    throw new Error(`Unknown EMBEDDING_PROVIDER "${provider}". Use "local" or "mock".`);
}

async function embedText(text) {
    return (await embedTexts([text]))[0];
}

module.exports = {
    EMBEDDING_DIM,
    embedTexts,
    embedText,
};
