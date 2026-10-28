// Tests the dynamic Groq model cache/probe/validation with a stubbed Groq SDK.
// No network/API key is used.
process.env.GROQ_API_KEY = "stub-key";
process.env.MOCK_MODE = "";
process.env.MODELS_CACHE_TTL_MS = "60000";
process.env.GROQ_MODEL = "";

let listCalls = 0;

class StubModels {
    list() {
        listCalls += 1;
        return Promise.resolve({
            object: "list",
            data: [
                { id: "chat-a", object: "model", created: 1, owned_by: "Meta", active: true },
                { id: "whisper-x", object: "model", created: 2, owned_by: "OpenAI", active: true }, // 400 -> drop
                { id: "router-y", object: "model", created: 3, owned_by: "Groq", active: true },    // 429 -> keep
                { id: "retired-z", object: "model", created: 4, owned_by: "Meta", active: false },  // inactive -> drop
            ],
        });
    }
}

class StubCompletions {
    create(req) {
        const id = req.model;
        if (id === "whisper-x") {
            const e = new Error("model does not support chat");
            e.status = 400;
            return Promise.reject(e);
        }
        if (id === "router-y") {
            const e = new Error("rate limited");
            e.status = 429;
            return Promise.reject(e);
        }
        return Promise.resolve({ choices: [{ message: { content: "ok" } }] });
    }
}

class StubGroq {
    constructor() {
        this.models = new StubModels();
        this.chat = { completions: new StubCompletions() };
    }
}

// Override the class the groq-sdk index getter returns, BEFORE requiring models.
require("groq-sdk/client").Groq = StubGroq;

const test = require("node:test");
const assert = require("node:assert/strict");
const modelsApi = require("../models");

test("getModels returns only chat-capable models, sorted, not stale", async () => {
    const r = await modelsApi.getModels();
    assert.deepEqual(r.models.map((m) => m.id), ["chat-a", "router-y"]);
    assert.equal(r.stale, false);
    assert.equal(listCalls, 1);
});

test("cache hit does not refetch within the TTL", async () => {
    const before = listCalls;
    await modelsApi.getModels();
    assert.equal(listCalls, before);
});

test("isModelAllowed accepts available models and rejects others", async () => {
    assert.equal(await modelsApi.isModelAllowed("chat-a"), true);
    assert.equal(await modelsApi.isModelAllowed("router-y"), true);
    assert.equal(await modelsApi.isModelAllowed("whisper-x"), false);
    assert.equal(await modelsApi.isModelAllowed("retired-z"), false);
    assert.equal(await modelsApi.isModelAllowed("does-not-exist"), false);
    assert.equal(await modelsApi.isModelAllowed(""), false);
});

test("getDefaultModelId prefers configured GROQ_MODEL when available", async () => {
    process.env.GROQ_MODEL = "chat-a";
    assert.equal(await modelsApi.getDefaultModelId(), "chat-a");
    process.env.GROQ_MODEL = "";
    assert.equal(await modelsApi.getDefaultModelId(), "chat-a"); // first sorted
});
