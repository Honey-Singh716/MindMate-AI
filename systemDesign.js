const crypto = require("node:crypto");

/**
 * 26 System Design Concepts for AI Engineers — Integrated Module
 * Reference: "26 System Design Concepts Every AI Engineer Should Know"
 */

// ============================================================================
// 1. CIRCUIT BREAKER (Concept 9)
// Prevents cascade failures when upstream LLM API is failing or timing out.
// States: CLOSED (healthy) -> OPEN (broken, fail-fast) -> HALF_OPEN (canary probe)
// ============================================================================
class CircuitBreaker {
    constructor({
        failureThreshold = 5,
        cooldownPeriodMs = 30000,
        volumeThreshold = 3,
        name = "llm-circuit-breaker",
    } = {}) {
        this.name = name;
        this.failureThreshold = failureThreshold;
        this.cooldownPeriodMs = cooldownPeriodMs;
        this.volumeThreshold = volumeThreshold;

        this.state = "CLOSED"; // CLOSED | OPEN | HALF_OPEN
        this.consecutiveFailures = 0;
        this.lastFailureTime = 0;
        this.totalRequests = 0;
        this.successfulProbes = 0;
    }

    getState() {
        if (this.state === "OPEN" && Date.now() - this.lastFailureTime >= this.cooldownPeriodMs) {
            this.state = "HALF_OPEN";
            this.successfulProbes = 0;
        }
        return this.state;
    }

    async execute(actionFn, fallbackFn = null) {
        const currentState = this.getState();

        if (currentState === "OPEN") {
            if (fallbackFn) {
                return fallbackFn(new Error(`Circuit breaker '${this.name}' is OPEN. Failing fast to protect service.`));
            }
            const error = new Error(`Circuit breaker '${this.name}' is OPEN. Upstream AI service is currently unavailable.`);
            error.code = "CIRCUIT_OPEN";
            error.status = 503;
            throw error;
        }

        try {
            const result = await actionFn();
            this.recordSuccess();
            return result;
        } catch (error) {
            this.recordFailure(error);
            if (fallbackFn) {
                return fallbackFn(error);
            }
            throw error;
        }
    }

    recordSuccess() {
        if (this.state === "HALF_OPEN") {
            this.successfulProbes += 1;
            if (this.successfulProbes >= 2) {
                this.state = "CLOSED";
                this.consecutiveFailures = 0;
            }
        } else {
            this.consecutiveFailures = 0;
        }
    }

    recordFailure(error) {
        this.consecutiveFailures += 1;
        this.lastFailureTime = Date.now();

        if (this.state === "HALF_OPEN" || this.consecutiveFailures >= this.failureThreshold) {
            this.state = "OPEN";
        }
    }

    reset() {
        this.state = "CLOSED";
        this.consecutiveFailures = 0;
        this.lastFailureTime = 0;
        this.successfulProbes = 0;
    }
}

// ============================================================================
// 2. RETRIES WITH EXPONENTIAL BACKOFF & JITTER (Concept 3)
// Retries transient 429s, 5xxs, and timeouts with randomized exponential delays.
// ============================================================================
function isTransientError(error) {
    const status = error?.status || error?.statusCode;
    const code = error?.code;
    const msg = String(error?.message || "").toLowerCase();

    if ([429, 500, 502, 503, 504].includes(status)) return true;
    if (["ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "ECONNREFUSED"].includes(code)) return true;
    if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("overloaded") || msg.includes("timeout")) {
        return true;
    }
    return false;
}

async function withRetryAndBackoff(fn, {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 15000,
    shouldRetry = isTransientError,
} = {}) {
    let lastError = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            return await fn(attempt);
        } catch (error) {
            lastError = error;
            if (attempt >= maxAttempts - 1 || !shouldRetry(error)) {
                throw error;
            }

            // Respect Retry-After header if provided
            let delayMs = 0;
            const retryAfter = error?.headers?.["retry-after"] || error?.response?.headers?.["retry-after"];
            if (retryAfter) {
                const parsed = Number(retryAfter);
                delayMs = Number.isFinite(parsed) ? parsed * 1000 : baseDelayMs;
            } else {
                // Exponential backoff with Full Jitter: Math.random() * min(maxDelay, base * 2^attempt)
                const expDelay = Math.min(maxDelayMs, baseDelayMs * (2 ** attempt));
                delayMs = Math.round(Math.random() * expDelay) + 100;
            }

            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw lastError;
}

// ============================================================================
// 3. MODEL ROUTER & FALLBACK MODELS (Concepts 16 & 17)
// Route simple requests to fast/cheap models, complex to deep models.
// If selected model fails, gracefully degrade through fallback chain.
// ============================================================================
const DEFAULT_FALLBACK_CHAIN = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
];

function classifyQueryDifficulty(prompt) {
    const text = String(prompt || "").trim();
    const words = text.split(/\s+/).length;

    // Fast conversational / simple queries: short greeting, simple definition, few words
    const simpleGreetings = /^(hi|hello|hey|thanks|thank you|good morning|help|bye|ok)\b/i;
    if (words <= 12 && simpleGreetings.test(text)) {
        return "fast";
    }

    // Heavy queries: complex study plan, multi-step coding, large reasoning prompt
    if (words > 80 || /study plan|curriculum|architecture|design pattern|roadmap|explain in detail|compare and contrast/i.test(text)) {
        return "deep";
    }

    return "balanced";
}

function routeModel({ prompt, requestedModel, availableModels = [] } = {}) {
    const availableIds = new Set(availableModels.map((m) => m.id || m));

    // If user explicitly chose a valid model, honor their selection
    if (requestedModel && (availableIds.size === 0 || availableIds.has(requestedModel))) {
        return requestedModel;
    }

    const difficulty = classifyQueryDifficulty(prompt);

    if (difficulty === "fast" && (availableIds.has("llama-3.1-8b-instant") || availableIds.size === 0)) {
        return "llama-3.1-8b-instant";
    }

    // Balanced or deep default to robust 70b or first available
    if (availableIds.has("llama-3.3-70b-versatile")) {
        return "llama-3.3-70b-versatile";
    }

    if (availableModels.length > 0) {
        return availableModels[0].id || availableModels[0];
    }

    return "llama-3.3-70b-versatile";
}

// ============================================================================
// 4. SEMANTIC & RESPONSE CACHE WITH TENANT ISOLATION (Concepts 2, 15 & 23)
// Scoped by tenant/user to prevent data leakage between users.
// ============================================================================
class ResponseCache {
    constructor({ maxEntries = 200, ttlMs = 15 * 60 * 1000 } = {}) {
        this.maxEntries = maxEntries;
        this.ttlMs = ttlMs;
        this.cache = new Map(); // key -> { answer, sources, timestamp, tenantId }
        this.hits = 0;
        this.misses = 0;
    }

    buildKey(tenantId, text, model = "") {
        const normalized = String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
        const hash = crypto.createHash("sha256").update(`${tenantId}:${model}:${normalized}`).digest("hex");
        return `${tenantId}:${hash}`;
    }

    get(tenantId, text, model = "") {
        const key = this.buildKey(tenantId, text, model);
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses += 1;
            return null;
        }

        // Strict Tenant Isolation check (Concept 23)
        if (entry.tenantId !== tenantId) {
            this.cache.delete(key);
            this.misses += 1;
            return null;
        }

        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            this.misses += 1;
            return null;
        }

        this.hits += 1;
        return { answer: entry.answer, sources: entry.sources, cached: true };
    }

    set(tenantId, text, model, answer, sources = []) {
        if (!tenantId || !text || !answer) return;

        // Evict oldest if limit reached
        if (this.cache.size >= this.maxEntries) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        const key = this.buildKey(tenantId, text, model);
        this.cache.set(key, {
            tenantId,
            answer,
            sources,
            timestamp: Date.now(),
        });
    }

    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    getStats() {
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : "0.00",
        };
    }
}

// ============================================================================
// 5. GUARDRAILS: INPUT & OUTPUT VALIDATION (Concept 20)
// Detects prompt injections, prevents secret leaks, validates schemas.
// ============================================================================
const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(all\s+|previous\s+|above\s+)+instructions/i,
    /system\s+prompt\s+override/i,
    /reveal\s+(the\s+|your\s+)+(system\s+prompt|api\s+key|jwt_secret|groq_api_key|database_url)/i,
    /disregard\s+(all\s+)?prior\s+guidelines/i,
    /you\s+are\s+now\s+in\s+(developer\s+mode|dan\s+mode)/i,
    /bypass\s+(content\s+filter|safety\s+filter)/i,
];

function checkInputGuardrails(input) {
    const text = String(input || "").trim();

    for (const pattern of PROMPT_INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            return {
                safe: false,
                reason: "Potential prompt injection or safety bypass detected.",
                sanitized: "[Content filtered by MindMate AI Safety Guardrail]",
            };
        }
    }

    return { safe: true, sanitized: text };
}

function sanitizeOutput(text) {
    let clean = String(text || "");
    // Redact accidental Groq API keys, JWT secrets, or DB strings from AI responses
    clean = clean.replace(/gsk_[a-zA-Z0-9]{30,}/g, "[REDACTED_API_KEY]");
    clean = clean.replace(/postgres(ql)?:\/\/[^\s]+/gi, "[REDACTED_DATABASE_URL]");
    clean = clean.replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, "[REDACTED_JWT_TOKEN]");
    return clean;
}

// ============================================================================
// 6. TOKEN BUDGETS & TOKEN RATE LIMITS (Concepts 12 & 22)
// Estimate tokens, enforce per-turn limits, and prevent infinite loops.
// ============================================================================
function estimateTokenCount(text) {
    if (!text) return 0;
    // Standard rule of thumb: ~4 characters per token in English
    return Math.ceil(String(text).length / 4);
}

class TokenBudgetManager {
    constructor({ maxTokensPerTurn = 8000, maxTokensPerConversation = 60000 } = {}) {
        this.maxTokensPerTurn = maxTokensPerTurn;
        this.maxTokensPerConversation = maxTokensPerConversation;
        this.conversationUsage = new Map(); // conversationId -> totalTokens
    }

    recordTokens(conversationId, tokens) {
        if (!conversationId) return;
        const current = this.conversationUsage.get(conversationId) || 0;
        this.conversationUsage.set(conversationId, current + tokens);
    }

    checkBudget(conversationId, incomingPromptTokens) {
        const current = this.conversationUsage.get(conversationId) || 0;
        const total = current + incomingPromptTokens;

        if (total >= this.maxTokensPerConversation) {
            return {
                allowed: false,
                warning: false,
                current,
                message: "Conversation token budget exceeded. Please start a new conversation to continue.",
            };
        }

        const isWarning = total >= this.maxTokensPerConversation * 0.8;
        return {
            allowed: true,
            warning: isWarning,
            current,
            message: isWarning ? "Conversation nearing token budget limit (80%)." : null,
        };
    }
}

// ============================================================================
// 7. BACKPRESSURE & CONCURRENCY LIMITER (Concept 10)
// Prevents Render free tier (512MB RAM) from OOM crashing during burst traffic.
// ============================================================================
class ConcurrencyLimiter {
    constructor({ maxConcurrent = 6, maxQueueSize = 50, timeoutMs = 25000 } = {}) {
        this.maxConcurrent = maxConcurrent;
        this.maxQueueSize = maxQueueSize;
        this.timeoutMs = timeoutMs;
        this.activeCount = 0;
        this.queue = [];
    }

    async run(taskFn) {
        if (this.activeCount < this.maxConcurrent) {
            return this.executeDirectly(taskFn);
        }

        if (this.queue.length >= this.maxQueueSize) {
            const error = new Error("Server is currently handling peak capacity. Please retry shortly.");
            error.status = 503;
            error.code = "BACKPRESSURE_LIMIT";
            throw error;
        }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const idx = this.queue.findIndex((item) => item.timeoutId === timeoutId);
                if (idx !== -1) {
                    this.queue.splice(idx, 1);
                    const error = new Error("Request queued behind server load timed out.");
                    error.status = 504;
                    reject(error);
                }
            }, this.timeoutMs);

            this.queue.push({ taskFn, resolve, reject, timeoutId });
        });
    }

    async executeDirectly(taskFn) {
        this.activeCount += 1;
        try {
            return await taskFn();
        } finally {
            this.activeCount -= 1;
            this.dispatchNext();
        }
    }

    dispatchNext() {
        if (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
            const next = this.queue.shift();
            if (next) {
                clearTimeout(next.timeoutId);
                this.executeDirectly(next.taskFn)
                    .then(next.resolve)
                    .catch(next.reject);
            }
        }
    }
}

// ============================================================================
// 8. HYBRID SEARCH: RECIPROCAL RANK FUSION (RRF) (Concept 14)
// Combines vector semantic similarity and BM25/keyword matches for optimal RAG.
// ============================================================================
function reciprocalRankFusion(vectorHits = [], keywordHits = [], { k = 60, topK = 5 } = {}) {
    const scoreMap = new Map();

    // Score from vector search rankings
    vectorHits.forEach((hit, rank) => {
        const id = hit.id || `${hit.documentId}:${hit.page}:${hit.chunkIndex || rank}`;
        const score = 1 / (k + (rank + 1));
        scoreMap.set(id, {
            item: hit,
            score: (scoreMap.get(id)?.score || 0) + score,
            vectorRank: rank + 1,
            keywordRank: null,
        });
    });

    // Score from keyword search rankings
    keywordHits.forEach((hit, rank) => {
        const id = hit.id || `${hit.documentId}:${hit.page}:${hit.chunkIndex || rank}`;
        const score = 1 / (k + (rank + 1));
        const existing = scoreMap.get(id);
        if (existing) {
            existing.score += score;
            existing.keywordRank = rank + 1;
        } else {
            scoreMap.set(id, {
                item: hit,
                score,
                vectorRank: null,
                keywordRank: rank + 1,
            });
        }
    });

    // Sort by combined RRF score
    return Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((entry) => ({
            ...entry.item,
            rrfScore: entry.score,
            vectorRank: entry.vectorRank,
            keywordRank: entry.keywordRank,
        }));
}

// ============================================================================
// 9. AGENT TRACING & OBSERVABILITY (Concept 21)
// OpenTelemetry-style spans for measuring each step of the AI lifecycle.
// ============================================================================
class AgentTracer {
    constructor(runId = crypto.randomUUID()) {
        this.runId = runId;
        this.startTime = Date.now();
        this.spans = [];
    }

    startSpan(name, attributes = {}) {
        const spanId = crypto.randomUUID().slice(0, 8);
        const start = Date.now();
        const span = {
            spanId,
            name,
            attributes,
            startTime: start,
            endTime: null,
            durationMs: null,
            status: "running",
            error: null,
        };
        this.spans.push(span);

        return {
            end: (error = null, extraAttributes = {}) => {
                span.endTime = Date.now();
                span.durationMs = span.endTime - span.startTime;
                span.status = error ? "error" : "ok";
                if (error) span.error = error.message || String(error);
                Object.assign(span.attributes, extraAttributes);
                return span;
            },
        };
    }

    getSummary() {
        return {
            runId: this.runId,
            totalDurationMs: Date.now() - this.startTime,
            spanCount: this.spans.length,
            spans: this.spans.map((s) => ({
                name: s.name,
                durationMs: s.durationMs,
                status: s.status,
                attributes: s.attributes,
            })),
        };
    }
}

// ============================================================================
// 10. SHADOW EVALS (Concept 26)
// Asynchronously tests alternative prompts or candidate models without user impact.
// ============================================================================
function maybeRunShadowEval({
    query,
    originalResponse,
    sampleRate = 0.05,
    shadowFn,
    onEvalResult,
} = {}) {
    if (Math.random() >= sampleRate || typeof shadowFn !== "function") return;

    // Run completely non-blocking in background
    queueMicrotask(async () => {
        const start = Date.now();
        try {
            const shadowResponse = await shadowFn();
            const latencyMs = Date.now() - start;

            if (typeof onEvalResult === "function") {
                onEvalResult({
                    query,
                    originalLength: (originalResponse || "").length,
                    shadowLength: (shadowResponse || "").length,
                    shadowLatencyMs: latencyMs,
                    sampledAt: new Date().toISOString(),
                });
            }
        } catch (shadowErr) {
            // Shadow failure never impacts production user experience
            console.warn(JSON.stringify({
                event: "shadow_eval_failed",
                error: shadowErr.message,
            }));
        }
    });
}

// Global Singletons
const globalCircuitBreaker = new CircuitBreaker();
const globalResponseCache = new ResponseCache();
const globalTokenBudgets = new TokenBudgetManager();
const globalConcurrencyLimiter = new ConcurrencyLimiter();

module.exports = {
    // Classes
    CircuitBreaker,
    ResponseCache,
    TokenBudgetManager,
    ConcurrencyLimiter,
    AgentTracer,

    // Utilities & Functions
    isTransientError,
    withRetryAndBackoff,
    classifyQueryDifficulty,
    routeModel,
    DEFAULT_FALLBACK_CHAIN,
    checkInputGuardrails,
    sanitizeOutput,
    estimateTokenCount,
    reciprocalRankFusion,
    maybeRunShadowEval,

    // Singletons
    globalCircuitBreaker,
    globalResponseCache,
    globalTokenBudgets,
    globalConcurrencyLimiter,
};

