export class ScoreManager {
  private score: number = 0
  private correctAnswers: number = 0
  private totalAnswers: number = 0

  addScore(points: number) {
    this.score += points
  }

  recordCorrect() {
    this.correctAnswers++
    this.totalAnswers++
    this.addScore(10)
  }

  recordIncorrect() {
    this.totalAnswers++
  }

  getScore(): number {
    return this.score
  }

  getAccuracy(): number {
    if (this.totalAnswers === 0) return 0
    return (this.correctAnswers / this.totalAnswers) * 100
  }

  reset() {
    this.score = 0
    this.correctAnswers = 0
    this.totalAnswers = 0
  }
}
