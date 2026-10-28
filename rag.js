// Chunk size ~1000 characters (~200 tokens): big enough to carry a complete
// idea, small enough to keep retrieval focused and embedding cheap.
const CHUNK_SIZE = 1000;
// Overlap of 150 chars so a sentence split near a boundary is not lost between
// two chunks.
const CHUNK_OVERLAP = 150;

function normalizeWhitespace(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
}

function splitIntoChunks(text, page) {
    const normalized = normalizeWhitespace(text);
    const chunks = [];
    if (!normalized) return chunks;
    let start = 0;
    while (start < normalized.length) {
        const end = Math.min(start + CHUNK_SIZE, normalized.length);
        chunks.push({ text: normalized.slice(start, end), page });
        if (end >= normalized.length) break;
        start = Math.max(0, end - CHUNK_OVERLAP);
    }
    return chunks;
}

// Chunk a PDF's text. When per-page text is available we chunk each page
// separately so chunks never mix unrelated sections and always carry a page
// number for citations. Otherwise we chunk the whole document (page = null).
function chunkPdfText({ text, pages }) {
    const grouped = Array.isArray(pages) && pages.length > 0
        ? pages.map((p) => splitIntoChunks(p.text, Number.isFinite(p.num) ? p.num : null))
        : [splitIntoChunks(text, null)];

    let index = 0;
    const chunks = [];
    for (const pageChunks of grouped) {
        for (const chunk of pageChunks) {
            chunks.push({ text: chunk.text, page: chunk.page, index: index++ });
        }
    }
    return chunks;
}

// Build the reference-material block injected into the chat system prompt.
// Each source carries its filename and page so the model can cite it.
function buildRagContext(retrieved) {
    return retrieved
        .map((chunk, i) => {
            const citation = chunk.page
                ? `(document: ${chunk.filename}, page: ${chunk.page})`
                : `(document: ${chunk.filename})`;
            return `[Source ${i + 1}] ${citation}\n${chunk.content}`;
        })
        .join("\n\n");
}

module.exports = {
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    chunkPdfText,
    buildRagContext,
};
