export interface LevelProgress {
  level: number
  completed: boolean
  bestScore: number
  bestAccuracy: number
  insectsDiscovered: string[]
  timesPlayed: number
  helpUsed: number
}

export interface GameProgress {
  levels: Map<number, LevelProgress>
  currentLevel: number
  totalInsectsDiscovered: Set<string>
}

export class LevelProgressManager {
  private static readonly STORAGE_KEY = 'chameleon-quest-progress'
  private progress: GameProgress

  constructor() {
    this.progress = this.loadProgress()
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): GameProgress {
    try {
      const stored = localStorage.getItem(LevelProgressManager.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          levels: new Map(
            Object.entries(parsed.levels).map(([key, value]) => [
              parseInt(key),
              value as LevelProgress,
            ])
          ),
          currentLevel: parsed.currentLevel || 1,
          totalInsectsDiscovered: new Set(parsed.totalInsectsDiscovered || []),
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }

    // Return default progress if nothing stored or error occurred
    return this.createDefaultProgress()
  }

  /**
   * Create default progress (Level 1 unlocked, rest locked)
   */
  private createDefaultProgress(): GameProgress {
    const levels = new Map<number, LevelProgress>()

    // Initialize 5 levels
    for (let i = 1; i <= 5; i++) {
      levels.set(i, {
        level: i,
        completed: false,
        bestScore: 0,
        bestAccuracy: 0,
        insectsDiscovered: [],
        timesPlayed: 0,
        helpUsed: 0,
      })
    }

    return {
      levels,
      currentLevel: 1,
      totalInsectsDiscovered: new Set(),
    }
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress() {
    try {
      const toStore = {
        levels: Object.fromEntries(this.progress.levels),
        currentLevel: this.progress.currentLevel,
        totalInsectsDiscovered: Array.from(this.progress.totalInsectsDiscovered),
      }
      localStorage.setItem(
        LevelProgressManager.STORAGE_KEY,
        JSON.stringify(toStore)
      )
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  /**
   * Check if a level is unlocked
   */
  isLevelUnlocked(level: number): boolean {
    if (level === 1) return true // Level 1 always unlocked

    // A level is unlocked if the previous level is completed
    const previousLevel = this.progress.levels.get(level - 1)
    return previousLevel?.completed || false
  }

  /**
   * Get all unlocked level numbers
   */
  getUnlockedLevels(): number[] {
    const unlocked: number[] = []
    for (let i = 1; i <= 5; i++) {
      if (this.isLevelUnlocked(i)) {
        unlocked.push(i)
      }
    }
    return unlocked
  }

  /**
   * Mark a level as completed and update stats
   */
  completeLevel(
    level: number,
    score: number,
    accuracy: number,
    insectsDiscovered: string[],
    helpUsed: number
  ) {
    const levelProgress = this.progress.levels.get(level)
    if (!levelProgress) return

    // Update level progress
    levelProgress.completed = true
    levelProgress.timesPlayed++
    levelProgress.helpUsed += helpUsed

    // Update best score and accuracy if better
    if (score > levelProgress.bestScore) {
      levelProgress.bestScore = score
    }
    if (accuracy > levelProgress.bestAccuracy) {
      levelProgress.bestAccuracy = accuracy
    }

    // Merge discovered insects
    const uniqueInsects = new Set([
      ...levelProgress.insectsDiscovered,
      ...insectsDiscovered,
    ])
    levelProgress.insectsDiscovered = Array.from(uniqueInsects)

    // Update global insect discovery
    insectsDiscovered.forEach((insectId) => {
      this.progress.totalInsectsDiscovered.add(insectId)
    })

    // Unlock next level if exists
    if (level < 5) {
      this.progress.currentLevel = Math.max(
        this.progress.currentLevel,
        level + 1
      )
    }

    this.saveProgress()
  }

  /**
   * Record that a level was played (even if not completed)
   */
  recordLevelPlayed(level: number) {
    const levelProgress = this.progress.levels.get(level)
    if (levelProgress) {
      levelProgress.timesPlayed++
      this.saveProgress()
    }
  }

  /**
   * Get progress for a specific level
   */
  getLevelProgress(level: number): LevelProgress | undefined {
    return this.progress.levels.get(level)
  }

  /**
   * Get current level (highest unlocked)
   */
  getCurrentLevel(): number {
    return this.progress.currentLevel
  }

  /**
   * Get all discovered insects across all levels
   */
  getAllDiscoveredInsects(): string[] {
    return Array.from(this.progress.totalInsectsDiscovered)
  }

  /**
   * Get total completion percentage
   */
  getCompletionPercentage(): number {
    const totalLevels = 5
    const completedLevels = Array.from(this.progress.levels.values()).filter(
      (level) => level.completed
    ).length
    return (completedLevels / totalLevels) * 100
  }

  /**
   * Reset all progress (for debugging/testing)
   */
  resetProgress() {
    this.progress = this.createDefaultProgress()
    this.saveProgress()
  }

  /**
   * Get stats for all levels
   */
  getAllLevelsProgress(): LevelProgress[] {
    return Array.from(this.progress.levels.values())
  }
}
