/**
 * SettingsManager
 * Manages accessibility and game settings with localStorage persistence
 * Phase 11: Accessibility & Settings
 */

export type FontSize = 'small' | 'medium' | 'large'
export type ColorblindMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'
export type DifficultyMode = 'easy' | 'normal' | 'hard'

export interface GameSettings {
  // Font settings
  fontSize: FontSize

  // Colorblind mode
  colorblindMode: ColorblindMode

  // Difficulty settings
  difficultyMode: DifficultyMode
  readingTimeMultiplier: number // 1.0 = normal, 1.5 = 50% more time, 0.75 = 25% less time

  // Control settings
  keyboardOnlyMode: boolean // Disables mouse aiming when true

  // Audio settings (from Phase 10)
  musicVolume: number // 0.0 to 1.0
  soundEffectsVolume: number // 0.0 to 1.0
  musicEnabled: boolean
  soundEffectsEnabled: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  fontSize: 'medium',
  colorblindMode: 'normal',
  difficultyMode: 'normal',
  readingTimeMultiplier: 1.0,
  keyboardOnlyMode: false,
  musicVolume: 0.6,
  soundEffectsVolume: 0.8,
  musicEnabled: true,
  soundEffectsEnabled: true,
}

const STORAGE_KEY = 'chameleon-quest-settings'

export class SettingsManager {
  private static instance: SettingsManager
  private settings!: GameSettings
  private listeners: Set<(settings: GameSettings) => void> = new Set()

  constructor() {
    if (SettingsManager.instance) {
      return SettingsManager.instance
    }

    this.settings = this.loadSettings()
    SettingsManager.instance = this
  }

  /**
   * Load settings from localStorage or use defaults
   */
  private loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to handle new settings
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
    return { ...DEFAULT_SETTINGS }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }

  /**
   * Add a listener for settings changes
   */
  public addListener(listener: (settings: GameSettings) => void): void {
    this.listeners.add(listener)
  }

  /**
   * Remove a listener
   */
  public removeListener(listener: (settings: GameSettings) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of settings changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.settings))
  }

  /**
   * Get all current settings
   */
  public getSettings(): GameSettings {
    return { ...this.settings }
  }

  /**
   * Update settings (partial update)
   */
  public updateSettings(partialSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partialSettings }
    this.saveSettings()
  }

  /**
   * Reset all settings to defaults
   */
  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS }
    this.saveSettings()
  }

  // Convenience getters
  public getFontSize(): FontSize {
    return this.settings.fontSize
  }

  public getColorblindMode(): ColorblindMode {
    return this.settings.colorblindMode
  }

  public getDifficultyMode(): DifficultyMode {
    return this.settings.difficultyMode
  }

  public getReadingTimeMultiplier(): number {
    return this.settings.readingTimeMultiplier
  }

  public isKeyboardOnlyMode(): boolean {
    return this.settings.keyboardOnlyMode
  }

  public getMusicVolume(): number {
    return this.settings.musicVolume
  }

  public getSoundEffectsVolume(): number {
    return this.settings.soundEffectsVolume
  }

  public isMusicEnabled(): boolean {
    return this.settings.musicEnabled
  }

  public isSoundEffectsEnabled(): boolean {
    return this.settings.soundEffectsEnabled
  }

  // Convenience setters
  public setFontSize(fontSize: FontSize): void {
    this.updateSettings({ fontSize })
  }

  public setColorblindMode(mode: ColorblindMode): void {
    this.updateSettings({ colorblindMode: mode })
  }

  public setDifficultyMode(mode: DifficultyMode): void {
    // Update reading time multiplier based on difficulty
    let multiplier = 1.0
    switch (mode) {
      case 'easy':
        multiplier = 1.5
        break
      case 'normal':
        multiplier = 1.0
        break
      case 'hard':
        multiplier = 0.75
        break
    }
    this.updateSettings({
      difficultyMode: mode,
      readingTimeMultiplier: multiplier,
    })
  }

  public setKeyboardOnlyMode(enabled: boolean): void {
    this.updateSettings({ keyboardOnlyMode: enabled })
  }

  /**
   * Get font size in pixels based on current setting
   */
  public getFontSizeValue(baseSize: 'heading' | 'question' | 'body' | 'small'): string {
    const multipliers = {
      small: 0.85,
      medium: 1.0,
      large: 1.2,
    }

    const baseSizes = {
      heading: 32,
      question: 22,
      body: 18,
      small: 14,
    }

    const size = baseSizes[baseSize] * multipliers[this.settings.fontSize]
    return `${Math.round(size)}px`
  }

  /**
   * Get colorblind-adjusted colors
   */
  public getColorblindColor(originalColor: number): number {
    const mode = this.settings.colorblindMode
    if (mode === 'normal') {
      return originalColor
    }

    // Convert hex to RGB
    const r = (originalColor >> 16) & 0xff
    const g = (originalColor >> 8) & 0xff
    const b = originalColor & 0xff

    // Apply colorblind filter transformations
    let newR = r
    let newG = g
    let newB = b

    switch (mode) {
      case 'protanopia': // Red-blind
        newR = 0.567 * r + 0.433 * g
        newG = 0.558 * r + 0.442 * g
        newB = 0.242 * g + 0.758 * b
        break
      case 'deuteranopia': // Green-blind
        newR = 0.625 * r + 0.375 * g
        newG = 0.7 * r + 0.3 * g
        newB = 0.3 * g + 0.7 * b
        break
      case 'tritanopia': // Blue-blind
        newR = 0.95 * r + 0.05 * g
        newG = 0.433 * g + 0.567 * b
        newB = 0.475 * g + 0.525 * b
        break
    }

    // Clamp values and convert back to hex
    newR = Math.max(0, Math.min(255, Math.round(newR)))
    newG = Math.max(0, Math.min(255, Math.round(newG)))
    newB = Math.max(0, Math.min(255, Math.round(newB)))

    return (newR << 16) | (newG << 8) | newB
  }

  /**
   * Get high-contrast color pair for colorblind modes
   * Returns alternative colors that maintain contrast
   */
  public getHighContrastGlow(): { color: number; glowColor: number } {
    const mode = this.settings.colorblindMode

    switch (mode) {
      case 'protanopia':
      case 'deuteranopia':
        // Use blue/yellow instead of green/red
        return {
          color: 0xf4c430, // Golden yellow
          glowColor: 0x4a7ba7, // Deep blue
        }
      case 'tritanopia':
        // Use red/cyan instead of blue/yellow
        return {
          color: 0xff6b6b, // Soft red
          glowColor: 0x4ecdc4, // Cyan
        }
      default:
        // Normal mode - use default colors
        return {
          color: 0xf4c430, // Golden
          glowColor: 0xa8e0c8, // Mint green
        }
    }
  }
}

// Export singleton instance
export const settingsManager = new SettingsManager()
