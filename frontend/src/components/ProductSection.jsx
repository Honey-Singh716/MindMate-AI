import { useState } from 'react'

export default function ProductSection({ onSelectFeature }) {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <section id="product" className="product-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-block">
          <div className="section-tag">
            <span className="tag-spark">✦</span>
            <span>CAPABILITIES</span>
          </div>
          <h2 className="section-title">
            An Intelligence That<br />
            <span className="gradient-text-neural">Understands How You Learn.</span>
          </h2>
          <p className="section-subtitle">
            Engineered with deep neural architecture, MindMate combines sub-second Groq inference,
            vector semantic search, and personalized pedagogical synthesis into a unified studio.
          </p>
        </div>

        {/* Feature Nav Tabs */}
        <div className="capability-tabs">
          <button
            className={`cap-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="tab-icon">◈</span>
            <span className="tab-title">AI Chat</span>
          </button>
          <button
            className={`cap-tab ${activeTab === 'rag' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag')}
          >
            <span className="tab-icon">▤</span>
            <span className="tab-title">Document Intelligence</span>
          </button>
          <button
            className={`cap-tab ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            <span className="tab-icon">▦</span>
            <span className="tab-title">Smart Study Planner</span>
          </button>
          <button
            className={`cap-tab ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <span className="tab-icon">⟐</span>
            <span className="tab-title">Model Intelligence</span>
          </button>
        </div>

        {/* Interactive Showcase Stage */}
        <div className="capability-stage">
          {activeTab === 'chat' && (
            <div className="stage-card stage-chat animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">01 · CONVERSATIONAL ENGINE</span>
                <h3 className="stage-title">AI Chat</h3>
                <p className="stage-desc">
                  Explore ideas, ask questions, and understand complex concepts through AI-powered conversations.
                  Whether breaking down quantum mechanics or debugging asynchronous JavaScript, MindMate adapts
                  to your learning pace.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Sub-second Groq streaming
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Syntax-highlighted code output
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Persistent private session threads
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('chat')}>
                  Open AI Chat Studio →
                </button>
              </div>

              <div className="stage-right">
                <div className="interactive-chat-mock">
                  <div className="mock-window-header">
                    <div className="mock-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span className="mock-title">Session: Neural Network Backprop</span>
                    <span className="mock-model-pill">llama-3.3-70b-versatile</span>
                  </div>

                  <div className="mock-messages">
                    <div className="mock-msg mock-user">
                      <span className="mock-avatar">U</span>
                      <div className="mock-bubble">
                        How does the chain rule apply when computing gradients in a deep neural layer?
                      </div>
                    </div>

                    <div className="mock-msg mock-assistant">
                      <span className="mock-avatar assistant-mark">✦</span>
                      <div className="mock-bubble">
                        <p className="mock-lead">
                          In backpropagation, the chain rule allows us to compute the gradient of the loss
                          function with respect to each weight by working backward through the computational graph:
                        </p>
                        <div className="mock-code-block">
                          <code>
                            {`// Loss gradient with respect to weight W[l]
dZ[l] = dA[l] ⊙ g'[l](Z[l])
dW[l] = (1/m) * dZ[l] · A[l-1].T
db[l] = (1/m) * sum(dZ[l])`}
                          </code>
                        </div>
                        <p className="mock-note">
                          Each layer receives incoming error gradients from upstream and propagates them to earlier weights.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rag' && (
            <div className="stage-card stage-rag animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">02 · GROUNDED RETRIEVAL</span>
                <h3 className="stage-title">Document Intelligence</h3>
                <p className="stage-desc">
                  Upload your study materials and ask questions grounded in your own documents.
                  Using Transformers.js all-MiniLM-L6-v2 embeddings and PostgreSQL pgvector, MindMate pinpoints
                  exact paragraphs with page-level citations.
                </p>
                <div className="stage-highlights-grid">
                  <div className="highlight-box">
                    <span className="hl-icon">📄</span>
                    <strong>PDF Ingestion</strong>
                    <p>In-memory text parsing up to 5MB with zero disk leakage</p>
                  </div>
                  <div className="highlight-box">
                    <span className="hl-icon">⚡</span>
                    <strong>Semantic Vector Search</strong>
                    <p>Cosine similarity matching against chunked knowledge bases</p>
                  </div>
                  <div className="highlight-box">
                    <span className="hl-icon">🎯</span>
                    <strong>Exact Page Citations</strong>
                    <p>Inspect exact page and passage snippets verifying answers</p>
                  </div>
                  <div className="highlight-box">
                    <span className="hl-icon">🔒</span>
                    <strong>Private Embeddings</strong>
                    <p>Scoped strictly to your authenticated workspace user account</p>
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('documents')}>
                  Manage Documents →
                </button>
              </div>

              <div className="stage-right">
                <div className="rag-visual-mock">
                  <div className="doc-preview-card">
                    <div className="doc-icon-badge">PDF</div>
                    <div className="doc-meta">
                      <strong>Distributed_Systems_Lecture_4.pdf</strong>
                      <span>28 pages · 142 chunks · 3.2 MB</span>
                    </div>
                    <span className="doc-status-badge">Indexed</span>
                  </div>

                  {/* Neural connection bridge */}
                  <div className="neural-bridge-animation">
                    <div className="bridge-wire"></div>
                    <div className="bridge-pulse"></div>
                    <span className="bridge-tag">MiniLM 384-dim vector match (0.892 similarity)</span>
                  </div>

                  <div className="citation-preview-card">
                    <div className="citation-header">
                      <span className="citation-badge">Grounding Source</span>
                      <span className="citation-page">Page 14 · Paragraph 3</span>
                    </div>
                    <p className="citation-snippet">
                      "In the Raft consensus algorithm, safety is guaranteed by the Leader Completeness property:
                      if a log entry is committed in a given term, then that entry will be present in the logs of the leaders
                      for all higher-numbered terms."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="stage-card stage-planner animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">03 · STRUCTURED LEARNING</span>
                <h3 className="stage-title">Smart Study Planner</h3>
                <p className="stage-desc">
                  Transform your learning goals into organized study plans.
                  Tell MindMate what topic you wish to master, your weekly available hours, your current skill level,
                  and target deadline. MindMate synthesizes a prioritized milestone curriculum.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Day-wise topic progression
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Priority weighted milestones (High / Medium / Low)
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Practical exercises & concept checklists
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('planner')}>
                  Generate Study Plan →
                </button>
              </div>

              <div className="stage-right">
                <div className="planner-timeline-mock">
                  <div className="timeline-header">
                    <div>
                      <span className="timeline-eyebrow">CURRICULUM PREVIEW</span>
                      <h4 className="timeline-title">Fullstack React & Next.js Architecture</h4>
                    </div>
                    <span className="timeline-hours">24 Total Hours</span>
                  </div>

                  <div className="timeline-items">
                    <div className="timeline-item">
                      <div className="timeline-marker high"></div>
                      <div className="timeline-info">
                        <div className="timeline-top">
                          <strong>State Synchronization & React 19 Actions</strong>
                          <span className="timeline-badge high">HIGH PRIORITY</span>
                        </div>
                        <p className="timeline-sub">4 hours · Server components, useActionState, optimistic updates</p>
                        <p className="timeline-exercise">Exercise: Build an optimistic comment stream with rollback</p>
                      </div>
                    </div>

                    <div className="timeline-item">
                      <div className="timeline-marker medium"></div>
                      <div className="timeline-info">
                        <div className="timeline-top">
                          <strong>Edge Caching & Streaming SSR</strong>
                          <span className="timeline-badge medium">MEDIUM</span>
                        </div>
                        <p className="timeline-sub">6 hours · Partial Prerendering, Suspense boundaries, ISR</p>
                        <p className="timeline-exercise">Exercise: Configure nested layouts with streaming data skeleton</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="stage-card stage-models animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">04 · MODEL ADAPTABILITY</span>
                <h3 className="stage-title">Model Intelligence</h3>
                <p className="stage-desc">
                  Choose from available Groq AI models and personalize your AI chat experience.
                  Dynamic model probing queries the Groq API in real-time, validating model health, context limits,
                  and graceful fallback if a model undergoes maintenance.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Live Groq API model probing & sync
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Instant zero-downtime model switching
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✦</span> Persistent local storage preference
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('chat')}>
                  Select Dynamic Model →
                </button>
              </div>

              <div className="stage-right">
                <div className="model-selector-mock">
                  <div className="mock-selector-header">
                    <span>DYNAMIC GROQ REPOSITORY</span>
                    <button className="mock-refresh-btn" title="Probe Groq API">↺ Refreshing live</button>
                  </div>

                  <div className="model-cards-stack">
                    <div className="model-card-item active">
                      <div className="model-card-radio">●</div>
                      <div className="model-card-details">
                        <strong>llama-3.3-70b-versatile</strong>
                        <span>Top reasoning capability · 128k context window · 320 T/s</span>
                      </div>
                      <span className="model-rec-tag">Recommended</span>
                    </div>

                    <div className="model-card-item">
                      <div className="model-card-radio">○</div>
                      <div className="model-card-details">
                        <strong>llama-3.1-8b-instant</strong>
                        <span>Ultra-low latency conversational speed · 128k context</span>
                      </div>
                      <span className="model-speed-tag">Instant</span>
                    </div>

                    <div className="model-card-item">
                      <div className="model-card-radio">○</div>
                      <div className="model-card-details">
                        <strong>mixtral-8x7b-32768</strong>
                        <span>MoE balanced architecture · 32k context window</span>
                      </div>
                      <span className="model-speed-tag">MoE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
