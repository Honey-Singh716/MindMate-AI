const test = require("node:test");
const assert = require("node:assert/strict");
const rag = require("../rag");

test("chunkPdfText splits per page and keeps page numbers", () => {
    const pages = [
        { num: 1, text: "A".repeat(1200) + " end1" },
        { num: 2, text: "Page two short" },
    ];
    const chunks = rag.chunkPdfText({ text: pages.map((p) => p.text).join(" "), pages });

    assert.ok(chunks.length > 0);
    assert.equal(chunks[0].page, 1);
    assert.ok(chunks[0].text.length <= 1050);
    assert.ok(chunks.some((c) => c.page === 2 && c.text.includes("Page two short")));
    // overlap: last 50 chars of chunk 0 == first 50 chars of chunk 1
    if (chunks.length > 1) {
        assert.equal(chunks[0].text.slice(-50), chunks[1].text.slice(0, 50));
    }
    // sequential indices
    assert.deepEqual(chunks.map((c) => c.index), chunks.map((_, i) => i));
});

test("chunkPdfText falls back to whole-text when pages absent", () => {
    const chunks = rag.chunkPdfText({ text: "B".repeat(2500), pages: [] });
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((c) => c.page === null));
});

test("chunkPdfText ignores empty/whitespace pages", () => {
    const chunks = rag.chunkPdfText({
        text: "",
        pages: [{ num: 1, text: "   " }, { num: 2, text: "hello" }],
    });
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].page, 2);
});

test("buildRagContext includes filename and page citations", () => {
    const ctx = rag.buildRagContext([
        { filename: "a.pdf", page: 3, content: "hello" },
        { filename: "b.pdf", page: null, content: "world" },
    ]);
    assert.match(ctx, /a\.pdf/);
    assert.match(ctx, /page: 3/);
    assert.match(ctx, /b\.pdf/);
    assert.match(ctx, /Source 1/);
});
