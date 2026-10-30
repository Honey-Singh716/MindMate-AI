import { useState, useEffect } from 'react'

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1)
  const [autoPlay, setAutoPlay] = useState(true)

  const steps = [
    {
      num: '01',
      title: 'UPLOAD',
      subtitle: 'Document Ingestion',
      desc: 'The user uploads a study PDF or notes up to 5MB. In-memory validation parses character streams without writing raw files to disk.',
      detail: 'In-Memory Buffer · Busboy / PDFParse · Strict MIME Validation',
      graphic: 'pdf',
    },
    {
      num: '02',
      title: 'UNDERSTAND',
      subtitle: 'Semantic Chunking',
      desc: 'MindMate extracts text, cleans formatting artifacts, and divides the document into overlapping semantic chunks with preserved page metadata.',
      detail: 'Sliding Window · 600 Char Chunks · Page Number Association',
      graphic: 'chunk',
    },
    {
      num: '03',
      title: 'EMBED',
      subtitle: 'Neural Vectorization',
      desc: 'The local Transformers.js all-MiniLM-L6-v2 pipeline converts text chunks into 384-dimensional dense numerical embeddings on CPU or GPU.',
      detail: 'MiniLM-L6-v2 · 384 Dimensions · Zero Third-party Leakage',
      graphic: 'embed',
    },
    {
      num: '04',
      title: 'RETRIEVE',
      subtitle: 'Vector Similarity Search',
      desc: 'When you ask a question in chat, your query is embedded and matched against chunks using PostgreSQL pgvector cosine similarity (<=>).',
      detail: 'pgvector Cosine Distance · Top-K Selection · JSONB Fallback',
      graphic: 'search',
    },
    {
      num: '05',
      title: 'GENERATE',
      subtitle: 'Grounded Groq Inference',
      desc: 'Groq synthesizes an authoritative answer by conditioning the prompt with retrieved passages, avoiding hallucinations.',
      detail: 'Llama 3.3 70B · Context Grounding · Instant Output Streaming',
      graphic: 'groq',
    },
    {
      num: '06',
      title: 'CITE',
      subtitle: 'Verifiable Citations',
      desc: 'The answer is delivered with exact document names, page citations, and passage snippets so you can verify truth directly.',
      detail: 'Source Highlights · Page Indexing · Clickable Snippets',
      graphic: 'cite',
    },
  ]

  // Auto cycle steps every 5 seconds if user is not manually interacting
  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % steps.length) + 1)
    }, 4500)
    return () => clearInterval(timer)
  }, [autoPlay, steps.length])

  const current = steps[activeStep - 1]

  return (
    <section id="how-it-works" className="how-section">
      <div className="section-container">
        {/* Header */}
        <div className="section-header-block">
          <div className="section-tag">
            <span className="tag-spark">✦</span>
            <span>RAG ARCHITECTURE</span>
          </div>
          <h2 className="section-title">
            Your Knowledge.<br />
            <span className="gradient-text-neural">Connected.</span>
          </h2>
          <p className="section-subtitle">
            Experience our 6-stage Retrieval-Augmented Generation pipeline.
            See how your lecture slides, notes, and research papers are transformed into living neural knowledge.
          </p>
        </div>

        {/* 6 Step Progress Pipeline */}
        <div className="pipeline-timeline">
          <div className="pipeline-line">
            <div
              className="pipeline-line-fill"
              style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          <div className="pipeline-steps-grid">
            {steps.map((s, idx) => {
              const stepNumber = idx + 1
              const isPast = stepNumber < activeStep
              const isCurrent = stepNumber === activeStep

              return (
                <button
                  key={s.num}
                  className={`pipeline-node-btn ${isCurrent ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => {
                    setAutoPlay(false)
                    setActiveStep(stepNumber)
                  }}
                >
                  <div className="node-circle">
                    <span className="node-num">{s.num}</span>
                    {isCurrent && <span className="node-glow-ring"></span>}
                  </div>
                  <span className="node-label">{s.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Step Display */}
        <div className="pipeline-stage-card">
          <div className="pipeline-stage-left">
            <div className="stage-step-tag">
              <span className="step-badge">STEP {current.num} OF 06</span>
              <span className="step-subtitle">{current.subtitle}</span>
            </div>
            <h3 className="pipeline-title">{current.title}</h3>
            <p className="pipeline-desc">{current.desc}</p>
            <div className="pipeline-tech-detail">
              <span className="tech-label">TECHNICAL SPECIFICATION</span>
              <code className="tech-code">{current.detail}</code>
            </div>

            <div className="pipeline-controls">
              <button
                className="pipeline-prev-btn"
                disabled={activeStep === 1}
                onClick={() => {
                  setAutoPlay(false)
                  setActiveStep((p) => Math.max(1, p - 1))
                }}
              >
                ← Previous
              </button>
              <button
                className="pipeline-next-btn"
                disabled={activeStep === steps.length}
                onClick={() => {
                  setAutoPlay(false)
                  setActiveStep((p) => Math.min(steps.length, p + 1))
                }}
              >
                Next Stage →
              </button>
              <button
                className={`pipeline-play-btn ${autoPlay ? 'active' : ''}`}
                onClick={() => setAutoPlay(!autoPlay)}
                title={autoPlay ? 'Pause auto-cycle' : 'Resume auto-cycle'}
              >
                {autoPlay ? '⏸ Pause' : '▶ Auto-play'}
              </button>
            </div>
          </div>

          {/* Interactive animated diagram for this step */}
          <div className="pipeline-stage-right">
            <div className="pipeline-diagram-box">
              {current.graphic === 'pdf' && (
                <div className="diagram-pdf-stage animate-fade-in">
                  <div className="upload-dropzone-mock">
                    <div className="pdf-sheet">
                      <div className="sheet-corner"></div>
                      <span className="pdf-chip">PDF</span>
                      <div className="sheet-lines">
                        <span></span><span></span><span></span><span></span>
                      </div>
                    </div>
                    <div className="upload-arrow-particle">
                      <span className="arrow-beam"></span>
                      <span>Indexing buffer</span>
                    </div>
                  </div>
                </div>
              )}

              {current.graphic === 'chunk' && (
                <div className="diagram-chunk-stage animate-fade-in">
                  <div className="chunks-grid">
                    <div className="chunk-slice slice-1">
                      <span className="slice-tag">Chunk #1 · Page 1</span>
                      <div className="slice-txt">"Transformers rely on multi-head self-attention..."</div>
                    </div>
                    <div className="chunk-slice slice-2">
                      <span className="slice-tag">Chunk #2 · Page 1-2</span>
                      <div className="slice-txt">"Each head projects queries, keys, and values..."</div>
                    </div>
                    <div className="chunk-slice slice-3">
                      <span className="slice-tag">Chunk #3 · Page 2</span>
                      <div className="slice-txt">"Scaled dot-product prevents vanishing gradients..."</div>
                    </div>
                  </div>
                </div>
              )}

              {current.graphic === 'embed' && (
                <div className="diagram-embed-stage animate-fade-in">
                  <div className="vector-cube-mock">
                    <div className="vector-matrix">
                      <span className="mat-head">all-MiniLM-L6-v2 Embeddings (384-float array)</span>
                      <div className="mat-values">
                        <span>[+0.0482,</span>
                        <span>-0.1294,</span>
                        <span>+0.8841,</span>
                        <span>+0.0120,</span>
                        <span>-0.3459,</span>
                        <span>+0.2198,</span>
                        <span>... 378 more floats]</span>
                      </div>
                    </div>
                    <div className="vector-sparks">
                      <div className="spark-node s1"></div>
                      <div className="spark-node s2"></div>
                      <div className="spark-node s3"></div>
                    </div>
                  </div>
                </div>
              )}

              {current.graphic === 'search' && (
                <div className="diagram-search-stage animate-fade-in">
                  <div className="search-cone-vis">
                    <div className="query-orb">
                      <span>Query Vector</span>
                    </div>
                    <div className="similarity-rays">
                      <div className="ray r1">
                        <span className="ray-match">Match 96%</span>
                        <div className="target-dot"></div>
                      </div>
                      <div className="ray r2">
                        <span className="ray-match">Match 89%</span>
                        <div className="target-dot"></div>
                      </div>
                      <div className="ray r3">
                        <span className="ray-match">Match 82%</span>
                        <div className="target-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {current.graphic === 'groq' && (
                <div className="diagram-groq-stage animate-fade-in">
                  <div className="groq-infer-chip">
                    <div className="chip-light"></div>
                    <span className="groq-brand">Groq LPUs™</span>
                    <span className="groq-speed">380 Tokens/sec</span>
                    <div className="stream-tokens">
                      <span>Conditioning</span>
                      <span>Retrieved</span>
                      <span>Chunks</span>
                      <span>Grounded</span>
                      <span>Synthesizing</span>
                    </div>
                  </div>
                </div>
              )}

              {current.graphic === 'cite' && (
                <div className="diagram-cite-stage animate-fade-in">
                  <div className="citation-final-card">
                    <div className="cite-badge-verified">
                      <span>✓</span> Grounded Answer Verified
                    </div>
                    <p className="cite-text">
                      "Attention is calculated using Q, K, and V matrices scaled by √d_k..."
                    </p>
                    <div className="cite-pill">
                      <span>Lecture_Transformers.pdf</span>
                      <span className="page-tag">Page 4</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
