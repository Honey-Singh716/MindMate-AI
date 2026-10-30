import { useState } from 'react'

export default function LearningExperienceSection({ onEnterApp }) {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <section id="experience" className="experience-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-block">
          <div className="section-tag">
            <span className="tag-spark">✦</span>
            <span>WORKSPACE PREVIEW</span>
          </div>
          <h2 className="section-title">
            Your Personal<br />
            <span className="gradient-text-neural">Learning Space.</span>
          </h2>
          <p className="section-subtitle">
            An intelligent workspace engineered for clarity and flow. Inspect the actual interface you will use every day.
          </p>
        </div>

        {/* Live Interface Frame */}
        <div className="experience-workspace-frame">
          <div className="frame-chrome-bar">
            <div className="chrome-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="chrome-address">
              <span className="lock-icon">🔒</span>
              <span>mindmate.local / workspace / neural-studio</span>
            </div>
            <div className="chrome-tabs">
              <button
                className={`chrome-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                ◈ AI Chat
              </button>
              <button
                className={`chrome-tab ${activeTab === 'planner' ? 'active' : ''}`}
                onClick={() => setActiveTab('planner')}
              >
                ▦ Study Planner
              </button>
              <button
                className={`chrome-tab ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                ▤ Documents
              </button>
            </div>
          </div>

          <div className="frame-workspace-body">
            {/* Sidebar Preview */}
            <aside className="frame-sidebar">
              <div className="frame-brand">
                <span className="brand-dot">✦</span>
                <strong>MindMate</strong>
              </div>
              <button className="frame-new-chat-btn" onClick={onEnterApp}>
                ＋ New conversation
              </button>

              <div className="frame-sidebar-nav">
                <div className={`frame-nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                  ◈ AI Chat
                </div>
                <div className={`frame-nav-item ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
                  ▦ Study Planner
                </div>
                <div className={`frame-nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                  ▤ Documents
                </div>
              </div>

              <div className="frame-history-list">
                <span className="frame-history-head">RECENT THREADS</span>
                <div className="frame-thread-item active">
                  <span className="pin-dot">●</span>
                  <span>Transformer Attention Mechanism</span>
                </div>
                <div className="frame-thread-item">
                  <span>Calculus Optimization Gradient</span>
                </div>
                <div className="frame-thread-item">
                  <span>Distributed Systems Raft Consensus</span>
                </div>
              </div>

              <div className="frame-user-card">
                <span className="frame-avatar">U</span>
                <div className="frame-user-meta">
                  <span className="frame-user-email">scholar@mindmate.ai</span>
                  <span className="frame-user-status">Private Session</span>
                </div>
              </div>
            </aside>

            {/* Main Content Area Preview */}
            <main className="frame-main">
              {/* Topbar */}
              <header className="frame-topbar">
                <div className="frame-model-selector">
                  <span className="selector-icon">⚙</span>
                  <span className="selector-name">llama-3.3-70b-versatile</span>
                  <span className="selector-arrow">▾</span>
                  <span className="selector-refresh" title="Probe Groq API">↺</span>
                </div>
                <div className="frame-workspace-badge">
                  <span className="status-live-dot"></span>
                  <span>Private Neural Workspace</span>
                </div>
              </header>

              {/* View 1: Chat Preview */}
              {activeTab === 'chat' && (
                <div className="frame-chat-view animate-fade-in">
                  <div className="frame-chat-messages">
                    <div className="frame-msg user">
                      <div className="msg-author">You</div>
                      <div className="msg-text">
                        Summarize the key architectural benefits of pgvector over traditional keyword search.
                      </div>
                    </div>

                    <div className="frame-msg assistant">
                      <div className="msg-author">
                        <span className="brand-spark">✦</span> MindMate
                      </div>
                      <div className="msg-text">
                        <p>
                          Unlike lexical matching which only catches exact keyword strings, <strong>pgvector</strong> computes
                          embeddings in a continuous vector space:
                        </p>
                        <ul>
                          <li><strong>Semantic Understanding:</strong> Captures synonyms, conceptual intent, and cross-domain questions.</li>
                          <li><strong>Unified Storage:</strong> Keeps relational metadata, user ownership, and vectors in one ACID PostgreSQL database.</li>
                          <li><strong>Exact Citations:</strong> Returns similarity scores allowing MindMate to pinpoint exact document chunks.</li>
                        </ul>
                      </div>
                      {/* Citations block */}
                      <div className="frame-sources-box">
                        <div className="sources-title">Grounded in Uploaded Documents</div>
                        <div className="sources-row">
                          <span className="source-doc">Vector_Databases_Overview.pdf</span>
                          <span className="source-page">Page 7</span>
                          <span className="source-chunk">"pgvector enables HNSW and IVFFlat index traversal..."</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Input Dock */}
                  <div className="frame-dock">
                    <div className="dock-bar">
                      <label className="dock-rag-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Ask my docs</span>
                      </label>
                      <input
                        type="text"
                        className="dock-input"
                        placeholder="Ask MindMate anything or query your indexed documents..."
                        readOnly
                      />
                      <button className="dock-send-btn" onClick={onEnterApp}>
                        Send →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Planner Preview */}
              {activeTab === 'planner' && (
                <div className="frame-planner-view animate-fade-in">
                  <div className="planner-preview-card">
                    <div className="planner-card-head">
                      <div>
                        <span className="badge-eyebrow">ACTIVE CURRICULUM</span>
                        <h4>Systems Architecture & Concurrent Programming</h4>
                        <p className="meta-info">Total Time: 16 Hours · Level: Intermediate</p>
                      </div>
                      <button className="btn-plan-action" onClick={onEnterApp}>Regenerate Plan</button>
                    </div>

                    <div className="planner-tasks-list">
                      <div className="planner-task-card">
                        <div className="task-priority-marker high"></div>
                        <div className="task-content">
                          <div className="task-row">
                            <h5>Thread Synchronization & Mutex Primitives</h5>
                            <span className="priority-pill high">HIGH</span>
                          </div>
                          <p className="task-desc">4 hours · Deadlock prevention, condition variables, atomic operations</p>
                          <span className="task-exercise">Exercise: Implement a thread-safe bounded lock-free queue</span>
                        </div>
                      </div>

                      <div className="planner-task-card">
                        <div className="task-priority-marker medium"></div>
                        <div className="task-content">
                          <div className="task-row">
                            <h5>Actor Model & Message Passing</h5>
                            <span className="priority-pill medium">MEDIUM</span>
                          </div>
                          <p className="task-desc">5 hours · Isolated state, mailbox processing, supervision trees</p>
                          <span className="task-exercise">Exercise: Build an async pipeline with worker pools</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: Documents Preview */}
              {activeTab === 'documents' && (
                <div className="frame-docs-view animate-fade-in">
                  <div className="docs-preview-dropzone">
                    <span className="drop-icon">▤</span>
                    <p className="drop-lead">Drag and drop your study PDF here, or browse files</p>
                    <span className="drop-sub">Supports PDF up to 5MB · Local MiniLM embedding generation</span>
                  </div>

                  <div className="docs-preview-list">
                    <div className="doc-item-row">
                      <div className="doc-icon">PDF</div>
                      <div className="doc-text">
                        <strong>Neural_Networks_Deep_Learning.pdf</strong>
                        <span>42 pages · 210 chunks · 4.1 MB · Indexed</span>
                      </div>
                      <span className="doc-action-tag">Grounded</span>
                    </div>

                    <div className="doc-item-row">
                      <div className="doc-icon">PDF</div>
                      <div className="doc-text">
                        <strong>Linear_Algebra_Strang_Notes.pdf</strong>
                        <span>18 pages · 92 chunks · 1.8 MB · Indexed</span>
                      </div>
                      <span className="doc-action-tag">Grounded</span>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Enter CTA */}
        <div className="experience-cta-wrap">
          <button className="enter-studio-btn" onClick={onEnterApp}>
            <span>Launch MindMate Studio</span>
            <span className="btn-sparkle">✦</span>
          </button>
        </div>
      </div>
    </section>
  )
}
