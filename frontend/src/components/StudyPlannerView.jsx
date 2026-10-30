import { useState } from 'react'

export default function StudyPlannerView({
  planInput,
  setPlanInput,
  onGeneratePlan,
  plan,
  busy,
  error,
  activeConversation,
  onCreateConversation,
}) {
  const [completedTopics, setCompletedTopics] = useState({})

  function toggleTopic(index) {
    setCompletedTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const completedCount = Object.values(completedTopics).filter(Boolean).length
  const totalTopics = plan?.topics?.length || 0
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0

  return (
    <div className="planner-workspace-scroll">
      <div className="planner-content-container">
        {/* Planner Hero Header */}
        <div className="planner-header-block">
          <div className="planner-tag">
            <span className="tag-spark">✦</span>
            <span>BUILD YOUR PATH</span>
          </div>
          <h1 className="planner-main-title">Design Your Learning Path.</h1>
          <p className="planner-subtitle">
            Turn your learning goals into a practical, focused plan with structured milestones.
          </p>
        </div>

        {/* Notice if no conversation is active */}
        {!activeConversation ? (
          <div className="planner-notice-card">
            <span className="notice-icon">ℹ</span>
            <div className="notice-content">
              <strong>Conversation Context Required</strong>
              <p>MindMate attaches your curriculum to an active conversation thread so you can iterate on it.</p>
            </div>
            <button className="notice-action-btn" onClick={onCreateConversation}>
              Initialize Thread →
            </button>
          </div>
        ) : (
          /* Form */
          <form className="planner-curriculum-form" onSubmit={onGeneratePlan}>
            <div className="form-field-group">
              <label className="field-label" htmlFor="plan-subject">
                What do you want to learn?
              </label>
              <input
                id="plan-subject"
                type="text"
                className="planner-text-input"
                required
                placeholder="e.g. Distributed Database Architecture & Raft Consensus"
                value={planInput.subject}
                onChange={(e) => setPlanInput({ ...planInput, subject: e.target.value })}
              />
            </div>

            <div className="form-row-duo">
              <div className="form-field-group">
                <label className="field-label" htmlFor="plan-hours">
                  Available hours
                </label>
                <input
                  id="plan-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="planner-text-input"
                  required
                  placeholder="e.g. 12"
                  value={planInput.hours}
                  onChange={(e) => setPlanInput({ ...planInput, hours: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label" htmlFor="plan-level">
                  Skill level
                </label>
                <div className="select-wrapper">
                  <select
                    id="plan-level"
                    className="planner-select-input"
                    value={planInput.level}
                    onChange={(e) => setPlanInput({ ...planInput, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label" htmlFor="plan-goal">
                What is your specific outcome or goal?
              </label>
              <textarea
                id="plan-goal"
                rows="3"
                className="planner-textarea-input"
                required
                placeholder="e.g. Implement a fault-tolerant leader election algorithm and pass automated chaos network tests"
                value={planInput.goal}
                onChange={(e) => setPlanInput({ ...planInput, goal: e.target.value })}
              />
            </div>

            <div className="form-field-group">
              <div className="label-with-optional">
                <label className="field-label" htmlFor="plan-deadline">
                  Target Deadline
                </label>
                <span className="optional-tag">optional</span>
              </div>
              <input
                id="plan-deadline"
                type="date"
                className="planner-text-input date-input"
                value={planInput.deadline}
                onChange={(e) => setPlanInput({ ...planInput, deadline: e.target.value })}
              />
            </div>

            {error && (
              <div className="planner-error-banner" role="alert">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="planner-submit-btn" disabled={busy}>
              {busy ? (
                <span className="btn-busy-content">
                  <span className="btn-spinner"></span>
                  <span>Synthesizing custom learning curriculum...</span>
                </span>
              ) : (
                <span>Generate Study Plan →</span>
              )}
            </button>
          </form>
        )}

        {/* Generated Plan Timeline Display */}
        {plan && (
          <div className="generated-plan-container animate-fade-in">
            <div className="plan-summary-card">
              <div className="plan-title-area">
                <span className="plan-badge-spark">✦ SYNTHESIZED CURRICULUM</span>
                <h2 className="plan-generated-title">{plan.title}</h2>
                <div className="plan-meta-row">
                  <span className="meta-pill">⏱ {plan.totalHours} total study hours</span>
                  <span className="meta-pill">📚 {plan.topics.length} focused milestones</span>
                  {progressPercent > 0 && (
                    <span className="meta-pill progress-pill">
                      ✓ {completedCount}/{totalTopics} completed ({progressPercent}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="plan-progress-track">
                <div
                  className="plan-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Timeline Milestones */}
            <div className="plan-timeline-flow">
              {plan.topics.map((topic, index) => {
                const isCompleted = !!completedTopics[index]
                const priorityClass = topic.priority.toLowerCase()

                return (
                  <div
                    key={`${topic.topic}-${index}`}
                    className={`timeline-milestone-card ${isCompleted ? 'milestone-done' : ''}`}
                  >
                    <div className="milestone-indicator-col">
                      <button
                        className={`milestone-check-circle ${isCompleted ? 'checked' : ''}`}
                        onClick={() => toggleTopic(index)}
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        aria-label={`Toggle completion for ${topic.topic}`}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </button>
                      {index < plan.topics.length - 1 && <div className="milestone-connector-line"></div>}
                    </div>

                    <div className="milestone-content-card">
                      <div className="milestone-card-top">
                        <div className="milestone-heading-group">
                          <span className="milestone-day-tag">MILESTONE {index + 1}</span>
                          <h3 className="milestone-topic-title">{topic.topic}</h3>
                        </div>
                        <div className="milestone-tags-group">
                          <span className="milestone-hours-tag">⏱ {topic.hours}h</span>
                          <span className={`milestone-priority-tag priority-${priorityClass}`}>
                            {topic.priority} PRIORITY
                          </span>
                        </div>
                      </div>

                      {/* Key Concepts Chips */}
                      <div className="milestone-concepts-row">
                        <span className="concepts-label">Core Concepts:</span>
                        <div className="concept-chips">
                          {topic.keyConcepts.map((concept, cIdx) => (
                            <span className="concept-chip" key={cIdx}>
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practical Exercise */}
                      <div className="milestone-exercise-box">
                        <span className="exercise-icon">⚡</span>
                        <div className="exercise-text">
                          <strong>Practical Exercise:</strong> {topic.exercise}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
