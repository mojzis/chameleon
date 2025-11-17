import { useState } from 'react'
import PhaserGame from './components/PhaserGame'
import './App.css'

function App() {
  const [gameReady, setGameReady] = useState(false)

  return (
    <div className="app-container">
      <PhaserGame
        onGameReady={() => setGameReady(true)}
        gameReady={gameReady}
      />
    </div>
  )
}

export default App
