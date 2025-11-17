import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GAME_CONFIG } from '../game/config'
import { MainScene } from '../game/scenes/MainScene'
import { MenuScene } from '../game/scenes/MenuScene'

interface PhaserGameProps {
  onGameReady: () => void
  gameReady: boolean
}

export default function PhaserGame({ onGameReady }: PhaserGameProps) {
  const phaserRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: 'phaser-container',
      scene: [MenuScene, MainScene],
    }

    phaserRef.current = new Phaser.Game(config)

    onGameReady()

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true)
        phaserRef.current = null
      }
    }
  }, [onGameReady])

  return <div id="phaser-container" style={{ width: '100%', height: '100%' }} />
}
