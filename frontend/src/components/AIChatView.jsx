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
}) {
  const messagesScrollRef = useRef(null)
  const stickToBottom = useRef(true)

  const suggestedPrompts = [
    {
      title: 'Explain a difficult concept',
      prompt: 'Explain how attention mechanisms in transformers work using an intuitive analogy.',
      icon: '💡',
    },
    {
      title: 'Help me prepare for an exam',
      prompt: 'Generate 5 challenging conceptual questions to test my understanding of distributed systems.',
      icon: '🎯',
    },
    {
      title: 'Summarize my study material',
      prompt: 'Summarize the core takeaways and principles from my uploaded notes.',
      icon: '📝',
      rag: true,
    },
    {
      title: 'Create a learning roadmap',
      prompt: 'Build a step-by-step 4-week roadmap to master modern backend development with PostgreSQL and Node.js.',
      icon: '🗺',
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
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90
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
        if (p.rag && hasDocuments) setRagMode(true)
      })
    } else {
      setMessage(p.prompt)
      if (p.rag && hasDocuments) setRagMode(true)
    }
  }

  const hasHistory = activeConversation && activeConversation.history && activeConversation.history.length > 0

  return (
    <div className="neural-chat-workspace">
      {!activeConversation || !hasHistory ? (
        /* Empty State with Neural Orb & Prompts */
        <div className="chat-empty-state animate-fade-in">
          <div className="empty-neural-core">
            <div className="core-orb"></div>
            <div className="core-pulse-ring ring-1"></div>
            <div className="core-pulse-ring ring-2"></div>
            <span className="core-symbol">✦</span>
          </div>

          <span className="empty-eyebrow">NEURAL LEARNING COMPANION</span>
          <h2 className="empty-title">Your ideas start here.</h2>
          <p className="empty-subtitle">
            Ask questions, explore concepts, and turn curiosity into understanding with accelerated AI.
          </p>

          {/* Suggested Prompt Cards */}
          <div className="suggested-prompts-grid">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                className="prompt-suggestion-card"
                onClick={() => handlePromptClick(p)}
              >
                <div className="prompt-top">
                  <span className="prompt-icon">{p.icon}</span>
                  <span className="prompt-title">{p.title}</span>
                </div>
                <p className="prompt-desc">"{p.prompt}"</p>
                <span className="prompt-action">Try prompt →</span>
              </button>
            ))}
          </div>

          {!activeConversation && (
            <div className="empty-action-wrap">
              <button className="empty-start-btn" onClick={onCreateConversation}>
                <span>Start New Conversation</span>
                <span className="btn-sparkle">✦</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Messages Stream */
        <div
          className="chat-messages-scroll"
          ref={messagesScrollRef}
          onScroll={handleScroll}
        >
          <div className="messages-inner-container">
            {activeConversation.history.map((msg, index) => {
              const isLast = index === activeConversation.history.length - 1
              return (
                <ChatMessage
                  key={`${msg.role}-${index}`}
                  message={msg}
                  isLastModel={isLast && msg.role === 'model'}
                  sources={lastSources}
                />
              )
            })}

            {/* Neural Thinking Indicator */}
            {busy && (
              <div className="neural-thinking-pill animate-fade-in">
                <span className="thinking-pulse-spark">✦</span>
                <div className="thinking-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="thinking-text">MindMate is synthesizing neural pathways...</span>
              </div>
            )}

            {error && (
              <div className="chat-error-banner animate-fade-in" role="alert">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Floating Input Dock */}
      {activeConversation && (
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSubmit={onSendMessage}
          busy={busy}
          ragMode={ragMode}
          setRagMode={setRagMode}
          hasDocuments={hasDocuments}
          modelName={selectedModel}
        />
      )}
    </div>
  )
}
