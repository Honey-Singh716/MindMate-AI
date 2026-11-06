import { useRef, useEffect, useState } from 'react'

export default function ChatInput({
  message,
  setMessage,
  onSubmit,
  busy = false,
  ragMode = false,
  setRagMode,
  hasDocuments = false,
  onUploadDocument,
  uploading = false,
  uploadError = '',
}) {
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Auto-resize textarea to fit content naturally
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, 160)
    el.style.height = `${Math.max(46, newHeight)}px`
  }, [message])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !busy && !uploading) {
        onSubmit(e)
      }
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (onUploadDocument) {
      onUploadDocument(file).then(() => {
        // Automatically activate RAG mode when document is uploaded
        if (setRagMode) setRagMode(true)
      })
    }
    // Reset file input so same file can be re-selected if needed
    e.target.value = ''
  }

  function handleRemoveAttachment() {
    setSelectedFile(null)
  }

  return (
    <div className="composer-dock-container">
      <form
        className={`composer-card ${ragMode ? 'rag-active' : ''} ${busy ? 'is-busy' : ''}`}
        onSubmit={onSubmit}
      >
        {/* Attached Document Pill (when uploading or uploaded) */}
        {selectedFile && (
          <div className="attached-document-banner animate-fade-in">
            <div className="attached-file-info">
              <span className="file-badge-pdf">PDF</span>
              <span className="attached-filename" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="attached-status-tag">
                {uploading ? (
                  <span className="uploading-spinner-row">
                    <span className="mini-spinner"></span>
                    <span>Parsing & Indexing Embeddings...</span>
                  </span>
                ) : (
                  <span className="ready-tag">✓ Ready for RAG Grounding</span>
                )}
              </span>
            </div>
            {!uploading && (
              <button
                type="button"
                className="remove-doc-btn"
                onClick={handleRemoveAttachment}
                title="Remove attached document"
                aria-label="Remove document"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Upload Error Banner if any */}
        {uploadError && (
          <div className="composer-upload-error animate-fade-in">
            <span className="error-dot">⚠</span>
            <span>{uploadError}</span>
          </div>
        )}

        {/* Text Input Row */}
        <div className="composer-input-row">
          <textarea
            ref={textareaRef}
            className="composer-textarea"
            placeholder={
              ragMode
                ? 'Ask a question grounded in your course documents...'
                : 'Ask MindMate anything... (e.g. explain a concept, analyze study notes)'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={busy || uploading}
            aria-label="Message prompt"
          />

          {/* Send Action Button */}
          <button
            type="submit"
            className="composer-send-btn"
            disabled={!message.trim() || busy || uploading}
            aria-label="Send message"
            title="Send (Enter)"
          >
            {busy ? (
              <span className="composer-send-spinner"></span>
            ) : (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>

        {/* Bottom Control Toolbar */}
        <div className="composer-toolbar">
          <div className="toolbar-left-cluster">
            {/* Attach Document Action Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="toolbar-btn attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || uploading}
              title="Upload and ground in a PDF document (up to 5 MB)"
            >
              <span className="toolbar-icon">📎</span>
              <span className="btn-text">Attach PDF</span>
            </button>

            {/* Ask My Documents Toggle */}
            <label
              className={`rag-toggle-pill ${ragMode ? 'active' : ''} ${!hasDocuments && !selectedFile ? 'disabled' : ''}`}
              title={
                hasDocuments || selectedFile
                  ? 'Ground responses in your course documents using MiniLM vector search'
                  : 'Attach a PDF or visit Knowledge Base to enable document search'
              }
            >
              <input
                type="checkbox"
                checked={ragMode}
                onChange={(e) => setRagMode(e.target.checked)}
                disabled={!hasDocuments && !selectedFile}
              />
              <span className="toggle-switch-dot"></span>
              <span className="toggle-switch-label">
                <span className="toggle-doc-icon">▤</span>
                <span>Ask My Documents</span>
              </span>
              {ragMode && <span className="rag-active-pip">Active</span>}
            </label>
          </div>

          <div className="toolbar-right-cluster desktop-only">
            <span className="keyboard-guidance">
              <kbd className="key-cap">Enter</kbd> to send <span className="key-sep">·</span> <kbd className="key-cap">Shift</kbd>+<kbd className="key-cap">Enter</kbd> new line
            </span>
          </div>
        </div>
      </form>
    </div>
  )
}
