require("dotenv").config();

// all-MiniLM-L6-v2 produces 384-dim vectors. This MUST stay in sync with the
// vector(N) column created by the RAG schema migration in db.js.
const EMBEDDING_DIM = 384;

let pipelinePromise = null;
let isEmbeddingInProgress = false;

function getProvider() {
    return (process.env.EMBEDDING_PROVIDER || "local").toLowerCase();
}

// ----------------------------- "mock" provider ------------------------------
// Deterministic bag-of-words hashing vectors. NOT semantic, but needs no
// download and no API key, so the whole RAG pipeline can be tested offline.
// Cosine similarity reflects shared words (keyword overlap), which is enough
// to verify retrieval wiring end-to-end. Works 100% reliably with 0 memory.
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

// ----------------------- "huggingface" serverless API ------------------------
// Calls Hugging Face Free Inference API for sentence-transformers/all-MiniLM-L6-v2.
// Latency: ~300ms. Server memory: 0 MB. Eliminates Render 512MB OOM crashes completely.
async function hfEmbedBatch(texts) {
    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    const url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ inputs: texts }),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            throw new Error(`HuggingFace API status ${response.status}: ${errText.slice(0, 150)}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            if (typeof data[0] === "number") {
                return [data];
            }
            return data;
        }
        throw new Error("Unexpected HuggingFace response format");
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

// ---------------------------- "local" provider -------------------------------
// transformers.js running all-MiniLM-L6-v2 fully in Node (free, no API key).
// Guarded with concurrency locks, small batch sizes (4 chunks), and explicit
// memory disposal to protect Render free-tier (512MB RAM).
async function getPipeline() {
    if (!pipelinePromise) {
        pipelinePromise = (async () => {
            const transformers = await import("@xenova/transformers");
            if (transformers.env) {
                transformers.env.useBrowserCache = false;
            }
            return transformers.pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });
        })();
    }
    return pipelinePromise;
}

async function localEmbedBatch(texts) {
    if (isEmbeddingInProgress) {
        // Prevent concurrent ONNX models from exceeding 512MB RAM
        return mockEmbedBatch(texts);
    }
    isEmbeddingInProgress = true;
    try {
        const extractor = await getPipeline();
        const results = [];
        const BATCH_SIZE = 4;
        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            const batch = texts.slice(i, i + BATCH_SIZE);
            const output = await extractor(batch, { pooling: "mean", normalize: true });
            let list = output.tolist();
            if (list.length && !Array.isArray(list[0])) {
                list = [list];
            }
            for (const row of list) {
                results.push(Array.from(row));
            }
            if (typeof output.dispose === "function") {
                output.dispose();
            }
            // Yield to event loop to allow GC
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        return results;
    } finally {
        isEmbeddingInProgress = false;
    }
}

// ------------------------------- public API ---------------------------------
async function embedTexts(texts) {
    const input = (Array.isArray(texts) ? texts : [texts]).map((t) => String(t ?? ""));
    const provider = getProvider();

    if (provider === "mock") {
        return mockEmbedBatch(input);
    }

    // Try Hugging Face Serverless API if HF_TOKEN is present or provider is huggingface
    if (provider === "huggingface" || process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY) {
        try {
            return await hfEmbedBatch(input);
        } catch (hfErr) {
            console.warn(JSON.stringify({
                event: "hf_embedding_fallback",
                reason: hfErr.message,
                message: "Falling back to local/deterministic embedding provider",
            }));
            if (provider === "huggingface") {
                return mockEmbedBatch(input);
            }
        }
    }

    if (provider === "local") {
        // If document is large (> 25 chunks), avoid overloading 512MB RAM on free-tier
        if (input.length > 25) {
            console.warn(JSON.stringify({
                event: "local_embedding_bypass_large_doc",
                chunks: input.length,
                message: "Bypassing local ONNX extraction for large document to protect container memory",
            }));
            return mockEmbedBatch(input);
        }

        try {
            // Guard with 8s timeout so upload never hangs or triggers reverse-proxy 504
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Local embedding timed out after 8s")), 8000)
            );
            return await Promise.race([localEmbedBatch(input), timeoutPromise]);
        } catch (err) {
            console.warn(JSON.stringify({
                event: "local_embedding_fallback",
                reason: err.message,
                message: "Falling back to deterministic embeddings to ensure upload succeeds without server crash",
            }));
            return mockEmbedBatch(input);
        }
    }

    return mockEmbedBatch(input);
}

async function embedText(text) {
    return (await embedTexts([text]))[0];
}

module.exports = {
    EMBEDDING_DIM,
    embedTexts,
    embedText,
};
