import { Question } from '../../types'
import { QUESTIONS } from '../../data/questions'

export class QuestionManager {
  private currentLevel: number = 1
  private askedQuestions: Set<string> = new Set()
  private availableQuestions: Question[] = []

  constructor(level: number) {
    this.currentLevel = level
    this.loadQuestionsForLevel(level)
  }

  private loadQuestionsForLevel(level: number) {
    this.availableQuestions = QUESTIONS.filter(
      q => q.insectLevel === level && !this.askedQuestions.has(q.id)
    )
  }

  getNextQuestion(): Question | null {
    if (this.availableQuestions.length === 0) {
      this.resetLevel()
      this.loadQuestionsForLevel(this.currentLevel)

      // Safety check: if still no questions, return null
      if (this.availableQuestions.length === 0) {
        console.warn(`No questions available for level ${this.currentLevel}`)
        return null
      }
    }

    const randomIndex = Math.floor(
      Math.random() * this.availableQuestions.length
    )
    const question = this.availableQuestions[randomIndex]

    this.availableQuestions.splice(randomIndex, 1)
    this.askedQuestions.add(question.id)

    return question
  }

  resetLevel() {
    this.askedQuestions.clear()
    this.loadQuestionsForLevel(this.currentLevel)
  }

  setLevel(level: number) {
    this.currentLevel = level
    this.resetLevel()
    this.loadQuestionsForLevel(level)
  }
}
