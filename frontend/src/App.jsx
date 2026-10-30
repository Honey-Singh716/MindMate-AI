import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import AuthModal from './components/AuthModal'
import AppLayout from './components/AppLayout'
import AIChatView from './components/AIChatView'
import StudyPlannerView from './components/StudyPlannerView'
import DocumentsView from './components/DocumentsView'
import { api, apiUpload } from './api'
import './App.css'

const tokenKey = 'mindmate_token'

export default function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('landing') // 'landing' | 'workspace'
  const [authModalMode, setAuthModalMode] = useState(null) // null | 'login' | 'signup'

  // Workspace state
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [view, setView] = useState('chat') // 'chat' | 'planner' | 'documents'

  function handleSetView(newView) {
    setError('')
    setUploadError('')
    setView(newView)
  }
  const [message, setMessage] = useState('')
  const [planInput, setPlanInput] = useState({ subject: '', hours: '', level: 'Beginner', goal: '', deadline: '' })
  const [plan, setPlan] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Models state
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('mindmate_model') || '')
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState('')
  const [modelsStale, setModelsStale] = useState(false)
  const [modelUnavailable, setModelUnavailable] = useState(false)

  // Documents / RAG state
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [ragMode, setRagMode] = useState(false)
  const [lastSources, setLastSources] = useState([])

  // Global Toast / Feedback state
  const [toastMessage, setToastMessage] = useState(null)

  function showToast(msg, duration = 3000) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur))
    }, duration)
  }

  // Load available Groq models from backend
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
      if (refresh) showToast('Groq model list synchronized')
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
    showToast(requestError.message, 4500)
  }

  async function loadConversations(currentActiveId = active?.id) {
    try {
      const data = await api('/api/conversations')
      const list = data.conversations || []
      setConversations(list)
      if (list.length === 0) {
        // No conversations yet — clear active so the next message auto-creates one
        setActive(null)
      } else if (!currentActiveId || !list.some((c) => c.id === currentActiveId)) {
        // Active conversation was deleted or is stale — switch to the most recent one
        selectConversation(list[0].id)
      }
      // If currentActiveId exists in the list, keep the existing active state (no extra fetch)
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }

  async function selectConversation(id) {
    try {
      const data = await api(`/api/conversations/${encodeURIComponent(id)}`)
      setActive(data.conversation)
      setLastSources([])
      setError('')
    } catch (e) {
      console.error('Failed to fetch conversation:', e)
      if (e.status === 404 || e.message === 'Conversation not found.') {
        setActive(null)
      }
    }
  }

  async function createConversation() {
    try {
      const data = await api('/api/conversations', { method: 'POST', body: JSON.stringify({}) })
      setActive(data.conversation)
      setConversations((prev) => [
        {
          id: data.conversation.id,
          title: data.conversation.title,
          createdAt: data.conversation.createdAt,
          updatedAt: data.conversation.updatedAt,
          pinned: false,
          messageCount: (data.conversation.history || []).length,
        },
        ...prev.filter((c) => c.id !== data.conversation.id),
      ])
      showToast('Created new conversation thread')
      return data.conversation
    } catch (e) {
      setError(e.message)
      return null
    }
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
    const title = window.prompt('Rename conversation title:', conversation.title)
    if (title === null || !title.trim() || title.trim() === conversation.title) return
    await updateConversation(conversation.id, { title: title.trim() })
  }

  async function deleteConversation(conversation) {
    if (!window.confirm(`Delete conversation "${conversation.title}"?`)) return
    try {
      await api(`/api/conversations/${encodeURIComponent(conversation.id)}`, { method: 'DELETE' })
      if (active?.id === conversation.id) setActive(null)
      await loadConversations()
      showToast('Conversation deleted')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function sendMessage(event) {
    if (event) event.preventDefault()
    if (!message.trim() || busy) return

    let currentActive = active
    if (!currentActive) {
      currentActive = await createConversation()
      if (!currentActive) return
    }

    setBusy(true)
    setError('')
    setLastSources([])
    const messageToSend = message.trim()
    setMessage('')

    try {
      const data = await api(`/api/conversations/${currentActive.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: messageToSend,
          ...(selectedModel ? { model: selectedModel } : {}),
          ...(ragMode ? { rag: true } : {}),
        }),
      })
      setActive(data.conversation)
      setLastSources(Array.isArray(data.sources) ? data.sources : [])
      await loadConversations(data.conversation.id)
    } catch (requestError) {
      // Auto-recover if conversation was wiped on a server restart.
      // Silently create a new conversation and retry — no error banner shown to user.
      if (requestError.status === 404 || requestError.message === 'Conversation not found.' || requestError.payload?.error === 'Conversation not found.') {
        try {
          const fresh = await createConversation()
          if (fresh) {
            const retryData = await api(`/api/conversations/${fresh.id}/chat`, {
              method: 'POST',
              body: JSON.stringify({
                message: messageToSend,
                ...(selectedModel ? { model: selectedModel } : {}),
                ...(ragMode ? { rag: true } : {}),
              }),
            })
            setActive(retryData.conversation)
            setLastSources(Array.isArray(retryData.sources) ? retryData.sources : [])
            await loadConversations(retryData.conversation.id)
            return
          }
        } catch (retryError) {
          setMessage(messageToSend)
          handleApiError(retryError)
          return
        }
      }
      // Restore user text on error
      setMessage(messageToSend)
      handleApiError(requestError)
    } finally {
      setBusy(false)
    }
  }

  async function generatePlan(event) {
    if (event) event.preventDefault()
    let currentActive = active
    if (!currentActive) {
      currentActive = await createConversation()
      if (!currentActive) return
    }

    setBusy(true)
    setError('')
    setPlan(null)
    try {
      const data = await api(`/api/conversations/${currentActive.id}/study-plan`, {
        method: 'POST',
        body: JSON.stringify({ ...planInput, ...(selectedModel ? { model: selectedModel } : {}) }),
      })
      setPlan(data.plan)
      showToast('Study curriculum synthesized successfully')
    } catch (requestError) {
      if (requestError.status === 404 || requestError.message === 'Conversation not found.' || requestError.payload?.error === 'Conversation not found.') {
        try {
          const fresh = await createConversation()
          if (fresh) {
            const retryData = await api(`/api/conversations/${fresh.id}/study-plan`, {
              method: 'POST',
              body: JSON.stringify({ ...planInput, ...(selectedModel ? { model: selectedModel } : {}) }),
            })
            setPlan(retryData.plan)
            showToast('Study curriculum synthesized successfully')
            return
          }
        } catch (retryError) {
          handleApiError(retryError)
          return
        }
      }
      handleApiError(requestError)
    } finally {
      setBusy(false)
    }
  }

  // Documents & RAG API
  async function loadDocuments() {
    try {
      const data = await api('/api/documents')
      setDocuments(data.documents || [])
    } catch {
      /* keep last list */
    }
  }

  async function uploadPdf(file) {
    if (!file) return
    setUploading(true)
    setUploadError('')
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = await apiUpload('/api/documents', fd)
      await loadDocuments()
      showToast(`Document "${data.filename || file.name}" indexed successfully!`)
      // Automatically enable RAG mode so user can query immediately
      setRagMode(true)
    } catch (e) {
      const msg = e.message === 'Failed to fetch'
        ? 'Could not connect to backend server. The upload timed out or the connection was interrupted. Please try again.'
        : e.message
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  async function removeDocument(doc) {
    if (!window.confirm(`Delete "${doc.filename}"? This removes its semantic vectors and embeddings.`)) return
    try {
      await api(`/api/documents/${encodeURIComponent(doc.id)}`, { method: 'DELETE' })
      await loadDocuments()
      showToast(`Removed "${doc.filename}"`)
    } catch (e) {
      setError(e.message)
    }
  }

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser)
    setAuthModalMode(null)
    setCurrentPage('workspace')
    showToast(`Welcome back, ${authenticatedUser.email}`)
  }

  function logout() {
    localStorage.removeItem(tokenKey)
    setUser(null)
    setActive(null)
    setConversations([])
    setPlan(null)
    setDocuments([])
    setCurrentPage('landing')
    showToast('Signed out of MindMate')
  }

  // Check existing session on mount
  useEffect(() => {
    const existingToken = localStorage.getItem(tokenKey)
    if (!existingToken) return
    api('/api/auth/me')
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        // If logged in, go straight to workspace
        setCurrentPage('workspace')
      })
      .catch(() => {
        localStorage.removeItem(tokenKey)
      })
  }, [])

  // When user is authenticated, load conversations, models, documents
  useEffect(() => {
    if (user) {
      loadConversations().catch((err) => setError(err.message))
      loadModels().catch(() => {})
      loadDocuments().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="mindmate-app-root">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="global-toast-notification animate-fade-in" role="status">
          <span className="toast-spark">✦</span>
          <span className="toast-text">{toastMessage}</span>
          <button className="toast-dismiss" onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* View router: Landing Page vs Authenticated Workspace */}
      {currentPage === 'landing' ? (
        <LandingPage
          user={user}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onEnterWorkspace={(preferredView) => {
            if (user) {
              if (preferredView) handleSetView(preferredView)
              setCurrentPage('workspace')
            } else {
              setAuthModalMode('login')
            }
          }}
          onSelectFeature={(feature) => {
            if (user) {
              handleSetView(feature)
              setCurrentPage('workspace')
            } else {
              setAuthModalMode('login')
            }
          }}
        />
      ) : (
        <AppLayout
          user={user || { email: 'scholar@mindmate.ai' }}
          view={view}
          setView={handleSetView}
          conversations={conversations}
          activeConversation={active}
          onSelectConversation={selectConversation}
          onCreateConversation={createConversation}
          onRenameConversation={renameConversation}
          onUpdateConversation={updateConversation}
          onDeleteConversation={deleteConversation}
          onLogout={logout}
          onGoToLanding={() => setCurrentPage('landing')}
          models={models}
          selectedModel={selectedModel}
          modelsLoading={modelsLoading}
          modelsError={modelsError}
          modelsStale={modelsStale}
          modelUnavailable={modelUnavailable}
          onChooseModel={chooseModel}
          onRefreshModels={() => loadModels({ refresh: true })}
        >
          {view === 'planner' ? (
            <StudyPlannerView
              planInput={planInput}
              setPlanInput={setPlanInput}
              onGeneratePlan={generatePlan}
              plan={plan}
              busy={busy}
              error={error}
              activeConversation={active}
              onCreateConversation={createConversation}
            />
          ) : view === 'documents' ? (
            <DocumentsView
              documents={documents}
              uploading={uploading}
              uploadError={uploadError}
              onUploadPdf={uploadPdf}
              onRemoveDocument={removeDocument}
              error={error}
              onSwitchToChat={() => handleSetView('chat')}
            />
          ) : (
            <AIChatView
              activeConversation={active}
              onCreateConversation={createConversation}
              message={message}
              setMessage={setMessage}
              onSendMessage={sendMessage}
              busy={busy}
              error={error}
              ragMode={ragMode}
              setRagMode={setRagMode}
              lastSources={lastSources}
              hasDocuments={documents.length > 0}
              selectedModel={selectedModel}
            />
          )}
        </AppLayout>
      )}

      {/* Authentication Modal */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onAuthenticated={handleAuthenticated}
          onClose={() => setAuthModalMode(null)}
          api={api}
          tokenKey={tokenKey}
        />
      )}
    </div>
  )
}
