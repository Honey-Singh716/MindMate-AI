export default function ModelSelector({
  models = [],
  selected = '',
  loading = false,
  error = '',
  stale = false,
  unavailable = false,
  onChange,
  onRefresh,
}) {
  return (
    <div
      className={`model-selector-bar ${unavailable ? 'selector-warn' : ''}`}
      title={stale ? 'Model list may be outdated — click refresh to probe Groq API.' : undefined}
    >
      <div className="selector-icon-box">
        <span className="cpu-icon">⟐</span>
      </div>

      {loading ? (
        <div className="model-loading-pill">
          <span className="loading-spinner-micro"></span>
          <span>Probing Groq models…</span>
        </div>
      ) : error ? (
        <div className="model-error-pill" title={error}>
          <span>Models unavailable</span>
          <button className="model-refresh-btn" onClick={onRefresh} type="button" aria-label="Retry loading models">
            ↺
          </button>
        </div>
      ) : (
        <>
          {unavailable && (
            <span className="model-unavailable-tag" role="alert">
              Model retired · Pick new:
            </span>
          )}

          <div className="select-dropdown-container">
            <select
              aria-label="Select dynamic Groq AI model"
              value={selected}
              onChange={(e) => onChange(e.target.value)}
              className="model-native-select"
            >
              {unavailable && <option value="">— select replacement model —</option>}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
            <span className="custom-dropdown-arrow">▾</span>
          </div>

          {stale && (
            <span className="stale-indicator-badge" title="Cached model list — click refresh for live sync">
              ⚠ cached
            </span>
          )}

          <button
            className={`model-refresh-btn ${loading ? 'refreshing' : ''}`}
            onClick={onRefresh}
            type="button"
            aria-label="Refresh available Groq models"
            title="Refresh model list from Groq API"
          >
            ↺
          </button>
        </>
      )}
    </div>
  )
}
