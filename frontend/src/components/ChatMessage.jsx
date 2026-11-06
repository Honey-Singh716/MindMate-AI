import { useState, useMemo } from 'react'
import { marked } from 'marked'

// Configure marked for academic rendering
const renderer = new marked.Renderer()

// Custom code block renderer with language label and copy button
renderer.code = function ({ text, lang }) {
  const cleanLang = (lang || 'code').toLowerCase().trim()
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return `
    <div class="academic-code-card">
      <div class="code-card-header">
        <div class="code-lang-tag">
          <span class="code-dot"></span>
          <span>${cleanLang}</span>
        </div>
        <button class="code-copy-action" type="button" data-code="${encodeURIComponent(text)}" title="Copy code snippet">
          ⧉ Copy Code
        </button>
      </div>
      <pre><code class="language-${cleanLang}">${escapedText}</code></pre>
    </div>
  `
}

// Custom table renderer for clean academic styling
renderer.table = function ({ header, rows }) {
  return `
    <div class="academic-table-container">
      <table class="academic-data-table">
        <thead>${header}</thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}

marked.use({
  renderer,
  breaks: true,
  gfm: true,
})

// Helper to transform academic callouts and LaTeX formulas
function enhanceAcademicMarkdown(rawText) {
  if (!rawText) return ''
  let text = rawText

  // 1. Transform LaTeX block math: $$ formula $$ -> academic formula box
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const cleanFormula = formula.trim()
    return `\n\n<div class="academic-formula-box" title="Mathematical Expression"><span class="formula-label">Formula</span><div class="formula-content">${cleanFormula}</div></div>\n\n`
  })

  // 2. Transform inline LaTeX math: $formula$ (avoiding currency like $10 or $20)
  text = text.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix, formula) => {
    // If it looks like a currency amount ($10, $5.99), leave it
    if (/^\d/.test(formula.trim())) return match
    return `${prefix}<span class="academic-inline-formula">${formula.trim()}</span>`
  })

  return text
}

export default function ChatMessage({
  message,
  isLastModel = false,
  sources = [],
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'up' | 'down' | null
  const isModel = message.role === 'model'
  const rawText = message.parts?.map((p) => p.text).join('\n') || ''
  const isCached = Boolean(message.meta?.cached || message.cached)
  const messageModel = message.meta?.model || message.model || ''

  // Convert markdown to clean HTML
  const parsedHtml = useMemo(() => {
    if (!rawText) return ''
    try {
      const enhanced = enhanceAcademicMarkdown(rawText)
      return marked.parse(enhanced)
    } catch {
      return rawText
    }
  }, [rawText])

  function copyMessageText() {
    if (!rawText) return
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleProseClick(e) {
    const copyBtn = e.target.closest('.code-copy-action')
    if (copyBtn) {
      e.preventDefault()
      const code = decodeURIComponent(copyBtn.getAttribute('data-code') || '')
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = copyBtn.innerText
          copyBtn.innerText = '✓ Copied'
          copyBtn.classList.add('copied')
          setTimeout(() => {
            copyBtn.innerText = originalText
            copyBtn.classList.remove('copied')
          }, 2000)
        })
      }
    }
  }

  return (
    <article className={`academic-chat-row ${isModel ? 'row-model' : 'row-user'} animate-fade-in`}>
      <div className="chat-row-inner">
        {/* Avatar Badge */}
        <div className="message-avatar-container">
          {isModel ? (
            <div className="tutor-avatar-badge" title="MindMate Academic Tutor">
              <span className="tutor-spark">✦</span>
            </div>
          ) : (
            <div className="scholar-avatar-badge" title="You">
              <span>U</span>
            </div>
          )}
        </div>

        {/* Message Content & Metadata */}
        <div className="message-body-container">
          <div className="message-meta-strip">
            <span className="author-name-tag">{isModel ? 'MindMate AI' : 'You'}</span>
            {isModel && <span className="tutor-role-pill">Academic Tutor</span>}
            {isModel && isCached && (
              <span className="cache-pill" title="Served instantly from tenant-isolated response cache">
                ⚡ Cached (2ms)
              </span>
            )}
            {isModel && messageModel && (
              <span className="routed-model-pill" title={`Model: ${messageModel}`}>
                ✦ {messageModel.split('/').pop()}
              </span>
            )}

            {/* Top Right Quick Actions */}
            <div className="quick-actions-group">
              <button
                className="action-icon-btn copy-btn"
                onClick={copyMessageText}
                title="Copy entire response"
                aria-label="Copy entire response"
              >
                {copied ? '✓ Copied' : '⧉ Copy'}
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div
            className={`prose-content-area ${isModel ? 'tutor-prose' : 'scholar-prose'}`}
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
            onClick={handleProseClick}
          />

          {/* Contextual Action Bar for AI Responses */}
          {isModel && (
            <div className="tutor-action-bar">
              <div className="action-feedback-pills">
                <button
                  className={`feedback-btn ${feedback === 'up' ? 'active' : ''}`}
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  title="Helpful explanation"
                  aria-label="Mark explanation as helpful"
                >
                  <span className="feedback-icon">👍</span>
                  <span>Helpful</span>
                </button>
                <button
                  className={`feedback-btn ${feedback === 'down' ? 'active' : ''}`}
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  title="Needs clarification"
                  aria-label="Mark explanation as needing clarification"
                >
                  <span className="feedback-icon">👎</span>
                </button>
              </div>

              {isLastModel && onRegenerate && (
                <button
                  className="regenerate-action-btn"
                  onClick={onRegenerate}
                  title="Regenerate response with Groq"
                >
                  <span className="regen-icon">↺</span>
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}

          {/* Grounded Document Citations (RAG) */}
          {isModel && sources && sources.length > 0 && isLastModel && (
            <div className="grounded-citations-card animate-fade-in">
              <div className="citations-header">
                <div className="citations-title-group">
                  <span className="citations-spark">✦</span>
                  <strong className="citations-title">Grounded in Course Documents</strong>
                </div>
                <span className="citations-count-badge">
                  {sources.length} verified {sources.length === 1 ? 'citation' : 'citations'}
                </span>
              </div>

              <div className="citations-grid">
                {sources.map((src, idx) => (
                  <div className="citation-leaf" key={`${src.documentId}-${idx}`}>
                    <div className="citation-top">
                      <span className="pdf-mini-tag">PDF</span>
                      <span className="citation-filename" title={src.filename}>
                        {src.filename}
                      </span>
                      {src.page && <span className="citation-page-badge">Page {src.page}</span>}
                      {src.isHybridRRF && (
                        <span className="citation-rrf-tag" title="Verified via pgvector + RRF semantic fusion">
                          ✦ Hybrid RRF
                        </span>
                      )}
                    </div>
                    <blockquote className="citation-quote">
                      "{src.snippet}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
