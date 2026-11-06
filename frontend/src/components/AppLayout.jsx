import { useState } from 'react'
import ModelSelector from './ModelSelector'

export default function AppLayout({
  user,
  view,
  setView,
  conversations = [],
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onRenameConversation,
  onUpdateConversation,
  onDeleteConversation,
  onLogout,
  onGoToLanding,
  models,
  selectedModel,
  modelsLoading,
  modelsError,
  modelsStale,
  modelUnavailable,
  onChooseModel,
  onRefreshModels,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const viewTitles = {
    chat: 'AI Study Studio',
    planner: 'Study Planner',
    documents: 'Documents & Knowledge Base',
    explorer: 'Concept Explorer',
    notes: 'Smart Study Notes',
    flashcards: 'Active Recall Flashcards',
  }

  const activeSubtitle =
    view === 'chat'
      ? activeConversation?.title || 'Grounded Academic Tutor'
      : view === 'planner'
      ? 'Milestone Curriculum Synthesizer'
      : view === 'documents'
      ? 'pgvector Semantic Store'
      : 'Academic Learning Tools'

  return (
    <div className={`workspace-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Refined Academic Left Sidebar */}
      <aside className={`workspace-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Top Brand Header */}
        <div className="sidebar-brand-row">
          <div
            className="sidebar-brand"
            onClick={onGoToLanding}
            title="MindMate — Return to Landing Page"
          >
            <span className="academic-logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#174C3C" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#174C3C" fill="rgba(23, 76, 60, 0.12)" />
                <circle cx="12" cy="10" r="1.5" fill="#174C3C" />
              </svg>
            </span>
            {!collapsed && (
              <div className="brand-text-col">
                <span className="brand-title">MindMate</span>
                <span className="brand-sub">Academic Companion</span>
              </div>
            )}
          </div>

          <button
            className="sidebar-collapse-toggle desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Primary Action: New Conversation */}
        <div className="sidebar-action-wrap">
          <button
            className="new-chat-action-btn"
            onClick={() => {
              onCreateConversation()
              setView('chat')
              setMobileMenuOpen(false)
            }}
            title="Start a new conversation thread"
          >
            <span className="btn-plus">＋</span>
            {!collapsed && <span>New Conversation</span>}
          </button>
        </div>

        {/* Main Navigation Items */}
        <nav className="sidebar-nav-tabs">
          <button
            className={`nav-tab-item ${view === 'chat' ? 'active' : ''}`}
            onClick={() => {
              setView('chat')
              setMobileMenuOpen(false)
            }}
            title="AI Chat Studio"
          >
            <span className="nav-tab-icon">◈</span>
            {!collapsed && <span className="nav-tab-text">AI Chat</span>}
            {view === 'chat' && <span className="active-glow-bar"></span>}
          </button>

          <button
            className={`nav-tab-item ${view === 'planner' ? 'active' : ''}`}
            onClick={() => {
              setView('planner')
              setMobileMenuOpen(false)
            }}
            title="Study Planner"
          >
            <span className="nav-tab-icon">▦</span>
            {!collapsed && <span className="nav-tab-text">Study Planner</span>}
            {view === 'planner' && <span className="active-glow-bar"></span>}
          </button>

          <button
            className={`nav-tab-item ${view === 'documents' ? 'active' : ''}`}
            onClick={() => {
              setView('documents')
              setMobileMenuOpen(false)
            }}
            title="Knowledge Base & Documents"
          >
            <span className="nav-tab-icon">▤</span>
            {!collapsed && <span className="nav-tab-text">Documents</span>}
            {view === 'documents' && <span className="active-glow-bar"></span>}
          </button>

          <button
            className={`nav-tab-item ${view === 'explorer' ? 'active' : ''}`}
            onClick={() => {
              setView('explorer')
              setMobileMenuOpen(false)
            }}
            title="Concept Explorer"
          >
            <span className="nav-tab-icon">✦</span>
            {!collapsed && <span className="nav-tab-text">Concept Explorer</span>}
            {view === 'explorer' && <span className="active-glow-bar"></span>}
          </button>

          <button
            className={`nav-tab-item ${view === 'notes' ? 'active' : ''}`}
            onClick={() => {
              setView('notes')
              setMobileMenuOpen(false)
            }}
            title="Smart Notes"
          >
            <span className="nav-tab-icon">📝</span>
            {!collapsed && <span className="nav-tab-text">Notes</span>}
            {view === 'notes' && <span className="active-glow-bar"></span>}
          </button>

          <button
            className={`nav-tab-item ${view === 'flashcards' ? 'active' : ''}`}
            onClick={() => {
              setView('flashcards')
              setMobileMenuOpen(false)
            }}
            title="Active Recall Flashcards"
          >
            <span className="nav-tab-icon">🗂</span>
            {!collapsed && <span className="nav-tab-text">Flashcards</span>}
            {view === 'flashcards' && <span className="active-glow-bar"></span>}
          </button>
        </nav>

        {/* Recent Conversations History Section */}
        {!collapsed && (
          <div className="sidebar-history-section">
            <div className="history-section-header">
              <span className="history-label">RECENT CONVERSATIONS</span>
              <span className="history-count">{conversations.length}</span>
            </div>

            <div className="conversations-scroll-list">
              {conversations.length === 0 ? (
                <div className="no-conversations-hint">No conversations yet</div>
              ) : (
                conversations.map((conv) => {
                  const isActive = activeConversation?.id === conv.id
                  return (
                    <div
                      key={conv.id}
                      className={`history-thread-item ${isActive ? 'active' : ''}`}
                    >
                      <button
                        className="thread-title-btn"
                        onClick={() => {
                          onSelectConversation(conv.id)
                          setView('chat')
                          setMobileMenuOpen(false)
                        }}
                        title={conv.title}
                      >
                        {conv.pinned && (
                          <span className="pin-indicator" title="Pinned thread">
                            ●
                          </span>
                        )}
                        <span className="thread-title-text">{conv.title || 'New conversation'}</span>
                      </button>

                      {/* 3-Dot Actions Dropdown */}
                      <details className="thread-menu-dropdown">
                        <summary aria-label={`Actions for ${conv.title || 'conversation'}`}>⋯</summary>
                        <div className="thread-menu-popover">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              onRenameConversation(conv)
                            }}
                          >
                            ✎ Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              onUpdateConversation(conv.id, { pinned: !conv.pinned })
                            }}
                          >
                            {conv.pinned ? '○ Unpin' : '● Pin to top'}
                          </button>
                          <button
                            className="danger-btn"
                            onClick={(e) => {
                              e.preventDefault()
                              onDeleteConversation(conv)
                            }}
                          >
                            ✕ Delete
                          </button>
                        </div>
                      </details>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Bottom Profile & Actions Area */}
        <div className="sidebar-bottom-panel">
          {!collapsed ? (
            <div className="user-profile-card">
              <div className="user-avatar-badge">
                {user.email ? user.email.slice(0, 1).toUpperCase() : 'U'}
              </div>
              <div className="user-details-col">
                <span className="user-email-text" title={user.email}>
                  {user.email}
                </span>
                <span className="user-status-text">Active Scholar</span>
              </div>
            </div>
          ) : (
            <div className="collapsed-avatar-box" title={user.email}>
              <div className="user-avatar-badge">
                {user.email ? user.email.slice(0, 1).toUpperCase() : 'U'}
              </div>
            </div>
          )}

          <div className="sidebar-footer-actions">
            <button
              className="footer-action-link"
              onClick={onGoToLanding}
              title="Return to Landing Page"
            >
              <span className="footer-action-icon">🌐</span>
              {!collapsed && <span>Landing Page</span>}
            </button>
            <button
              className="footer-action-link logout-btn"
              onClick={onLogout}
              title="Sign out of MindMate"
            >
              <span className="footer-action-icon">⎋</span>
              {!collapsed && <span>Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <div className="workspace-main-column">
        {/* Clean Fixed Header */}
        <header className="workspace-topbar">
          <div className="topbar-left-cluster">
            {/* Mobile menu trigger */}
            <button
              className="mobile-sidebar-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar menu"
            >
              ☰
            </button>

            {/* Title & Contextual Subtitle */}
            <div className="topbar-context-badge">
              <span className="context-icon">✦</span>
              <div className="context-title-col">
                <span className="context-title">{viewTitles[view] || 'AI Study Studio'}</span>
                <span className="context-subtitle">{activeSubtitle}</span>
              </div>
            </div>
          </div>

          <div className="topbar-right-cluster">
            {/* Single Model Selector (shown on Chat & Planner) */}
            {view !== 'documents' && (
              <div
                className="topbar-model-wrap"
                title="Groq Neural Acceleration · Sub-second inference"
              >
                <ModelSelector
                  models={models}
                  selected={selectedModel}
                  loading={modelsLoading}
                  error={modelsError}
                  stale={modelsStale}
                  unavailable={modelUnavailable}
                  onChange={onChooseModel}
                  onRefresh={onRefreshModels}
                />
              </div>
            )}

            {/* Private Workspace Indicator */}
            <div className="private-workspace-pill desktop-only" title="Your conversation and documents are private and isolated">
              <span className="status-live-dot"></span>
              <span>Private Workspace</span>
            </div>

            {/* User Avatar Menu Trigger */}
            <div className="topbar-user-menu-wrap">
              <button
                className="topbar-avatar-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Account menu"
                title={user.email}
              >
                {user.email ? user.email.slice(0, 1).toUpperCase() : 'U'}
              </button>

              {userMenuOpen && (
                <div className="user-dropdown-popover animate-fade-in">
                  <div className="dropdown-user-header">
                    <strong>{user.email}</strong>
                    <span>JWT Session Authenticated</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => { setUserMenuOpen(false); onGoToLanding(); }}>
                    🌐 Landing Page
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setView('chat'); }}>
                    ◈ AI Chat Studio
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setView('planner'); }}>
                    ▦ Study Planner
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setView('documents'); }}>
                    ▤ Knowledge Base
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setView('explorer'); }}>
                    ✦ Concept Explorer
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setView('notes'); }}>
                    📝 Smart Notes
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setView('flashcards'); }}>
                    🗂 Flashcards
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="danger-dropdown-btn"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                  >
                    ⎋ Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body Area */}
        <main className="workspace-content-canvas">
          {children}
        </main>
      </div>
    </div>
  )
}
