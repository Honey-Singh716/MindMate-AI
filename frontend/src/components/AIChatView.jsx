import { useRef, useLayoutEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function AIChatView({
  activeConversation,
  onCreateConversation,
  message,
  setMessage,
  onSendMessage,
  busy,
  error,
  ragMode,
  setRagMode,
  lastSources,
  hasDocuments,
  selectedModel,
  onUploadDocument,
  uploading,
  uploadError,
  onRegenerate,
}) {
  const messagesScrollRef = useRef(null)
  const stickToBottom = useRef(true)

  const academicPrompts = [
    {
      title: 'Explain a difficult concept',
      prompt: 'Explain how attention mechanisms in transformers work using an intuitive analogy and step-by-step example.',
      icon: '💡',
      rag: false,
    },
    {
      title: 'Summarize my notes',
      prompt: 'Summarize the core principles, definitions, and key takeaways from my uploaded study documents.',
      icon: '📝',
      rag: true,
    },
    {
      title: 'Help me understand this PDF',
      prompt: 'Analyze the main methodology, assumptions, and algorithmic guarantees described in this document.',
      icon: '▤',
      rag: true,
    },
    {
      title: 'Create revision questions',
      prompt: 'Generate 5 challenging conceptual questions with answers to test my recall and understanding.',
      icon: '🎯',
      rag: false,
    },
  ]

  function scrollToBottom() {
    const el = messagesScrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }

  function handleScroll() {
    const el = messagesScrollRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }

  useLayoutEffect(() => {
    if (stickToBottom.current) {
      scrollToBottom()
    }
  }, [activeConversation?.history?.length, busy])

  function handlePromptClick(p) {
    if (!activeConversation) {
      onCreateConversation().then(() => {
        setMessage(p.prompt)
        if (p.rag && hasDocuments && setRagMode) setRagMode(true)
      })
    } else {
      setMessage(p.prompt)
      if (p.rag && hasDocuments && setRagMode) setRagMode(true)
    }
  }

  const hasHistory =
    activeConversation &&
    Array.isArray(activeConversation.history) &&
    activeConversation.history.length > 0

  return (
    <div className="academic-chat-workspace">
      {/* Subtle Academic Study Desk & Library Atmospheric Backdrop */}
      <div className="chat-study-backdrop" aria-hidden="true">
        <div className="chat-backdrop-image" />
        <div className="chat-backdrop-overlay" />
      </div>

      {!activeConversation || !hasHistory ? (
        /* Thoughtful Academic Empty State */
        <div className="chat-welcome-container animate-fade-in">
          <div className="welcome-inner-wrap">
            <div className="welcome-emblem">
              <span className="emblem-book-icon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#174C3C" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#174C3C" fill="rgba(23, 76, 60, 0.08)" />
                  <circle cx="12" cy="10" r="1.5" fill="#174C3C" />
                </svg>
              </span>
            </div>

            <span className="welcome-eyebrow">ACADEMIC STUDY TUTOR</span>
            <h1 className="welcome-heading">What would you like to understand today?</h1>
            <p className="welcome-subtext">
              Ask questions, explore your study material, or upload a document to begin.
            </p>

            {/* 4 Suggested Academic Prompt Cards */}
            <div className="welcome-prompts-grid">
              {academicPrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="academic-prompt-card"
                  onClick={() => handlePromptClick(p)}
                  type="button"
                >
                  <div className="prompt-card-top">
                    <span className="prompt-card-icon">{p.icon}</span>
                    <strong className="prompt-card-title">{p.title}</strong>
                    {p.rag && <span className="prompt-rag-badge">RAG</span>}
                  </div>
                  <p className="prompt-card-body">"{p.prompt}"</p>
                  <span className="prompt-card-hint">Click to ask tutor →</span>
                </button>
              ))}
            </div>

            {!activeConversation && (
              <div className="welcome-cta-strip">
                <button
                  className="welcome-primary-btn"
                  onClick={onCreateConversation}
                  type="button"
                >
                  <span>Start New Conversation</span>
                  <span className="btn-sparkle">✦</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Message Stream */
        <div
          className="chat-stream-scroll-area"
          ref={messagesScrollRef}
          onScroll={handleScroll}
        >
          <div className="conversation-centering-container">
            {activeConversation.history.map((msg, index) => {
              const isLast = index === activeConversation.history.length - 1
              return (
                <ChatMessage
                  key={`${msg.role}-${index}`}
                  message={msg}
                  isLastModel={isLast && msg.role === 'model'}
                  sources={lastSources}
                  onRegenerate={isLast && msg.role === 'model' ? onRegenerate : undefined}
                />
              )
            })}

            {/* Neural Thinking Indicator */}
            {busy && (
              <div className="tutor-thinking-banner animate-fade-in">
                <span className="thinking-sparkle">✦</span>
                <div className="thinking-pulse-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="thinking-status-text">
                  MindMate is synthesizing grounded response...
                </span>
              </div>
            )}

            {/* Chat Error Banner */}
            {error && (
              <div className="academic-error-banner animate-fade-in" role="alert">
                <span className="error-icon">⚠</span>
                <div className="error-text-col">
                  <strong>Notice</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Composer Container */}
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSubmit={onSendMessage}
        busy={busy}
        ragMode={ragMode}
        setRagMode={setRagMode}
        hasDocuments={hasDocuments}
        onUploadDocument={onUploadDocument}
        uploading={uploading}
        uploadError={uploadError}
      />
    </div>
  )
}
