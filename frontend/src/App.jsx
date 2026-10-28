import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'

const tokenKey = 'mindmate_token'

async function api(path, options = {}, token = localStorage.getItem(tokenKey)) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(path, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(data.error || 'Something went wrong.')
    err.payload = data
    throw err
  }
  return data
}

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, null)
      localStorage.setItem(tokenKey, data.token)
      onAuthenticated(data.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand"><span className="brand-mark">✦</span><strong>MindMate</strong></div>
        <p className="eyebrow">AI learning studio</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">{mode === 'login' ? 'Continue your private learning workspace.' : 'Keep your conversations private.'}</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}</button>
        </form>
        <button className="link-button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </section>
    </main>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [view, setView] = useState('chat')
  const [message, setMessage] = useState('')
  const [planInput, setPlanInput] = useState({ subject: '', hours: '', level: 'Beginner', goal: '', deadline: '' })
  const [plan, setPlan] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('mindmate_model') || '')
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState('')
  const [modelsStale, setModelsStale] = useState(false)
  const [modelUnavailable, setModelUnavailable] = useState(false)
  // RAG state
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [ragMode, setRagMode] = useState(false)
  const [lastSources, setLastSources] = useState([])

  // Refs for the scrollable conversation area and its auto-scroll behavior.
  const messagesRef = useRef(null)
  const stickToBottom = useRef(true)
  const lastConversationId = useRef(null)
  const fileInput = useRef(null)

  async function loadModels({ refresh = false } = {}) {
    setModelsLoading(true)
    setModelsError('')
    try {
      const data = await api(`/api/models${refresh ? '?refresh=1' : ''}`)
      const list = data.models || []
      setModels(list)
      setModelsStale(!!data.stale)
      const current = localStorage.getItem('mindmate_model') || ''
      const stillThere = list.some((model) => model.id === current)
      if (current && stillThere) {
        setSelectedModel(current)
        setModelUnavailable(false)
      } else if (current && !stillThere) {
        setSelectedModel('')
        setModelUnavailable(true)
      } else if (!current && list.length) {
        setSelectedModel(list[0].id)
        setModelUnavailable(false)
      }
    } catch (requestError) {
      setModelsError(requestError.message || 'Could not load models.')
    } finally {
      setModelsLoading(false)
    }
  }

  function chooseModel(id) {
    setSelectedModel(id)
    setModelUnavailable(false)
    if (id) localStorage.setItem('mindmate_model', id)
    else localStorage.removeItem('mindmate_model')
  }

  function handleApiError(requestError) {
    const payload = requestError.payload || {}
    if (payload.code === 'model_unavailable' && Array.isArray(payload.availableModels)) {
      setModels(payload.availableModels)
      setSelectedModel('')
      setModelUnavailable(true)
    }
    setError(requestError.message)
  }

  function scrollToBottom() {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  function handleMessagesScroll() {
    const el = messagesRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  async function loadConversations() {
    const data = await api('/api/conversations')
    setConversations(data.conversations)
    if (!active && data.conversations[0]) selectConversation(data.conversations[0].id)
  }

  async function selectConversation(id) {
    const data = await api(`/api/conversations/${encodeURIComponent(id)}`)
    setActive(data.conversation)
    setLastSources([])
  }

  async function createConversation() {
    const data = await api('/api/conversations', { method: 'POST', body: JSON.stringify({}) })
    setActive(data.conversation)
    await loadConversations()
  }

  async function updateConversation(id, changes) {
    try {
      const data = await api(`/api/conversations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      })
      if (active?.id === id) setActive(data.conversation)
      await loadConversations()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function renameConversation(conversation) {
    const title = window.prompt('Rename conversation', conversation.title)
    if (title === null || !title.trim() || title.trim() === conversation.title) return
    await updateConversation(conversation.id, { title: title.trim() })
  }

  async function deleteConversation(conversation) {
    if (!window.confirm(`Delete "${conversation.title}"?`)) return
    try {
      await api(`/api/conversations/${encodeURIComponent(conversation.id)}`, { method: 'DELETE' })
      if (active?.id === conversation.id) setActive(null)
      await loadConversations()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function sendMessage(event) {
    event.preventDefault()
    if (!message.trim() || !active || busy) return
    setBusy(true)
    stickToBottom.current = true
    setError('')
    setLastSources([])
    try {
      const data = await api(`/api/conversations/${active.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: message.trim(),
          ...(selectedModel ? { model: selectedModel } : {}),
          ...(ragMode ? { rag: true } : {}),
        }),
      })
      setActive(data.conversation)
      setLastSources(Array.isArray(data.sources) ? data.sources : [])
      setMessage('')
      await loadConversations()
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setBusy(false)
    }
  }

  async function generatePlan(event) {
    event.preventDefault()
    if (!active) return
    setBusy(true)
    setError('')
    setPlan(null)
    try {
      const data = await api(`/api/conversations/${active.id}/study-plan`, {
        method: 'POST',
        body: JSON.stringify({ ...planInput, ...(selectedModel ? { model: selectedModel } : {}) }),
      })
      setPlan(data.plan)
    } catch (requestError) {
      handleApiError(requestError)
    } finally {
      setBusy(false)
    }
  }

  // --- Documents (RAG) ---
  async function loadDocuments() {
    try {
      const data = await api('/api/documents')
      setDocuments(data.documents || [])
    } catch { /* keep last list on error */ }
  }

  async function uploadPdf(file) {
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem(tokenKey)}` },
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed.')
      await loadDocuments()
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function removeDocument(doc) {
    if (!window.confirm(`Delete "${doc.filename}"? This removes its chunks and embeddings.`)) return
    try {
      await api(`/api/documents/${encodeURIComponent(doc.id)}`, { method: 'DELETE' })
      await loadDocuments()
    } catch (e) {
      setError(e.message)
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey)
    setUser(null)
    setActive(null)
    setConversations([])
  }

  useEffect(() => {
    if (!localStorage.getItem(tokenKey)) return
    api('/api/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem(tokenKey))
  }, [])

  useEffect(() => {
    if (user) {
      loadConversations().catch((requestError) => setError(requestError.message))
      loadModels().catch(() => {})
      loadDocuments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useLayoutEffect(() => {
    const id = active?.id ?? null
    if (lastConversationId.current !== id) {
      lastConversationId.current = id
      stickToBottom.current = true
      scrollToBottom()
    }
  }, [active?.id])

  useLayoutEffect(() => {
    if (stickToBottom.current) scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.history?.length, busy, view])

  if (!user) return <AuthForm onAuthenticated={setUser} />

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><strong>MindMate</strong></div>
        <button className="primary new-chat" onClick={createConversation}>＋ New conversation</button>
        <nav className="main-nav">
          <button className={view === 'chat' ? 'nav-item active' : 'nav-item'} onClick={() => setView('chat')}>◈ AI Chat</button>
          <button className={view === 'planner' ? 'nav-item active' : 'nav-item'} onClick={() => setView('planner')}>▦ Study Planner</button>
          <button className={view === 'documents' ? 'nav-item active' : 'nav-item'} onClick={() => setView('documents')}>▤ Documents</button>
        </nav>
        <p className="section-label">Recent conversations</p>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <div className={active?.id === conversation.id ? 'conversation active' : 'conversation'} key={conversation.id}>
              <button className="conversation-title" onClick={() => selectConversation(conversation.id)}>
                {conversation.pinned && <span className="pin-mark" title="Pinned">●</span>}
                <span>{conversation.title}</span>
              </button>
              <details className="conversation-menu">
                <summary aria-label={`Actions for ${conversation.title}`}>⋯</summary>
                <div className="menu-popover">
                  <button onClick={() => renameConversation(conversation)}>Rename</button>
                  <button onClick={() => updateConversation(conversation.id, { pinned: !conversation.pinned })}>{conversation.pinned ? 'Unpin' : 'Pin'}</button>
                  <button className="danger-action" onClick={() => deleteConversation(conversation)}>Delete</button>
                </div>
              </details>
            </div>
          ))}
        </div>
        <button className="logout" onClick={logout}>Log out</button>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <ModelSelector
            models={models}
            selected={selectedModel}
            loading={modelsLoading}
            error={modelsError}
            stale={modelsStale}
            unavailable={modelUnavailable}
            onChange={chooseModel}
            onRefresh={() => loadModels({ refresh: true })}
          />
          <span className="muted">Private workspace</span><span className="profile">{user.email.slice(0, 1).toUpperCase()}</span>
        </header>
        <div className="chat">
          {view === 'planner' ? (
            <section className="planner">
              <p className="eyebrow">Build your path</p>
              <h1>Study Planner</h1>
              <p className="muted">Turn a goal into a practical, focused learning plan.</p>
              {!active ? (
                <div className="notice">Create a conversation before generating a study plan.</div>
              ) : (
                <form className="planner-form" onSubmit={generatePlan}>
                  <label>What do you want to learn?<input required value={planInput.subject} onChange={(event) => setPlanInput({ ...planInput, subject: event.target.value })} placeholder="e.g. Node.js backend development" /></label>
                  <div className="form-row">
                    <label>Available hours<input required type="number" min="0.5" step="0.5" value={planInput.hours} onChange={(event) => setPlanInput({ ...planInput, hours: event.target.value })} placeholder="8" /></label>
                    <label>Skill level<select value={planInput.level} onChange={(event) => setPlanInput({ ...planInput, level: event.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
                  </div>
                  <label>What is your goal?<textarea required rows="3" value={planInput.goal} onChange={(event) => setPlanInput({ ...planInput, goal: event.target.value })} placeholder="e.g. Build and deploy a production-ready API" /></label>
                  <label>Deadline <span className="muted">(optional)</span><input type="date" value={planInput.deadline} onChange={(event) => setPlanInput({ ...planInput, deadline: event.target.value })} /></label>
                  <button className="primary" disabled={busy}>{busy ? 'Building your plan...' : 'Generate my plan →'}</button>
                </form>
              )}
              {plan && <PlanCard plan={plan} />}
              {error && <p className="error">{error}</p>}
            </section>
          ) : view === 'documents' ? (
            <section className="documents">
              <p className="eyebrow">Knowledge base</p>
              <h1>Documents</h1>
              <p className="muted">Upload study PDFs, then toggle “Ask my docs” in chat to answer from them.</p>
              <form className="upload-form" onSubmit={(event) => { event.preventDefault(); uploadPdf(fileInput.current?.files?.[0]) }}>
                <input type="file" accept="application/pdf" ref={fileInput} aria-label="Choose a PDF" />
                <button className="primary" disabled={uploading}>{uploading ? 'Uploading & indexing…' : 'Upload PDF'}</button>
              </form>
              {uploadError && <p className="error">{uploadError}</p>}
              <div className="document-list">
                {documents.map((doc) => (
                  <div className="document-item" key={doc.id}>
                    <div>
                      <strong>{doc.filename}</strong>
                      <p className="muted">{doc.total_pages ?? '?'} pages · {doc.chunk_count} chunks · {Math.max(1, Math.round((doc.size_bytes || 0) / 1024))} KB</p>
                    </div>
                    <button className="danger-action" onClick={() => removeDocument(doc)}>Delete</button>
                  </div>
                ))}
                {documents.length === 0 && <p className="muted">No documents uploaded yet.</p>}
              </div>
              {error && <p className="error">{error}</p>}
            </section>
          ) : (
          !active ? (
            <div className="empty"><p className="eyebrow">Your focused learning companion</p><h1>What are you curious about?</h1><p className="muted">Create a conversation to start learning with Groq-powered MindMate.</p><button className="primary" onClick={createConversation}>Start learning</button></div>
          ) : (
            <>
              <div className="messages" ref={messagesRef} onScroll={handleMessagesScroll}>
                {active.history.map((item, index) => <article className={`message ${item.role}`} key={`${item.role}-${index}`}><b>{item.role === 'model' ? '✦' : 'You'}</b><span>{item.parts?.map((part) => part.text).join(' ')}</span></article>)}
                {busy && <p className="muted">MindMate is thinking...</p>}
                {lastSources.length > 0 && (
                  <div className="sources">
                    <p className="eyebrow">Sources</p>
                    {lastSources.map((source, index) => (
                      <div className="source" key={`${source.documentId}-${index}`}>
                        <strong>{source.filename}</strong>{source.page ? <span className="muted"> · page {source.page}</span> : null}
                        <p className="muted">{source.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form className="composer" onSubmit={sendMessage}>
                <label className="rag-toggle" title="Answer from your uploaded documents">
                  <input type="checkbox" checked={ragMode} onChange={(event) => setRagMode(event.target.checked)} /> Ask my docs
                </label>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask MindMate anything..." rows="3" />
                <button className="primary" disabled={busy}>Send</button>
              </form>
              {error && <p className="error">{error}</p>}
            </>
          )
          )}
        </div>
      </section>
    </main>
  )
}

function ModelSelector({ models, selected, loading, error, stale, unavailable, onChange, onRefresh }) {
  return (
    <div className="model-selector" title={stale ? 'Model list may be outdated — click refresh to update.' : undefined}>
      {loading ? (
        <span className="model-loading">Loading models…</span>
      ) : error ? (
        <span className="model-error" title={error}>
          Models unavailable
          <button className="model-refresh" onClick={onRefresh} type="button" aria-label="Retry loading models">↺</button>
        </span>
      ) : (
        <>
          {unavailable && (
            <span className="model-unavailable-notice" role="alert">
              Previous model is unavailable — please pick another:
            </span>
          )}
          <select
            aria-label="Select AI model"
            value={selected}
            onChange={(event) => onChange(event.target.value)}
            className={unavailable ? 'model-select model-select--warn' : 'model-select'}
          >
            {unavailable && <option value="">— choose a model —</option>}
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.id}</option>
            ))}
          </select>
          {stale && <span className="model-stale-badge" title="List may be outdated">⚠</span>}
          <button className="model-refresh" onClick={onRefresh} type="button" aria-label="Refresh model list" title="Refresh model list">↺</button>
        </>
      )}
    </div>
  )
}

function PlanCard({ plan }) {
  return (
    <article className="plan-card">
      <h2>{plan.title}</h2>
      <p className="muted">{plan.totalHours} total hours</p>
      {plan.topics.map((topic, index) => (
        <div className="plan-topic" key={`${topic.topic}-${index}`}>
          <div>
            <h3>{topic.topic}</h3>
            <p className="muted">{topic.hours} hours · {topic.keyConcepts.join(', ')}</p>
            <p>{topic.exercise}</p>
          </div>
          <span className={`priority ${topic.priority.toLowerCase()}`}>{topic.priority}</span>
        </div>
      ))}
    </article>
  )
}

export default App
