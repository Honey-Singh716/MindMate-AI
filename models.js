require("dotenv").config();

const { Groq } = require("groq-sdk");

// How long the cached model list is considered fresh. Configure via the
// MODELS_CACHE_TTL_MS environment variable (milliseconds). Default: 15 minutes,
// which is a reasonable balance between responsiveness and not hammering Groq.
const MODELS_CACHE_TTL_MS =
    Number(process.env.MODELS_CACHE_TTL_MS) > 0
        ? Number(process.env.MODELS_CACHE_TTL_MS)
        : 15 * 60 * 1000;

const MODELS_LIST_TIMEOUT_MS = 10_000;
const PROBE_TIMEOUT_MS = 12_000;
const PROBE_MAX_TOKENS = 1;

const MOCK_MODE = /^(1|true|yes)$/i.test(process.env.MOCK_MODE || "");

let groqClient = null;
let cache = null; // { models: [...], fetchedAt: number }
let inflight = null; // de-dupes concurrent refreshes

function logError(message, error) {
    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "models_error",
        message,
        error: error?.message || String(error),
    }));
}

function getGroqClient() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing.");
    }
    if (!groqClient) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

function toPublicModel(model) {
    return {
        id: model.id,
        ownedBy: typeof model.owned_by === "string" ? model.owned_by : null,
        created: Number.isFinite(model.created) ? model.created : null,
        // The live Groq API returns these, even though the SDK's type defs omit them.
        contextWindow: Number.isFinite(model.context_window) ? model.context_window : null,
        active: typeof model.active === "boolean" ? model.active : true,
    };
}

function mockModels() {
    return [{
        id: process.env.GROQ_MODEL || "mock-chat-model",
        ownedBy: "MindMate AI",
        created: null,
        contextWindow: null,
        active: true,
    }];
}

// Decide whether a model can answer chat completions by sending a tiny request.
// We never hardcode model IDs: Groq's /models list has no "modality" field and
// mixes chat models with speech-to-text / text-to-speech / router models. Probing
// is the only fully dynamic way to keep the picker accurate.
//
// Returns true  -> chat capable (or transiently inconclusive; we keep it rather
//                  than risk hiding a working model behind a temporary failure).
// Returns false -> the model definitively rejected a chat request.
async function probeChatCapable(client, modelId) {
    try {
        await client.chat.completions.create(
            {
                model: modelId,
                messages: [{ role: "user", content: "ping" }],
                max_tokens: PROBE_MAX_TOKENS,
            },
            { timeout: PROBE_TIMEOUT_MS, maxRetries: 0 }
        );
        return true;
    } catch (error) {
        const status = error?.status ?? null;
        // 400 (model does not support chat) / 404 (retired) / 403 (not permitted)
        // are authoritative rejections -> drop the model.
        if (status === 400 || status === 404 || status === 403) {
            return false;
        }
        // 429 (rate limited), 5xx, network and timeout errors are transient.
        // A 429 specifically means the request reached the model and was queued,
        // which is strong evidence the model *is* chat capable. Keep it.
        return true;
    }
}

async function refreshModelsCache() {
    const client = getGroqClient();
    const list = await client.models.list({ timeout: MODELS_LIST_TIMEOUT_MS, maxRetries: 1 });
    const all = Array.isArray(list?.data) ? list.data : [];

    // Cheap pre-filter: Groq marks retired/deprecated models active:false when
    // the field is present. If absent, keep every candidate and let probing decide.
    const candidates = all
        .filter((model) => model && typeof model.id === "string")
        .filter((model) => (typeof model.active === "boolean" ? model.active === true : true));

    const probes = await Promise.allSettled(
        candidates.map((model) => probeChatCapable(client, model.id))
    );

    const models = candidates
        .map((model, index) => ({ model, probe: probes[index] }))
        .filter(({ probe }) => probe.status === "fulfilled" && probe.value === true)
        .map(({ model }) => toPublicModel(model))
        .sort((a, b) => a.id.localeCompare(b.id));

    if (models.length === 0) {
        throw new Error("No chat-capable models are currently available from Groq.");
    }

    cache = { models, fetchedAt: Date.now() };
    return { models: cache.models, stale: false, fetchedAt: cache.fetchedAt };
}

function triggerRefresh() {
    if (inflight) return inflight;
    inflight = refreshModelsCache()
        .catch((error) => {
            logError("refresh_failed", error);
            throw error; // rethrow so callers can fall back to stale cache
        })
        .finally(() => { inflight = null; });
    return inflight;
}

// Public entry point for the /api/models endpoint.
//
// - Uses the cache while fresh.
// - On a stale cache (and not an explicit refresh) serves the stale list
//   immediately and refreshes in the background (stale-while-revalidate),
//   marking the response stale:true so the UI can warn it may be outdated.
// - On explicit refresh or when there is no cache, awaits a fresh fetch.
// - If a fresh fetch fails and a (stale) cache exists, returns it with
//   stale:true and a human-readable note. If there is no cache at all,
//   rethrows so the endpoint can answer 503.
async function getModels({ refresh = false } = {}) {
    if (MOCK_MODE) {
        const models = mockModels();
        cache = { models, fetchedAt: Date.now() };
        return { models, stale: false, fetchedAt: cache.fetchedAt, mockMode: true };
    }

    const now = Date.now();
    const fresh = cache && now - cache.fetchedAt < MODELS_CACHE_TTL_MS;

    if (fresh && !refresh) {
        return { models: cache.models, stale: false, fetchedAt: cache.fetchedAt };
    }

    if (cache && !refresh) {
        // Stale-while-revalidate: hand back what we have and refresh quietly.
        triggerRefresh().catch(() => { /* logged inside triggerRefresh */ });
        return { models: cache.models, stale: true, fetchedAt: cache.fetchedAt };
    }

    try {
        return await triggerRefresh();
    } catch (error) {
        if (cache) {
            return {
                models: cache.models,
                stale: true,
                fetchedAt: cache.fetchedAt,
                error: "The live Groq API was temporarily unavailable; this list may be outdated.",
            };
        }
        throw error;
    }
}

// Used by chat / study-plan validation. Returns the current cache (refreshing
// in the background if stale) so validation never blocks on a slow probe.
async function ensureCache() {
    if (cache) {
        if (Date.now() - cache.fetchedAt >= MODELS_CACHE_TTL_MS) {
            triggerRefresh().catch(() => { /* logged inside triggerRefresh */ });
        }
        return cache;
    }
    return getModels();
}

async function isModelAllowed(modelId) {
    if (typeof modelId !== "string" || !modelId.trim()) return false;
    const { models } = await ensureCache();
    return models.some((model) => model.id === modelId.trim());
}

async function getDefaultModelId() {
    const { models } = await ensureCache();
    if (models.length === 0) return null;
    // Prefer the operator-configured GROQ_MODEL when it is actually available.
    const configured = process.env.GROQ_MODEL;
    if (configured && models.some((model) => model.id === configured)) return configured;
    return models[0].id;
}

module.exports = {
    getModels,
    isModelAllowed,
    getDefaultModelId,
    MODELS_CACHE_TTL_MS,
    // Exposed for testing only.
    _internal: { reset: () => { cache = null; inflight = null; groqClient = null; } },
};
