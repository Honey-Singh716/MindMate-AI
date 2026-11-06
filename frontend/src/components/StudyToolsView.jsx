import { useState } from 'react'

export default function StudyToolsView({
  type = 'explorer', // 'explorer' | 'notes' | 'flashcards'
  onAskConcept,
  onGoToChat,
  documents = [],
}) {
  // Concept Explorer State
  const [selectedConcept, setSelectedConcept] = useState(0)

  const concepts = [
    {
      id: 'raft-consensus',
      title: 'Raft Consensus Algorithm',
      category: 'Distributed Systems',
      tag: 'Core Algorithm',
      summary:
        'A consensus algorithm designed to be understandable. It decomposes state machine replication into leader election, log replication, and safety guarantees.',
      keyTakeaways: [
        'Leader Election: Randomized election timers prevent split votes.',
        'Log Replication: Leader appends entries and commits only after majority quorum.',
        'Election Safety: Candidates must possess all previously committed entries to win.',
      ],
      prompt: 'Explain the Raft consensus algorithm step-by-step, specifically how election safety is enforced.',
    },
    {
      id: 'vector-embeddings',
      title: 'Dense Vector Embeddings & RAG',
      category: 'Information Retrieval',
      tag: 'Vector AI',
      summary:
        'Representing words and documents as 384-dimensional dense numerical vectors where semantic similarity corresponds to cosine proximity.',
      keyTakeaways: [
        'MiniLM-L6-v2: Generates compact 384-dim dense embeddings in under 20ms.',
        'Cosine Similarity: Distance metric measuring the angular orientation between query and passage.',
        'pgvector: PostgreSQL vector extension enabling HNSW indexing and sub-second top-k search.',
      ],
      prompt: 'How does pgvector perform cosine similarity search on 384-dimensional embeddings?',
    },
    {
      id: 'transformer-attention',
      title: 'Multi-Head Attention Mechanisms',
      category: 'Deep Learning',
      tag: 'Neural Architecture',
      summary:
        'The core mechanism of transformer architectures allowing models to dynamically focus on different words in a sequence regardless of their relative distance.',
      keyTakeaways: [
        'Query, Key, Value: Matrices project tokens into subspaces for affinity dot-product scoring.',
        'Softmax Scaling: Attention weights are normalized to sum to 1 across the sequence.',
        'Multi-Head Diversity: Multiple attention heads capture varied syntactic and semantic relationships.',
      ],
      prompt: 'Can you explain the mathematical formulation of scaled dot-product attention in transformers?',
    },
    {
      id: 'consistent-hashing',
      title: 'Consistent Hashing & Partitioning',
      category: 'Distributed Systems',
      tag: 'System Design',
      summary:
        'A distributed hashing scheme that operates independently of the number of servers, minimizing remapped keys when nodes scale up or down.',
      keyTakeaways: [
        'Hash Ring: Both nodes and keys are mapped onto a 360-degree circular ring.',
        'Virtual Nodes: Prevents hotspot imbalance by mapping multiple virtual positions per physical server.',
        'Rebalance Cost: Adding or removing a node only moves K/N keys on average.',
      ],
      prompt: 'How does consistent hashing with virtual nodes prevent data skew in distributed databases?',
    },
  ]

  // Flashcards State
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)

  const flashcards = [
    {
      q: 'What is the primary condition required for a candidate to win an election in Raft?',
      a: 'A candidate must receive affirmative votes from a strict majority quorum (> N/2) of cluster nodes, and its log must be at least as up-to-date as any voter’s log.',
      topic: 'Distributed Systems',
    },
    {
      q: 'Why are vector embeddings normalized to unit length before computing cosine distance?',
      a: 'When vectors are unit length (L2 norm = 1), cosine similarity simplifies to a simple dot product (A · B), drastically accelerating retrieval speed.',
      topic: 'Vector Retrieval',
    },
    {
      q: 'What is the role of the Softmax function in transformer attention layers?',
      a: 'Softmax converts raw dot-product affinity scores between queries and keys into a probability distribution over the sequence tokens.',
      topic: 'Machine Learning',
    },
    {
      q: 'What is the difference between RRF (Reciprocal Rank Fusion) and pure vector search?',
      a: 'Pure vector search finds semantic proximity; RRF combines rankings from both semantic vector search and exact BM25 keyword search, eliminating false positives.',
      topic: 'RAG Architecture',
    },
  ]

  // Notes State
  const sampleNotes = [
    {
      title: 'Distributed Consensus & Raft Notes',
      date: 'Updated today',
      doc: 'Distributed_Systems_Lecture_04.pdf',
      bullets: [
        'Strict Quorum Rule: Any two majorities must overlap by at least one server.',
        'Leader authoritative: Followers never send log entries to the leader.',
        'Heartbeat: Minimum interval of 50ms ensures followers remain in sync.',
      ],
    },
    {
      title: 'Vector Search & Information Retrieval',
      date: 'Updated 2 days ago',
      doc: 'pgvector_indexing_guide.pdf',
      bullets: [
        'HNSW (Hierarchical Navigable Small World) provides sub-5ms approximate nearest neighbors.',
        'Chunk size of 600 characters with 100 character overlap preserves context boundaries.',
        'RAG grounding citations must reference page number and exact quote snippet.',
      ],
    },
  ]

  const active = concepts[selectedConcept]
  const currentCard = flashcards[cardIndex]

  return (
    <div className="study-tools-canvas animate-fade-in">
      <div className="study-tools-inner">
        {/* VIEW 1: CONCEPT EXPLORER */}
        {type === 'explorer' && (
          <div className="concept-explorer-view">
            <div className="tools-header-strip">
              <div className="tools-badge">
                <span className="badge-spark">✦</span>
                <span>KNOWLEDGE GRAPH</span>
              </div>
              <h1 className="tools-title">Concept Explorer</h1>
              <p className="tools-subtitle">
                Explore foundational academic concepts, inspect their core mechanics, and launch grounded discussions.
              </p>
            </div>

            <div className="explorer-two-col">
              {/* Left concepts list */}
              <div className="concepts-nav-col">
                <span className="col-label">DISCOVERED CONCEPTS</span>
                <div className="concepts-list">
                  {concepts.map((c, idx) => (
                    <button
                      key={c.id}
                      className={`concept-select-card ${selectedConcept === idx ? 'active' : ''}`}
                      onClick={() => setSelectedConcept(idx)}
                    >
                      <div className="concept-card-top">
                        <span className="concept-category">{c.category}</span>
                        <span className="concept-tag">{c.tag}</span>
                      </div>
                      <strong className="concept-name">{c.title}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right concept deep dive panel */}
              <div className="concept-detail-panel animate-fade-in" key={active.id}>
                <div className="detail-top-badge">
                  <span className="detail-category">{active.category}</span>
                  <span className="detail-pill">{active.tag}</span>
                </div>

                <h2 className="detail-title">{active.title}</h2>
                <p className="detail-summary">{active.summary}</p>

                <div className="takeaways-box">
                  <strong className="takeaways-title">Key Core Principles:</strong>
                  <ul className="takeaways-list">
                    {active.keyTakeaways.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-cta-row">
                  <button
                    className="ask-concept-btn"
                    onClick={() => onAskConcept(active.prompt)}
                  >
                    <span>Ask MindMate in Chat →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SMART NOTES */}
        {type === 'notes' && (
          <div className="smart-notes-view">
            <div className="tools-header-strip">
              <div className="tools-badge">
                <span className="badge-spark">✦</span>
                <span>STRUCTURED LEARNING</span>
              </div>
              <h1 className="tools-title">Smart Study Notes</h1>
              <p className="tools-subtitle">
                Structured takeaways, core definitions, and revision summaries generated from your course materials.
              </p>
            </div>

            <div className="notes-grid">
              {sampleNotes.map((n, idx) => (
                <div className="note-card animate-fade-in" key={idx}>
                  <div className="note-card-head">
                    <span className="note-date">{n.date}</span>
                    <span className="note-doc-ref">▤ {n.doc}</span>
                  </div>
                  <h3 className="note-title">{n.title}</h3>
                  <ul className="note-bullets">
                    {n.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                  <div className="note-footer-action">
                    <button
                      className="note-ask-btn"
                      onClick={() => onAskConcept(`Explain more about: ${n.title}`)}
                    >
                      Deep Dive in Chat →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ACTIVE RECALL FLASHCARDS */}
        {type === 'flashcards' && (
          <div className="flashcards-view">
            <div className="tools-header-strip">
              <div className="tools-badge">
                <span className="badge-spark">✦</span>
                <span>ACTIVE RECALL</span>
              </div>
              <h1 className="tools-title">Revision Flashcards</h1>
              <p className="tools-subtitle">
                Test your conceptual recall. Flip the card to inspect the answer, then progress to the next prompt.
              </p>
            </div>

            <div className="flashcard-workspace">
              <div className="flashcard-progress-bar">
                <span>
                  Card {cardIndex + 1} of {flashcards.length}
                </span>
                <span className="mastered-count">✦ {masteredCount} Mastered</span>
              </div>

              {/* 3D Flip Card */}
              <div
                className={`flashcard-3d-box ${flipped ? 'is-flipped' : ''}`}
                onClick={() => setFlipped(!flipped)}
                title="Click card to flip"
              >
                <div className="flashcard-front">
                  <span className="card-topic-pill">{currentCard.topic}</span>
                  <p className="card-question">{currentCard.q}</p>
                  <span className="card-flip-prompt">Click to flip & inspect answer ↷</span>
                </div>
                <div className="flashcard-back">
                  <span className="card-answer-label">Academic Explanation</span>
                  <p className="card-answer">{currentCard.a}</p>
                  <span className="card-flip-prompt">Click to flip back ↶</span>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flashcard-controls">
                <button
                  className="flashcard-btn prev-btn"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setFlipped(false)
                    setCardIndex((prev) => Math.max(0, prev - 1))
                  }}
                >
                  ← Previous
                </button>

                <button
                  className="flashcard-btn mastered-btn"
                  onClick={() => {
                    setMasteredCount((c) => c + 1)
                    setFlipped(false)
                    if (cardIndex < flashcards.length - 1) {
                      setCardIndex((c) => c + 1)
                    }
                  }}
                >
                  ✓ Mark Mastered
                </button>

                <button
                  className="flashcard-btn next-btn"
                  onClick={() => {
                    setFlipped(false)
                    if (cardIndex < flashcards.length - 1) {
                      setCardIndex((c) => c + 1)
                    } else {
                      setCardIndex(0)
                    }
                  }}
                >
                  {cardIndex < flashcards.length - 1 ? 'Next Card →' : 'Start Over ↺'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

