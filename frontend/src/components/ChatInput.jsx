import { useRef, useEffect } from 'react'

export default function ChatInput({
  message,
  setMessage,
  onSubmit,
  busy,
  ragMode,
  setRagMode,
  hasDocuments,
  modelName,
}) {
  const textareaRef = useRef(null)

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, 180)
    el.style.height = `${Math.max(48, newHeight)}px`
  }, [message])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !busy) {
        onSubmit(e)
      }
    }
  }

  return (
    <div className="floating-dock-container">
      <form className={`neural-input-dock ${ragMode ? 'dock-rag-active' : ''}`} onSubmit={onSubmit}>
        <div className="dock-top-controls">
          {/* Ask My Docs toggle */}
          <label
            className={`rag-switch-pill ${ragMode ? 'active' : ''}`}
            title={
              hasDocuments
                ? 'Ground responses in your uploaded documents using MiniLM vector search'
                : 'No documents uploaded yet — visit Documents tab to upload PDFs'
            }
          >
            <input
              type="checkbox"
              checked={ragMode}
              onChange={(e) => setRagMode(e.target.checked)}
            />
            <span className="rag-switch-dot"></span>
            <span className="rag-switch-text">
              <span className="rag-doc-icon">▤</span> Ask my docs
            </span>
            {ragMode && <span className="rag-active-spark">Active</span>}
          </label>

          {/* Model info badge */}
          {modelName && (
            <div className="dock-model-tag" title={`Inference via Groq: ${modelName}`}>
              <span className="tag-dot"></span>
              <span className="tag-name">{modelName.replace('llama-', '').replace('-versatile', '')}</span>
            </div>
          )}
        </div>

        <div className="dock-input-row">
          <textarea
            ref={textareaRef}
            className="dock-textarea"
            placeholder={
              ragMode
                ? 'Ask a question grounded in your uploaded documents...'
                : 'Ask MindMate anything... (Press Enter to send, Shift+Enter for new line)'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={busy}
          />

          <button
            type="submit"
            className="dock-send-button"
            disabled={!message.trim() || busy}
            aria-label="Send message"
            title="Send (Enter)"
          >
            {busy ? (
              <span className="dock-send-spinner"></span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
