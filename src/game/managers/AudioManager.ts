/**
 * AudioManager
 *
 * Manages all game audio including sound effects and background music.
 * Uses Web Audio API to generate placeholder sounds programmatically.
 *
 * Features:
 * - Programmatically generated sound effects (no audio files needed)
 * - Background ambient music
 * - Volume control
 * - Mute/unmute functionality
 * - Persistent settings (localStorage)
 */

export type SoundEffectType =
  | 'tongueShoot'
  | 'correctAnswer'
  | 'wrongAnswer'
  | 'helpActivated'
  | 'celebration'
  | 'uiClick'

export class AudioManager {
  private audioContext: AudioContext
  private masterGainNode: GainNode
  private musicGainNode: GainNode
  private sfxGainNode: GainNode

  private isMuted: boolean = false
  private musicVolume: number = 0.4
  private sfxVolume: number = 0.6

  // Background music oscillators
  private musicOscillators: OscillatorNode[] = []
  private musicPlaying: boolean = false

  // Settings key for localStorage
  private static SETTINGS_KEY = 'chameleon-audio-settings'

  constructor() {
    // Initialize Web Audio API
    this.audioContext = new AudioContext()

    // Create master gain node
    this.masterGainNode = this.audioContext.createGain()
    this.masterGainNode.connect(this.audioContext.destination)

    // Create separate gain nodes for music and sound effects
    this.musicGainNode = this.audioContext.createGain()
    this.musicGainNode.connect(this.masterGainNode)

    this.sfxGainNode = this.audioContext.createGain()
    this.sfxGainNode.connect(this.masterGainNode)

    // Load settings from localStorage
    this.loadSettings()

    // Apply initial volumes
    this.updateVolumes()
  }

  /**
   * Load audio settings from localStorage
   */
  private loadSettings() {
    try {
      const savedSettings = localStorage.getItem(AudioManager.SETTINGS_KEY)
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        this.isMuted = settings.isMuted ?? false
        this.musicVolume = settings.musicVolume ?? 0.4
        this.sfxVolume = settings.sfxVolume ?? 0.6
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error)
    }
  }

  /**
   * Save audio settings to localStorage
   */
  private saveSettings() {
    try {
      const settings = {
        isMuted: this.isMuted,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
      }
      localStorage.setItem(AudioManager.SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save audio settings:', error)
    }
  }

  /**
   * Update volume levels based on current settings
   */
  private updateVolumes() {
    if (this.isMuted) {
      this.masterGainNode.gain.value = 0
    } else {
      this.masterGainNode.gain.value = 1
      this.musicGainNode.gain.value = this.musicVolume
      this.sfxGainNode.gain.value = this.sfxVolume
    }
  }

  /**
   * Toggle mute on/off
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    this.updateVolumes()
    this.saveSettings()
    return this.isMuted
  }

  /**
   * Set mute state
   */
  public setMuted(muted: boolean) {
    this.isMuted = muted
    this.updateVolumes()
    this.saveSettings()
  }

  /**
   * Get current mute state
   */
  public getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Set music volume (0.0 to 1.0)
   */
  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
    this.saveSettings()
  }

  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  public setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
    this.saveSettings()
  }

  /**
   * Play a sound effect
   */
  public playSoundEffect(type: SoundEffectType) {
    // Resume audio context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    switch (type) {
      case 'tongueShoot':
        this.playTongueShootSound()
        break
      case 'correctAnswer':
        this.playCorrectAnswerSound()
        break
      case 'wrongAnswer':
        this.playWrongAnswerSound()
        break
      case 'helpActivated':
        this.playHelpActivatedSound()
        break
      case 'celebration':
        this.playCelebrationSound()
        break
      case 'uiClick':
        this.playUIClickSound()
        break
    }
  }

  /**
   * Tongue shooting sound - wet, snappy sound
   */
  private playTongueShootSound() {
    const now = this.audioContext.currentTime

    // Create a "wet snap" sound using noise and pitch sweep
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    // Noise-like sound with frequency sweep
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1)

    // Filter for "wet" character
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, now)
    filter.Q.setValueAtTime(5, now)

    // Quick attack and decay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    // Connect and play
    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.sfxGainNode)

    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }

  /**
   * Correct answer sound - warm, encouraging chime
   */
  private playCorrectAnswerSound() {
    const now = this.audioContext.currentTime

    // Pleasant ascending arpeggio
    const frequencies = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, now)

      // Stagger the notes
      const startTime = now + index * 0.1
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

      oscillator.connect(gainNode)
      gainNode.connect(this.sfxGainNode)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.5)
    })
  }

  /**
   * Wrong answer sound - gentle, curious tone (not punishing)
   */
  private playWrongAnswerSound() {
    const now = this.audioContext.currentTime

    // Gentle descending tone
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(440, now)
    oscillator.frequency.linearRampToValueAtTime(330, now + 0.3)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

    oscillator.connect(gainNode)
    gainNode.connect(this.sfxGainNode)

    oscillator.start(now)
    oscillator.stop(now + 0.5)
  }

  /**
   * Help activation sound - magical, sparkly sound
   */
  private playHelpActivatedSound() {
    const now = this.audioContext.currentTime

    // Sparkly ascending sound with multiple harmonics
    const frequencies = [880, 1174.66, 1567.98] // A5, D6, G6

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(freq, now)

      // Add some shimmer with filter modulation
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(freq * 2, now)
      filter.Q.setValueAtTime(10, now)

      const startTime = now + index * 0.05
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6)

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.sfxGainNode)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.7)
    })
  }

  /**
   * Celebration sound - burst of sparkles
   */
  private playCelebrationSound() {
    const now = this.audioContext.currentTime

    // Multiple ascending tones for celebration
    const baseFreq = 523.25 // C5
    const notes = [0, 4, 7, 12] // Major chord arpeggio (C, E, G, C)

    notes.forEach((semitones, index) => {
      const freq = baseFreq * Math.pow(2, semitones / 12)
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, now)

      const startTime = now + index * 0.08
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)

      oscillator.connect(gainNode)
      gainNode.connect(this.sfxGainNode)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.6)
    })
  }

  /**
   * UI click sound - subtle feedback
   */
  private playUIClickSound() {
    const now = this.audioContext.currentTime

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, now)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    oscillator.connect(gainNode)
    gainNode.connect(this.sfxGainNode)

    oscillator.start(now)
    oscillator.stop(now + 0.1)
  }

  /**
   * Start ambient rainforest background music
   */
  public startBackgroundMusic() {
    if (this.musicPlaying) {
      return
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    this.musicPlaying = true

    // Create gentle ambient soundscape using multiple sine waves
    // This creates a calm, exploration-themed atmosphere

    // Base drone (very low volume, provides foundation)
    const baseDrone = this.createMusicOscillator(110, 'sine', 0.03)

    // Harmonic layers for richness
    const harmony1 = this.createMusicOscillator(220, 'sine', 0.02)
    const harmony2 = this.createMusicOscillator(330, 'sine', 0.015)
    const harmony3 = this.createMusicOscillator(440, 'triangle', 0.01)

    // Higher ethereal tones
    const ethereal1 = this.createMusicOscillator(880, 'sine', 0.008)
    const ethereal2 = this.createMusicOscillator(1174.66, 'sine', 0.006)

    // Store oscillators for cleanup
    this.musicOscillators = [
      baseDrone,
      harmony1,
      harmony2,
      harmony3,
      ethereal1,
      ethereal2,
    ]

    // Start all oscillators
    const now = this.audioContext.currentTime
    this.musicOscillators.forEach((osc) => osc.start(now))
  }

  /**
   * Create a music oscillator with specified parameters
   */
  private createMusicOscillator(
    frequency: number,
    type: OscillatorType,
    volume: number
  ): OscillatorNode {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    // Add slight frequency variation for organic feel
    const lfo = this.audioContext.createOscillator()
    const lfoGain = this.audioContext.createGain()

    lfo.frequency.setValueAtTime(0.2, this.audioContext.currentTime) // Slow modulation
    lfoGain.gain.setValueAtTime(2, this.audioContext.currentTime) // Subtle variation

    lfo.connect(lfoGain)
    lfoGain.connect(oscillator.frequency)
    lfo.start()

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(this.musicGainNode)

    return oscillator
  }

  /**
   * Stop background music
   */
  public stopBackgroundMusic() {
    if (!this.musicPlaying) {
      return
    }

    const now = this.audioContext.currentTime

    // Fade out music
    this.musicGainNode.gain.setValueAtTime(this.musicVolume, now)
    this.musicGainNode.gain.linearRampToValueAtTime(0, now + 1.0)

    // Stop all oscillators after fade
    setTimeout(() => {
      this.musicOscillators.forEach((osc) => {
        try {
          osc.stop()
        } catch (error) {
          // Oscillator may already be stopped
        }
      })
      this.musicOscillators = []
      this.musicPlaying = false

      // Restore music volume
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime)
    }, 1100)
  }

  /**
   * Clean up audio resources
   */
  public destroy() {
    this.stopBackgroundMusic()

    // Close audio context
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager()
