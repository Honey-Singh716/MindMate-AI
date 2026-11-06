import { useState } from 'react'

export default function ProductSection({ onSelectFeature }) {
  const [activeTab, setActiveTab] = useState('doc-intel')

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
            An Academic Companion<br />
            <span className="serif-accent">Designed for Real Study.</span>
          </h2>
          <p className="section-subtitle">
            MindMate unifies document-grounded retrieval, contextual AI tutoring, and curriculum synthesis
            into an organized, distraction-free academic workspace.
          </p>
        </div>

        {/* 4 Feature Nav Tabs matching User Specification */}
        <div className="capability-tabs">
          <button
            className={`cap-tab ${activeTab === 'doc-intel' ? 'active' : ''}`}
            onClick={() => setActiveTab('doc-intel')}
          >
            <span className="tab-number">01</span>
            <span className="tab-title">Document Intelligence</span>
          </button>
          <button
            className={`cap-tab ${activeTab === 'tutor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutor')}
          >
            <span className="tab-number">02</span>
            <span className="tab-title">AI Study Tutor</span>
          </button>
          <button
            className={`cap-tab ${activeTab === 'concept' ? 'active' : ''}`}
            onClick={() => setActiveTab('concept')}
          >
            <span className="tab-number">03</span>
            <span className="tab-title">Concept Explorer</span>
          </button>
          <button
            className={`cap-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <span className="tab-number">04</span>
            <span className="tab-title">Smart Notes</span>
          </button>
        </div>

        {/* Interactive Showcase Stage */}
        <div className="capability-stage">
          {/* 01 - Document Intelligence */}
          {activeTab === 'doc-intel' && (
            <div className="stage-card stage-doc animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">01 · KNOWLEDGE BASE</span>
                <h3 className="stage-title">Document Intelligence</h3>
                <p className="stage-desc">
                  Upload textbooks, research papers, and slide decks. MindMate ingests text into private
                  vector embeddings and grounds answers directly in your study material with exact page citations.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> In-memory PDF parsing up to 5 MB
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> 384-dimensional pgvector cosine retrieval
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Verified page and passage citations
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('documents')}>
                  Explore Documents Workspace →
                </button>
              </div>

              <div className="stage-right">
                <div className="doc-intelligence-preview">
                  <div className="preview-doc-card">
                    <div className="doc-card-top">
                      <span className="pdf-label">PDF</span>
                      <div>
                        <strong className="doc-card-name">Algorithms_Design_Ch4.pdf</strong>
                        <span className="doc-card-meta">32 pages · 128 chunks indexed</span>
                      </div>
                      <span className="badge-grounded">Indexed</span>
                    </div>

                    <div className="doc-card-passage">
                      <span className="passage-tag">CITATION SNIPPET · P. 84</span>
                      <p className="passage-quote">
                        "Dynamic programming solves each subproblem once and caches the result in a lookup table,
                        avoiding exponential redundant recomputation in overlapping subproblems."
                      </p>
                    </div>

                    <div className="doc-card-footer">
                      <span className="match-pill">Cosine similarity: 0.914</span>
                      <span className="tenant-pill">Tenant Isolated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 02 - AI Study Tutor */}
          {activeTab === 'tutor' && (
            <div className="stage-card stage-tutor animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">02 · CONTEXTUAL EXPLANATION</span>
                <h3 className="stage-title">AI Study Tutor</h3>
                <p className="stage-desc">
                  Ask questions, receive step-by-step conceptual breakdowns, and explore difficult coursework.
                  Powered by ultra-fast Groq LPU inference, explanations feel natural, fast, and academically rigorous.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Sub-second streaming conversational reasoning
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Formatted mathematical notation and code
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Persistent session history and thread isolation
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('chat')}>
                  Launch AI Study Tutor →
                </button>
              </div>

              <div className="stage-right">
                <div className="tutor-chat-preview">
                  <div className="tutor-header">
                    <span className="tutor-dot"></span>
                    <span className="tutor-title">Session: Computational Complexity</span>
                  </div>
                  <div className="tutor-bubble student-bubble">
                    Can you explain why Dijkstra's algorithm fails with negative edge weights?
                  </div>
                  <div className="tutor-bubble assistant-bubble">
                    <p>
                      <strong>Greedy Invariant Violation:</strong> Dijkstra assumes that once a vertex is marked visited,
                      its shortest path is finalized. A negative edge can create a shorter subsequent path after a vertex
                      is finalized, invalidating this greedy assumption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 03 - Concept Explorer */}
          {activeTab === 'concept' && (
            <div className="stage-card stage-concept animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">03 · KNOWLEDGE GRAPH</span>
                <h3 className="stage-title">Concept Explorer</h3>
                <p className="stage-desc">
                  Discover how core principles connect across your documents. MindMate maps prerequisite
                  relationships and related theories so you can build mental models that stick.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Prerequisite & dependent concept discovery
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Cross-document topic synthesis
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Interactive concept drill-downs
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('chat')}>
                  Explore Concepts in Chat →
                </button>
              </div>

              <div className="stage-right">
                <div className="concept-graph-preview">
                  <div className="concept-node primary-node">
                    <span className="node-kind">CORE CONCEPT</span>
                    <strong>Backpropagation</strong>
                  </div>
                  <div className="concept-links">
                    <div className="link-item">
                      <span className="link-arrow">↳</span>
                      <div className="linked-node">
                        <strong>Chain Rule (Calculus)</strong>
                        <span>Mathematical foundation</span>
                      </div>
                    </div>
                    <div className="link-item">
                      <span className="link-arrow">↳</span>
                      <div className="linked-node">
                        <strong>Gradient Descent</strong>
                        <span>Optimization algorithm</span>
                      </div>
                    </div>
                    <div className="link-item">
                      <span className="link-arrow">↳</span>
                      <div className="linked-node">
                        <strong>Vanishing Gradients</strong>
                        <span>Architectural bottleneck</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 04 - Smart Notes */}
          {activeTab === 'notes' && (
            <div className="stage-card stage-notes animate-fade-in">
              <div className="stage-left">
                <span className="stage-badge">04 · SYNTHESIS & REVISION</span>
                <h3 className="stage-title">Smart Notes</h3>
                <p className="stage-desc">
                  Transform lengthy lectures and readings into structured revision briefs.
                  Generate key formula cheat-sheets, exam flashcards, and chronological topic summaries in seconds.
                </p>
                <div className="stage-features-list">
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Structured summaries with key takeaways
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Priority-ordered revision checklists
                  </div>
                  <div className="feat-chip">
                    <span className="chip-bullet">✓</span> Instant flashcard synthesis from PDFs
                  </div>
                </div>
                <button className="stage-cta-btn" onClick={() => onSelectFeature?.('planner')}>
                  Build Revision Plan →
                </button>
              </div>

              <div className="stage-right">
                <div className="smart-notes-preview">
                  <div className="note-card">
                    <div className="note-header">
                      <span className="note-badge">REVISION NOTE</span>
                      <span className="note-date">Generated from Lecture 08</span>
                    </div>
                    <h4 className="note-title">CAP Theorem & Distributed Consensus</h4>
                    <ul className="note-bullet-list">
                      <li><strong>Consistency:</strong> Every read receives the most recent write or an error.</li>
                      <li><strong>Availability:</strong> Non-failing nodes return non-error responses.</li>
                      <li><strong>Partition Tolerance:</strong> Sustained operation despite dropped network messages.</li>
                    </ul>
                    <div className="note-footer-tag">✦ Rule: In an asynchronous network, you must choose C or A.</div>
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
