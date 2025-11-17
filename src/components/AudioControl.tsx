import { useState, useEffect } from 'react'
import { audioManager } from '../game/managers/AudioManager'
import './AudioControl.css'

/**
 * AudioControl Component
 *
 * Provides a UI control for muting/unmuting game audio.
 * Displays a speaker icon button in the top-right corner of the screen.
 */
const AudioControl = () => {
  const [isMuted, setIsMuted] = useState(audioManager.getMuted())

  // Handle mute toggle
  const handleToggleMute = () => {
    const newMutedState = audioManager.toggleMute()
    setIsMuted(newMutedState)
  }

  // Update state if audio manager is changed externally
  useEffect(() => {
    // Poll for changes every second (in case audio manager is changed elsewhere)
    const interval = setInterval(() => {
      const currentMuted = audioManager.getMuted()
      if (currentMuted !== isMuted) {
        setIsMuted(currentMuted)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isMuted])

  return (
    <button
      className="audio-control-button"
      onClick={handleToggleMute}
      title={isMuted ? 'Unmute audio' : 'Mute audio'}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      <span className="audio-icon">
        {isMuted ? '🔇' : '🔊'}
      </span>
    </button>
  )
}

export default AudioControl
