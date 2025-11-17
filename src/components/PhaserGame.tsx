import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { GAME_CONFIG } from '../game/config'
import { MainScene } from '../game/scenes/MainScene'
import { MenuScene } from '../game/scenes/MenuScene'
import { LevelSelectScene } from '../game/scenes/LevelSelectScene'
import { LevelIntroScene } from '../game/scenes/LevelIntroScene'
import { ResultScene } from '../game/scenes/ResultScene'
import GameOverlay from './GameOverlay'

interface PhaserGameProps {
  onGameReady: () => void
  gameReady: boolean
}

export default function PhaserGame({ onGameReady }: PhaserGameProps) {
  const phaserRef = useRef<Phaser.Game | null>(null)
  const [game, setGame] = useState<Phaser.Game | null>(null)

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: 'phaser-container',
      scene: [MenuScene, LevelSelectScene, LevelIntroScene, MainScene, ResultScene],
    }

    phaserRef.current = new Phaser.Game(config)
    setGame(phaserRef.current)

    onGameReady()

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true)
        phaserRef.current = null
        setGame(null)
      }
    }
  }, [onGameReady])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div id="phaser-container" style={{ width: '100%', height: '100%' }} />
      <GameOverlay phaserGame={game} />
    </div>
  )
}
