const test = require("node:test");
const assert = require("node:assert/strict");
const {
    validateChatInput,
    validateSignupInput,
    validateStudyPlanInput,
    validatePlan,
    buildMockPlan,
    isRetryableError,
} = require("../server");

test("validateChatInput rejects empty and too-long, trims valid input", () => {
    assert.throws(() => validateChatInput({}), /non-empty/);
    assert.throws(() => validateChatInput({ message: "a".repeat(8001) }), /8000 characters/);
    assert.equal(validateChatInput({ message: "  hi  " }), "hi");
});

test("validateSignupInput validates email + password and lowercases email", () => {
    assert.throws(() => validateSignupInput({ email: "bad", password: "12345678" }), /valid email/);
    assert.throws(() => validateSignupInput({ email: "a@b.com", password: "short" }), /between 8 and 128/);
    const s = validateSignupInput({ email: "  A@B.com ", password: "password1" });
    assert.equal(s.email, "a@b.com");
});

test("validateStudyPlanInput validates required fields", () => {
    assert.throws(() => validateStudyPlanInput({}), /required/);
    const r = validateStudyPlanInput({ subject: "Node", hours: 8, level: "Beginner", goal: "learn", deadline: "" });
    assert.equal(r.subject, "Node");
});

test("validatePlan catches a topic-hours/total-hours mismatch", () => {
    assert.throws(
        () => validatePlan({ title: "t", totalHours: 5, topics: [{ topic: "x", hours: 2, priority: "High", keyConcepts: ["a"], exercise: "do" }] }),
        /Hour mismatch/
    );
});

test("buildMockPlan returns a structure that passes validatePlan", () => {
    const plan = buildMockPlan({ subject: "JS", hours: 6 });
    assert.equal(validatePlan(plan), true);
});

test("isRetryableError detects 429/503 and ignores other errors", () => {
    assert.equal(isRetryableError(new Error("429 Too Many Requests")), true);
    assert.equal(isRetryableError(new Error("503 Service Unavailable")), true);
    assert.equal(isRetryableError(new Error("validation failed")), false);
});
