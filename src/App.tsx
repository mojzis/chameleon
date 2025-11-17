import { useState, useEffect } from 'react'
import PhaserGame from './components/PhaserGame'
import InsectEncyclopedia from './components/InsectEncyclopedia'
import AudioControl from './components/AudioControl'
import { EncyclopediaManager } from './game/managers/EncyclopediaManager'
import './App.css'

// Global encyclopedia manager instance
const encyclopediaManager = new EncyclopediaManager()

function App() {
  const [gameReady, setGameReady] = useState(false)
  const [showEncyclopedia, setShowEncyclopedia] = useState(false)
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

    window.addEventListener('openEncyclopedia', handleOpenEncyclopedia as EventListener)
    window.addEventListener('insectUnlocked', handleInsectUnlocked as EventListener)

    return () => {
      window.removeEventListener('openEncyclopedia', handleOpenEncyclopedia as EventListener)
      window.removeEventListener('insectUnlocked', handleInsectUnlocked as EventListener)
    }
  }, [])

  const handleCloseEncyclopedia = () => {
    setShowEncyclopedia(false)
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
    </div>
  )
}

export default App
export { encyclopediaManager }
