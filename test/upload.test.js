const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");
const { receivePdfUpload, extractPdfText, sanitizeFilename } = require("../server");

// Build a minimal but valid single-page text PDF in memory (correct xref).
function makeTextPdf(text) {
    const stream = `BT /F1 24 Tf 72 720 Td (${text}) Tj ET`;
    const objs = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
        `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [];
    for (const obj of objs) {
        offsets.push(Buffer.byteLength(pdf, "latin1"));
        pdf += obj;
    }
    const xrefStart = Buffer.byteLength(pdf, "latin1");
    let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) xref += String(off).padStart(10, "0") + " 00000 n \n";
    pdf += xref + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, "latin1");
}

function makeUploadRequest(boundary, field, filename, mime, body) {
    const head = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`,
        "latin1"
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, "latin1");
    const req = Readable.from([Buffer.concat([head, body, tail])]);
    req.headers = { "content-type": `multipart/form-data; boundary=${boundary}` };
    return req;
}

test("receivePdfUpload accepts a valid PDF and returns its buffer + filename", async () => {
    const req = makeUploadRequest("b1", "file", "note.pdf", "application/pdf", makeTextPdf("Hello PDF"));
    const { buffer, filename } = await receivePdfUpload(req);
    assert.equal(filename, "note.pdf");
    assert.ok(buffer.subarray(0, 5).equals(Buffer.from("%PDF-")));
});

test("receivePdfUpload rejects a wrong field name", async () => {
    const req = makeUploadRequest("b2", "notfile", "x.pdf", "application/pdf", makeTextPdf("x"));
    await assert.rejects(() => receivePdfUpload(req), /field name/);
});

test("receivePdfUpload rejects a non-PDF content type", async () => {
    const req = makeUploadRequest("b3", "file", "notes.txt", "text/plain", Buffer.from("just text"));
    await assert.rejects(() => receivePdfUpload(req), /Only PDF/);
});

test("receivePdfUpload rejects a non-PDF file disguised with a pdf content type", async () => {
    const req = makeUploadRequest("b4", "file", "fake.pdf", "application/pdf", Buffer.from("plain text, not a real pdf"));
    await assert.rejects(() => receivePdfUpload(req), /valid PDF/);
});

test("sanitizeFilename strips path components and control chars", () => {
    assert.equal(sanitizeFilename("../../etc/passwd"), "passwd");
    assert.equal(sanitizeFilename("a\\b\\c.pdf"), "c.pdf");
    assert.equal(sanitizeFilename("good name.pdf"), "good name.pdf");
});

test("extractPdfText returns text, total pages and per-page text", async () => {
    const { text, totalPages, pages } = await extractPdfText(makeTextPdf("RAG extract test"));
    assert.match(text, /RAG extract test/);
    assert.equal(totalPages, 1);
    assert.ok(Array.isArray(pages) && pages.length === 1);
});

test("extractPdfText rejects a malformed PDF with a clear message", async () => {
    await assert.rejects(
        () => extractPdfText(Buffer.from("%PDF-1.4\nthis is not a real pdf body\n%%EOF\n", "latin1")),
        /could not be read/
    );
});

test("receivePdfUpload rejects a PDF over the 5 MB limit", async () => {
    const big = Buffer.concat([Buffer.from("%PDF-1.4 "), Buffer.alloc(6 * 1024 * 1024, 0x41)]);
    const req = makeUploadRequest("b5", "file", "big.pdf", "application/pdf", big);
    await assert.rejects(() => receivePdfUpload(req), /5 MB/);
});
