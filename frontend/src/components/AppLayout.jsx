import { useState } from 'react'
import ModelSelector from './ModelSelector'

export default function AppLayout({
  user,
  view,
  setView,
  conversations,
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
    chat: 'AI Chat Studio',
    planner: 'Study Planner',
    documents: 'Knowledge Base',
  }

  return (
    <div className={`workspace-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Collapsible Left Sidebar */}
      <aside className={`workspace-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-row">
          <div className="sidebar-brand" onClick={onGoToLanding} title="MindMate AI Studio - Back to Landing">
            <span className="brand-logo-mark">
              <span className="sparkle">✦</span>
              <span className="logo-glow"></span>
            </span>
            {!collapsed && (
              <div className="brand-text-col">
                <span className="brand-title">MindMate</span>
                <span className="brand-sub">Neural Intelligence</span>
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

        {/* New Conversation Button */}
        <div className="sidebar-action-wrap">
          <button
            className="new-chat-action-btn"
            onClick={() => {
              onCreateConversation()
              setView('chat')
              setMobileMenuOpen(false)
            }}
            title="Start a new conversation"
          >
            <span className="btn-plus">＋</span>
            {!collapsed && <span>New conversation</span>}
          </button>
        </div>

        {/* Main Navigation Tabs */}
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
        </nav>

        {/* Recent Conversations List */}
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
                        {conv.pinned && <span className="pin-indicator" title="Pinned conversation">●</span>}
                        <span className="thread-title-text">{conv.title}</span>
                      </button>

                      {/* 3-Dot Actions Menu */}
                      <details className="thread-menu-dropdown">
                        <summary aria-label={`Actions for ${conv.title}`}>⋯</summary>
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

        {/* Bottom Profile Area */}
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
              {!collapsed && <span>Landing page</span>}
            </button>
            <button
              className="footer-action-link logout-btn"
              onClick={onLogout}
              title="Log out from MindMate"
            >
              <span className="footer-action-icon">⎋</span>
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="workspace-main-column">
        {/* Top Header */}
        <header className="workspace-topbar">
          <div className="topbar-left-cluster">
            {/* Mobile menu trigger */}
            <button
              className="mobile-sidebar-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>

            {/* Current Context Title */}
            <div className="topbar-context-badge">
              <span className="context-icon">✦</span>
              <span className="context-title">{viewTitles[view] || 'Workspace'}</span>
            </div>
          </div>

          <div className="topbar-right-cluster">
            {/* Dynamic Groq Model Selector (shown on Chat & Planner) */}
            {view !== 'documents' && (
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
            )}

            {/* Private Workspace Status Indicator */}
            <div className="private-workspace-pill desktop-only">
              <span className="status-live-dot"></span>
              <span>Private Workspace</span>
            </div>

            {/* User Avatar Menu Trigger */}
            <div className="topbar-user-menu-wrap">
              <button
                className="topbar-avatar-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Account menu"
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
                    ▤ Documents
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
