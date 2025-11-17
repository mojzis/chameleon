export interface LevelStats {
  score: number
  correctAnswers: number
  totalAnswers: number
  accuracy: number
  helpUsed: number
  insectsDiscovered: Set<string>
  startTime: number
  endTime: number | null
  duration: number // in seconds
  questionsAttempted: number
}

export class ScoreManager {
  private score: number = 0
  private correctAnswers: number = 0
  private totalAnswers: number = 0
  private helpUsed: number = 0
  private insectsDiscovered: Set<string> = new Set()
  private startTime: number = 0
  private endTime: number | null = null
  private questionsAttempted: number = 0

  constructor() {
    this.startLevel()
  }

  /**
   * Start tracking time for a level
   */
  startLevel() {
    this.startTime = Date.now()
    this.endTime = null
  }

  /**
   * End level tracking
   */
  endLevel() {
    this.endTime = Date.now()
  }

  /**
   * Add points to score
   */
  addScore(points: number) {
    this.score += points
  }

  /**
   * Record a correct answer
   */
  recordCorrect(insectId?: string) {
    this.correctAnswers++
    this.totalAnswers++
    this.addScore(10)

    if (insectId) {
      this.insectsDiscovered.add(insectId)
    }
  }

  /**
   * Record an incorrect answer
   */
  recordIncorrect(insectId?: string) {
    this.totalAnswers++

    // Still count as discovered even if wrong
    if (insectId) {
      this.insectsDiscovered.add(insectId)
    }
  }

  /**
   * Record that help was used
   */
  recordHelpUsed() {
    this.helpUsed++
  }

  /**
   * Record that a question was attempted
   */
  recordQuestionAttempted() {
    this.questionsAttempted++
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.score
  }

  /**
   * Get accuracy percentage
   */
  getAccuracy(): number {
    if (this.totalAnswers === 0) return 0
    return (this.correctAnswers / this.totalAnswers) * 100
  }

  /**
   * Get number of correct answers
   */
  getCorrectAnswers(): number {
    return this.correctAnswers
  }

  /**
   * Get total answers attempted
   */
  getTotalAnswers(): number {
    return this.totalAnswers
  }

  /**
   * Get number of times help was used
   */
  getHelpUsed(): number {
    return this.helpUsed
  }

  /**
   * Get discovered insect IDs
   */
  getDiscoveredInsects(): string[] {
    return Array.from(this.insectsDiscovered)
  }

  /**
   * Get number of insects discovered
   */
  getInsectsDiscoveredCount(): number {
    return this.insectsDiscovered.size
  }

  /**
   * Get level duration in seconds
   */
  getDuration(): number {
    const end = this.endTime || Date.now()
    return Math.floor((end - this.startTime) / 1000)
  }

  /**
   * Get number of questions attempted
   */
  getQuestionsAttempted(): number {
    return this.questionsAttempted
  }

  /**
   * Get complete stats for the level
   */
  getStats(): LevelStats {
    return {
      score: this.score,
      correctAnswers: this.correctAnswers,
      totalAnswers: this.totalAnswers,
      accuracy: this.getAccuracy(),
      helpUsed: this.helpUsed,
      insectsDiscovered: new Set(this.insectsDiscovered),
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      questionsAttempted: this.questionsAttempted,
    }
  }

  /**
   * Reset all stats (for new level)
   */
  reset() {
    this.score = 0
    this.correctAnswers = 0
    this.totalAnswers = 0
    this.helpUsed = 0
    this.insectsDiscovered.clear()
    this.questionsAttempted = 0
    this.startLevel()
  }
}
