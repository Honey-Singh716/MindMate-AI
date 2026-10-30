import { useState, useMemo } from 'react'
import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function ChatMessage({ message, isLastModel = false, sources = [] }) {
  const [copied, setCopied] = useState(false)
  const isModel = message.role === 'model'
  const text = message.parts?.map((p) => p.text).join('\n') || ''

  // Convert markdown to clean HTML
  const parsedHtml = useMemo(() => {
    if (!text) return ''
    try {
      return marked.parse(text)
    } catch {
      return text
    }
  }, [text])

  function copyMessageText() {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <article className={`neural-msg-item ${isModel ? 'msg-model' : 'msg-user'} animate-fade-in`}>
      <div className="msg-avatar-col">
        {isModel ? (
          <div className="avatar-orb assistant-orb" title="MindMate AI">
            <span className="spark-mark">✦</span>
            <span className="avatar-glow"></span>
          </div>
        ) : (
          <div className="avatar-orb user-orb" title="You">
            <span>U</span>
          </div>
        )}
      </div>

      <div className="msg-body-col">
        <div className="msg-header-meta">
          <span className="msg-author-name">{isModel ? 'MindMate AI' : 'You'}</span>
          {isModel && <span className="neural-badge-pill">Grounded Assistant</span>}

          <button
            className="copy-msg-btn"
            onClick={copyMessageText}
            title="Copy response to clipboard"
            aria-label="Copy response text"
          >
            {copied ? '✓ Copied' : '⧉ Copy'}
          </button>
        </div>

        {/* Message content formatted */}
        <div
          className="msg-content-prose"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />

        {/* Grounded RAG Sources list if attached to this response */}
        {isModel && sources && sources.length > 0 && isLastModel && (
          <div className="rag-sources-card">
            <div className="rag-sources-head">
              <span className="sources-spark">✦</span>
              <span className="sources-title">Grounded in Uploaded Documents</span>
              <span className="sources-count">{sources.length} {sources.length === 1 ? 'citation' : 'citations'}</span>
            </div>

            <div className="rag-sources-list">
              {sources.map((src, idx) => (
                <div className="rag-source-entry" key={`${src.documentId}-${idx}`}>
                  <div className="source-entry-top">
                    <span className="source-doc-badge">PDF</span>
                    <strong className="source-doc-name">{src.filename}</strong>
                    {src.page && <span className="source-doc-page">Page {src.page}</span>}
                  </div>
                  <blockquote className="source-doc-snippet">
                    "{src.snippet}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
