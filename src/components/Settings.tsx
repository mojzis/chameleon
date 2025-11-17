import { useState, useEffect } from 'react'
import {
  settingsManager,
  FontSize,
  ColorblindMode,
  DifficultyMode,
  GameSettings,
} from '../game/managers/SettingsManager'
import './Settings.css'

interface SettingsProps {
  onClose: () => void
}

function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<GameSettings>(
    settingsManager.getSettings()
  )

  useEffect(() => {
    // Listen for settings changes
    const handleSettingsChange = (newSettings: GameSettings) => {
      setSettings(newSettings)
    }

    settingsManager.addListener(handleSettingsChange)

    return () => {
      settingsManager.removeListener(handleSettingsChange)
    }
  }, [])

  const handleFontSizeChange = (fontSize: FontSize) => {
    settingsManager.setFontSize(fontSize)
  }

  const handleColorblindModeChange = (mode: ColorblindMode) => {
    settingsManager.setColorblindMode(mode)
  }

  const handleDifficultyChange = (mode: DifficultyMode) => {
    settingsManager.setDifficultyMode(mode)
  }

  const handleKeyboardOnlyChange = (enabled: boolean) => {
    settingsManager.setKeyboardOnlyMode(enabled)
  }

  const handleMusicVolumeChange = (volume: number) => {
    settingsManager.updateSettings({ musicVolume: volume })
  }

  const handleSoundEffectsVolumeChange = (volume: number) => {
    settingsManager.updateSettings({ soundEffectsVolume: volume })
  }

  const handleMusicEnabledChange = (enabled: boolean) => {
    settingsManager.updateSettings({ musicEnabled: enabled })
  }

  const handleSoundEffectsEnabledChange = (enabled: boolean) => {
    settingsManager.updateSettings({ soundEffectsEnabled: enabled })
  }

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to defaults?'
      )
    ) {
      settingsManager.resetToDefaults()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="settings-overlay" onKeyDown={handleKeyDown} role="dialog" aria-label="Settings">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Settings & Accessibility</h2>
          <button
            className="settings-close-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* Visual Settings */}
          <section className="settings-section">
            <h3>Visual Settings</h3>

            <div className="setting-item">
              <label htmlFor="font-size">Font Size</label>
              <div className="button-group">
                <button
                  className={settings.fontSize === 'small' ? 'active' : ''}
                  onClick={() => handleFontSizeChange('small')}
                  aria-pressed={settings.fontSize === 'small'}
                >
                  Small
                </button>
                <button
                  className={settings.fontSize === 'medium' ? 'active' : ''}
                  onClick={() => handleFontSizeChange('medium')}
                  aria-pressed={settings.fontSize === 'medium'}
                >
                  Medium
                </button>
                <button
                  className={settings.fontSize === 'large' ? 'active' : ''}
                  onClick={() => handleFontSizeChange('large')}
                  aria-pressed={settings.fontSize === 'large'}
                >
                  Large
                </button>
              </div>
              <p className="setting-description">
                Adjust text size for better readability
              </p>
            </div>

            <div className="setting-item">
              <label htmlFor="colorblind-mode">Colorblind Mode</label>
              <div className="button-group">
                <button
                  className={
                    settings.colorblindMode === 'normal' ? 'active' : ''
                  }
                  onClick={() => handleColorblindModeChange('normal')}
                  aria-pressed={settings.colorblindMode === 'normal'}
                >
                  Normal
                </button>
                <button
                  className={
                    settings.colorblindMode === 'protanopia' ? 'active' : ''
                  }
                  onClick={() => handleColorblindModeChange('protanopia')}
                  aria-pressed={settings.colorblindMode === 'protanopia'}
                >
                  Protanopia
                </button>
                <button
                  className={
                    settings.colorblindMode === 'deuteranopia' ? 'active' : ''
                  }
                  onClick={() => handleColorblindModeChange('deuteranopia')}
                  aria-pressed={settings.colorblindMode === 'deuteranopia'}
                >
                  Deuteranopia
                </button>
                <button
                  className={
                    settings.colorblindMode === 'tritanopia' ? 'active' : ''
                  }
                  onClick={() => handleColorblindModeChange('tritanopia')}
                  aria-pressed={settings.colorblindMode === 'tritanopia'}
                >
                  Tritanopia
                </button>
              </div>
              <p className="setting-description">
                Adjust colors for color vision deficiency
              </p>
            </div>
          </section>

          {/* Difficulty Settings */}
          <section className="settings-section">
            <h3>Difficulty Settings</h3>

            <div className="setting-item">
              <label htmlFor="difficulty">Reading Time</label>
              <div className="button-group">
                <button
                  className={
                    settings.difficultyMode === 'easy' ? 'active' : ''
                  }
                  onClick={() => handleDifficultyChange('easy')}
                  aria-pressed={settings.difficultyMode === 'easy'}
                >
                  Easy (50% more time)
                </button>
                <button
                  className={
                    settings.difficultyMode === 'normal' ? 'active' : ''
                  }
                  onClick={() => handleDifficultyChange('normal')}
                  aria-pressed={settings.difficultyMode === 'normal'}
                >
                  Normal
                </button>
                <button
                  className={
                    settings.difficultyMode === 'hard' ? 'active' : ''
                  }
                  onClick={() => handleDifficultyChange('hard')}
                  aria-pressed={settings.difficultyMode === 'hard'}
                >
                  Hard (25% less time)
                </button>
              </div>
              <p className="setting-description">
                Adjust how much time you have to read and respond
              </p>
            </div>
          </section>

          {/* Control Settings */}
          <section className="settings-section">
            <h3>Control Settings</h3>

            <div className="setting-item">
              <label htmlFor="keyboard-only">
                <input
                  type="checkbox"
                  id="keyboard-only"
                  checked={settings.keyboardOnlyMode}
                  onChange={(e) => handleKeyboardOnlyChange(e.target.checked)}
                />
                Keyboard-Only Mode
              </label>
              <p className="setting-description">
                Disable mouse aiming and use only arrow keys
              </p>
            </div>
          </section>

          {/* Audio Settings */}
          <section className="settings-section">
            <h3>Audio Settings</h3>

            <div className="setting-item">
              <label htmlFor="music-enabled">
                <input
                  type="checkbox"
                  id="music-enabled"
                  checked={settings.musicEnabled}
                  onChange={(e) => handleMusicEnabledChange(e.target.checked)}
                />
                Background Music
              </label>
              {settings.musicEnabled && (
                <div className="slider-container">
                  <label htmlFor="music-volume">Volume</label>
                  <input
                    type="range"
                    id="music-volume"
                    min="0"
                    max="100"
                    value={settings.musicVolume * 100}
                    onChange={(e) =>
                      handleMusicVolumeChange(
                        parseInt(e.target.value) / 100
                      )
                    }
                    aria-label="Music volume"
                  />
                  <span>{Math.round(settings.musicVolume * 100)}%</span>
                </div>
              )}
            </div>

            <div className="setting-item">
              <label htmlFor="sound-effects-enabled">
                <input
                  type="checkbox"
                  id="sound-effects-enabled"
                  checked={settings.soundEffectsEnabled}
                  onChange={(e) =>
                    handleSoundEffectsEnabledChange(e.target.checked)
                  }
                />
                Sound Effects
              </label>
              {settings.soundEffectsEnabled && (
                <div className="slider-container">
                  <label htmlFor="sound-effects-volume">Volume</label>
                  <input
                    type="range"
                    id="sound-effects-volume"
                    min="0"
                    max="100"
                    value={settings.soundEffectsVolume * 100}
                    onChange={(e) =>
                      handleSoundEffectsVolumeChange(
                        parseInt(e.target.value) / 100
                      )
                    }
                    aria-label="Sound effects volume"
                  />
                  <span>
                    {Math.round(settings.soundEffectsVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Keyboard Controls Reference */}
          <section className="settings-section">
            <h3>Keyboard Controls</h3>
            <div className="keyboard-controls">
              <div className="control-item">
                <kbd>←</kbd> <kbd>→</kbd>
                <span>Aim chameleon left/right</span>
              </div>
              <div className="control-item">
                <kbd>Space</kbd>
                <span>Shoot tongue</span>
              </div>
              <div className="control-item">
                <kbd>H</kbd>
                <span>Use help (highlight correct answer)</span>
              </div>
              <div className="control-item">
                <kbd>P</kbd>
                <span>Pause game</span>
              </div>
              <div className="control-item">
                <kbd>Esc</kbd>
                <span>Open encyclopedia / Close menus</span>
              </div>
            </div>
          </section>

          {/* Reset Button */}
          <div className="settings-footer">
            <button
              className="reset-button"
              onClick={handleResetToDefaults}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
