import { useState } from 'react'

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1)

  const steps = [
    {
      num: '01',
      title: 'Upload Study Material',
      subtitle: 'Document Ingestion',
      desc: 'Drop in your course textbooks, lecture slides, or seminar papers up to 5 MB. In-memory validation parses text safely without writing raw files to disk.',
      detail: 'In-Memory Stream Parsing · Strict MIME Validation · Tenant Isolation',
      preview: {
        title: 'Distributed_Systems_Ch2.pdf',
        meta: '28 Pages · 142 Semantic Chunks',
        highlight: 'Uploaded and partitioned into 600-character overlapping study segments.',
      },
    },
    {
      num: '02',
      title: 'Neural Understanding',
      subtitle: 'Vector Semantic Indexing',
      desc: 'Text is partitioned into clean semantic chunks and transformed into 384-dimensional dense vectors stored in PostgreSQL pgvector for sub-second retrieval.',
      detail: 'MiniLM-L6-v2 Embeddings · HNSW Vector Index · pgvector Cosine Distance',
      preview: {
        title: 'Neural Indexing Matrix',
        meta: '384 Dimensions · Unit Normalized',
        highlight: 'Vectors capture conceptual meaning rather than brittle keyword matching.',
      },
    },
    {
      num: '03',
      title: 'Ask & Explore Concepts',
      subtitle: 'Grounded Reasoning & Tutor',
      desc: 'Ask questions in natural language. MindMate retrieves the most relevant passages and conditions Groq AI models to answer with verified page citations.',
      detail: 'Hybrid RRF Search · Sub-second Groq Inference · Zero Hallucination Guardrails',
      preview: {
        title: 'Contextual Query Retrieval',
        meta: 'Cosine Match: 0.92 · Page 14 Citation',
        highlight: 'Answers cite exact document names, page numbers, and snippet quotations.',
      },
    },
    {
      num: '04',
      title: 'Generate Notes & Revise',
      subtitle: 'Curriculum & Smart Summaries',
      desc: 'Transform insights into persistent study plans, concept checklists, and revision cheat-sheets customized to your target exam date and weekly hours.',
      detail: 'Milestone Progressions · Priority Scheduling · Dynamic Knowledge Retention',
      preview: {
        title: 'Structured Revision Curriculum',
        meta: '4 Milestones · High / Med Priority',
        highlight: 'Review structured takeaways and test your recall with conceptual exercises.',
      },
    },
  ]

  const current = steps[activeStep - 1]

  return (
    <section id="how-it-works" className="how-section">
      <div className="section-container">
        {/* Header */}
        <div className="section-header-block">
          <div className="section-tag">
            <span className="tag-spark">✦</span>
            <span>METHODOLOGY</span>
          </div>
          <h2 className="section-title">
            How Learning Happens<br />
            <span className="serif-accent">Inside MindMate.</span>
          </h2>
          <p className="section-subtitle">
            A clear, four-step educational methodology that takes you from raw documents to deep conceptual mastery.
          </p>
        </div>

        {/* 4 Step Pipeline Grid */}
        <div className="pipeline-four-steps">
          {steps.map((step, idx) => {
            const stepNum = idx + 1
            const isActive = stepNum === activeStep
            return (
              <button
                key={step.num}
                className={`pipeline-step-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStep(stepNum)}
              >
                <div className="step-card-num-row">
                  <span className="step-card-num">{step.num}</span>
                  {isActive && <span className="step-active-dot"></span>}
                </div>
                <h3 className="step-card-title">{step.title}</h3>
                <span className="step-card-sub">{step.subtitle}</span>
              </button>
            )
          })}
        </div>

        {/* Active Step Detailed Stage */}
        <div className="pipeline-stage-panel animate-fade-in" key={current.num}>
          <div className="stage-panel-left">
            <div className="stage-step-tag">
              <span className="step-badge">STAGE {current.num} OF 04</span>
              <span className="step-subtitle">{current.subtitle}</span>
            </div>
            <h3 className="stage-panel-title">{current.title}</h3>
            <p className="stage-panel-desc">{current.desc}</p>
            <div className="stage-spec-box">
              <span className="spec-label">ACADEMIC & TECHNICAL SPECIFICATION</span>
              <code className="spec-code">{current.detail}</code>
            </div>

            <div className="stage-nav-controls">
              <button
                className="stage-nav-btn"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((p) => Math.max(1, p - 1))}
              >
                ← Previous Stage
              </button>
              <button
                className="stage-nav-btn next-btn"
                disabled={activeStep === steps.length}
                onClick={() => setActiveStep((p) => Math.min(steps.length, p + 1))}
              >
                Next Stage →
              </button>
            </div>
          </div>

          <div className="stage-panel-right">
            <div className="stage-preview-artifact">
              <div className="preview-top-bar">
                <span className="preview-sparkle">✦</span>
                <span className="preview-artifact-title">{current.preview.title}</span>
                <span className="preview-status-pill">{current.preview.meta}</span>
              </div>
              <div className="preview-artifact-content">
                <p className="preview-body-text">{current.preview.highlight}</p>
                <div className="preview-meta-row">
                  <span className="preview-meta-tag">Verified Grounding</span>
                  <span className="preview-meta-tag">100% Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
