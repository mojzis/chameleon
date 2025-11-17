import { useState, useEffect } from 'react'
import PhaserGame from './components/PhaserGame'
import InsectEncyclopedia from './components/InsectEncyclopedia'
import AudioControl from './components/AudioControl'
import Settings from './components/Settings'
import PauseOverlay from './components/PauseOverlay'
import { EncyclopediaManager } from './game/managers/EncyclopediaManager'
import './App.css'

// Global encyclopedia manager instance
const encyclopediaManager = new EncyclopediaManager()

function App() {
  const [gameReady, setGameReady] = useState(false)
  const [showEncyclopedia, setShowEncyclopedia] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPause, setShowPause] = useState(false)
  const [unlockedInsects, setUnlockedInsects] = useState<string[]>([])

  // Load initial unlocked insects
  useEffect(() => {
    setUnlockedInsects(encyclopediaManager.getUnlockedInsects())
  }, [])

  // Listen for encyclopedia events from Phaser
  useEffect(() => {
    const handleOpenEncyclopedia = () => {
      setUnlockedInsects(encyclopediaManager.getUnlockedInsects())
      setShowEncyclopedia(true)
    }

    const handleInsectUnlocked = (event: CustomEvent) => {
      const insectId = event.detail
      encyclopediaManager.unlockInsect(insectId)
      setUnlockedInsects(encyclopediaManager.getUnlockedInsects())
    }

    const handleOpenSettings = () => {
      setShowSettings(true)
    }

    const handleGamePaused = () => {
      setShowPause(true)
    }

    const handleGameResumed = () => {
      setShowPause(false)
    }

    window.addEventListener('openEncyclopedia', handleOpenEncyclopedia as EventListener)
    window.addEventListener('insectUnlocked', handleInsectUnlocked as EventListener)
    window.addEventListener('openSettings', handleOpenSettings as EventListener)
    window.addEventListener('gamePaused', handleGamePaused as EventListener)
    window.addEventListener('gameResumed', handleGameResumed as EventListener)

    return () => {
      window.removeEventListener('openEncyclopedia', handleOpenEncyclopedia as EventListener)
      window.removeEventListener('insectUnlocked', handleInsectUnlocked as EventListener)
      window.removeEventListener('openSettings', handleOpenSettings as EventListener)
      window.removeEventListener('gamePaused', handleGamePaused as EventListener)
      window.removeEventListener('gameResumed', handleGameResumed as EventListener)
    }
  }, [])

  const handleCloseEncyclopedia = () => {
    setShowEncyclopedia(false)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handleResume = () => {
    setShowPause(false)
    window.dispatchEvent(new CustomEvent('resumeGame'))
  }

  const handleOpenSettingsFromPause = () => {
    setShowSettings(true)
  }

  const handleQuitToMenu = () => {
    setShowPause(false)
    window.dispatchEvent(new CustomEvent('quitToMenu'))
  }

  return (
    <div className="app-container">
      <PhaserGame
        onGameReady={() => setGameReady(true)}
        gameReady={gameReady}
      />
      <AudioControl />
      {showEncyclopedia && (
        <InsectEncyclopedia
          unlockedInsects={unlockedInsects}
          onClose={handleCloseEncyclopedia}
        />
      )}
      {showSettings && (
        <Settings onClose={handleCloseSettings} />
      )}
      {showPause && (
        <PauseOverlay
          onResume={handleResume}
          onSettings={handleOpenSettingsFromPause}
          onQuit={handleQuitToMenu}
        />
      )}
    </div>
  )
}

export default App
export { encyclopediaManager }
