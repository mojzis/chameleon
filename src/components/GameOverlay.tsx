import { useState, useEffect } from 'react'
import HelpButton from './HelpButton'

interface GameOverlayProps {
  phaserGame: Phaser.Game | null
}

export default function GameOverlay({ phaserGame }: GameOverlayProps) {
  const [helpRemaining, setHelpRemaining] = useState(3)
  const [isInMainScene, setIsInMainScene] = useState(false)

  useEffect(() => {
    if (!phaserGame) return

    // Listen for scene changes
    const checkActiveScene = () => {
      const mainScene = phaserGame.scene.getScene('MainScene')
      if (mainScene && mainScene.scene.isActive()) {
        setIsInMainScene(true)

        // Listen for help updates from the MainScene
        mainScene.events.on('helpUpdate', (remaining: number) => {
          setHelpRemaining(remaining)
        })
      } else {
        setIsInMainScene(false)
      }
    }

    // Check immediately
    checkActiveScene()

    // Check periodically (in case scene changes)
    const interval = setInterval(checkActiveScene, 1000)

    return () => {
      clearInterval(interval)
      const mainScene = phaserGame.scene.getScene('MainScene')
      if (mainScene) {
        mainScene.events.off('helpUpdate')
      }
    }
  }, [phaserGame])

  const handleHelpClick = () => {
    if (!phaserGame) return

    const mainScene = phaserGame.scene.getScene('MainScene') as any
    if (mainScene && mainScene.scene.isActive()) {
      // Call the activateHelp method if it exists
      if (typeof mainScene.activateHelp === 'function') {
        mainScene.activateHelp()
      }
    }
  }

  // Only show overlay when in main game scene
  if (!isInMainScene) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <HelpButton
          onHelpClick={handleHelpClick}
          helpRemaining={helpRemaining}
          disabled={!isInMainScene}
        />
      </div>
    </div>
  )
}
