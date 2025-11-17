import './PauseOverlay.css'

interface PauseOverlayProps {
  onResume: () => void
  onSettings: () => void
  onQuit: () => void
}

function PauseOverlay({ onResume, onSettings, onQuit }: PauseOverlayProps) {
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      onResume()
    }
  }

  return (
    <div className="pause-overlay" onKeyDown={handleKeyDown} role="dialog" aria-label="Game paused">
      <div className="pause-container">
        <h2>Game Paused</h2>

        <div className="pause-buttons">
          <button
            className="pause-button resume-button"
            onClick={onResume}
            autoFocus
          >
            Resume Game
            <span className="button-hint">Press P or Esc</span>
          </button>

          <button
            className="pause-button settings-button"
            onClick={onSettings}
          >
            Settings & Accessibility
          </button>

          <button
            className="pause-button quit-button"
            onClick={onQuit}
          >
            Quit to Menu
          </button>
        </div>

        <div className="pause-hint">
          <p>Press <kbd>P</kbd> or <kbd>Esc</kbd> to resume</p>
        </div>
      </div>
    </div>
  )
}

export default PauseOverlay
