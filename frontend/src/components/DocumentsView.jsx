import { useState, useRef } from 'react'

export default function DocumentsView({
  documents = [],
  uploading = false,
  uploadError = '',
  onUploadPdf,
  onRemoveDocument,
  error = '',
  onSwitchToChat,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer?.files
    if (files && files[0]) {
      validateAndUpload(files[0])
    }
  }

  function handleFileSelect(e) {
    const files = e.target?.files
    if (files && files[0]) {
      validateAndUpload(files[0])
    }
  }

  function validateAndUpload(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF documents are supported for semantic indexing.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds the 5MB upload limit.')
      return
    }
    onUploadPdf(file)
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 KB'
    const kb = bytes / 1024
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1)} MB`
    }
    return `${Math.round(kb)} KB`
  }

  return (
    <div className="documents-workspace-scroll">
      <div className="documents-content-container">
        {/* Hero Header */}
        <div className="documents-header-block">
          <div className="documents-tag">
            <span className="tag-spark">✦</span>
            <span>KNOWLEDGE BASE</span>
          </div>
          <h1 className="documents-main-title">Your Knowledge, Connected.</h1>
          <p className="documents-subtitle">
            Bring your textbooks, slide decks, and research notes into your private neural space for document-grounded AI reasoning.
          </p>
        </div>

        {/* Drag and drop upload zone */}
        <div
          className={`neural-upload-zone ${isDragging ? 'drag-hover' : ''} ${uploading ? 'uploading-state' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div className="upload-zone-visual">
            <div className="pdf-pulse-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            {uploading && <div className="zone-spinner-ring"></div>}
          </div>

          <div className="upload-zone-text">
            {uploading ? (
              <>
                <h3 className="zone-title">Vectorizing document...</h3>
                <p className="zone-desc">Extracting text, computing MiniLM 384-dim embeddings, and storing chunks in PostgreSQL pgvector.</p>
              </>
            ) : (
              <>
                <h3 className="zone-title">
                  {isDragging ? 'Drop your PDF here' : 'Click or drag and drop your study PDF'}
                </h3>
                <p className="zone-desc">
                  Supports PDF files up to 5 MB · Text is vectorized into private neural embeddings
                </p>
              </>
            )}
          </div>

          {!uploading && (
            <button
              type="button"
              className="zone-browse-btn"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Choose PDF File
            </button>
          )}
        </div>

        {uploadError && (
          <div className="doc-error-banner animate-fade-in" role="alert">
            <span className="error-icon">⚠</span>
            <span>{uploadError}</span>
          </div>
        )}

        {error && (
          <div className="doc-error-banner animate-fade-in" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Document List Section */}
        <div className="documents-section-head">
          <div className="doc-head-left">
            <h2 className="doc-section-title">Indexed Documents</h2>
            <span className="doc-counter-badge">{documents.length}</span>
          </div>
          {documents.length > 0 && (
            <button className="ask-docs-shortcut-btn" onClick={onSwitchToChat}>
              Ask My Docs in AI Chat →
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          /* Empty State */
          <div className="documents-empty-panel animate-fade-in">
            <div className="empty-doc-icon-wrap">
              <span className="empty-folder-icon">📂</span>
              <span className="empty-sparkle">✦</span>
            </div>
            <h3 className="empty-doc-heading">Your knowledge base is waiting.</h3>
            <p className="empty-doc-text">
              Upload study PDFs to begin asking questions grounded in your course materials.
              MindMate creates embeddings on-the-fly and cites exact pages when answering.
            </p>
            <button
              className="empty-upload-cta"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload First PDF
            </button>
          </div>
        ) : (
          /* List of Document Panels */
          <div className="documents-grid">
            {documents.map((doc) => (
              <div className="doc-panel-card animate-fade-in" key={doc.id}>
                <div className="doc-panel-top">
                  <div className="doc-icon-container">
                    <span className="pdf-tag">PDF</span>
                  </div>

                  <div className="doc-details-col">
                    <strong className="doc-filename" title={doc.filename}>
                      {doc.filename}
                    </strong>
                    <div className="doc-metadata-badges">
                      <span className="meta-badge">{doc.total_pages ?? '?'} pages</span>
                      <span className="meta-bullet">·</span>
                      <span className="meta-badge">{doc.chunk_count} chunks</span>
                      <span className="meta-bullet">·</span>
                      <span className="meta-badge">{formatBytes(doc.size_bytes)}</span>
                    </div>
                  </div>

                  <button
                    className="doc-delete-btn"
                    onClick={() => onRemoveDocument(doc)}
                    title={`Delete ${doc.filename}`}
                    aria-label={`Delete ${doc.filename}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div className="doc-panel-footer">
                  <span className="status-indicator-live">
                    <span className="live-dot"></span>
                    <span>Ready for RAG Querying</span>
                  </span>
                  <span className="status-date">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Indexed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visual RAG Architecture Walkthrough Box */}
        <div className="rag-workflow-infobox">
          <div className="infobox-header">
            <span className="infobox-spark">✦</span>
            <h4>HOW MINDMATE GROUNDING WORKS</h4>
          </div>
          <div className="infobox-steps">
            <div className="info-step">
              <span className="info-num">1</span>
              <div>
                <strong>Upload PDF</strong>
                <p>In-memory byte parsing</p>
              </div>
            </div>
            <span className="info-arrow">→</span>
            <div className="info-step">
              <span className="info-num">2</span>
              <div>
                <strong>Chunk Text</strong>
                <p>Overlapping windows</p>
              </div>
            </div>
            <span className="info-arrow">→</span>
            <div className="info-step">
              <span className="info-num">3</span>
              <div>
                <strong>Embed</strong>
                <p>MiniLM 384-dim vectors</p>
              </div>
            </div>
            <span className="info-arrow">→</span>
            <div className="info-step">
              <span className="info-num">4</span>
              <div>
                <strong>Retrieve</strong>
                <p>pgvector cosine match</p>
              </div>
            </div>
            <span className="info-arrow">→</span>
            <div className="info-step">
              <span className="info-num">5</span>
              <div>
                <strong>Synthesize</strong>
                <p>Groq grounded answer & citations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
