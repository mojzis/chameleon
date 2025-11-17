import Phaser from 'phaser'
import { QuestionCard } from '../objects/QuestionCard'
import { InsectCard } from '../objects/InsectCard'
import { QuestionManager } from './QuestionManager'
import { SPAWN_CONFIG, CARD_CONFIG } from '../config'
import { Question, Insect } from '../../types'
import { getInsectById, INSECTS } from '../../data/insects'

interface SpawnedQuestion {
  questionCard: QuestionCard
  insectCards: InsectCard[]
  correctInsect: Insect
  spawnTime: number
}

export class SpawnManager {
  private scene: Phaser.Scene
  private questionManager: QuestionManager
  private activeQuestions: SpawnedQuestion[] = []
  private spawnTimer: Phaser.Time.TimerEvent | null = null

  constructor(scene: Phaser.Scene, level: number) {
    this.scene = scene
    this.questionManager = new QuestionManager(level)
  }

  /**
   * Start the spawn system
   */
  start() {
    // Spawn first question after a short delay
    this.scene.time.delayedCall(2000, () => {
      this.spawnQuestion()
    })

    // Set up recurring spawn timer
    this.spawnTimer = this.scene.time.addEvent({
      delay: SPAWN_CONFIG.questionSpawnInterval,
      callback: () => this.spawnQuestion(),
      loop: true,
    })
  }

  /**
   * Stop the spawn system
   */
  stop() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy()
      this.spawnTimer = null
    }
  }

  /**
   * Spawn a new question with insects
   */
  private spawnQuestion() {
    // Check if we've reached max active questions
    if (this.activeQuestions.length >= SPAWN_CONFIG.maxActiveQuestions) {
      return
    }

    // Get next question from manager
    const question = this.questionManager.getNextQuestion()
    if (!question) {
      console.warn('No questions available')
      return
    }

    // Get correct insect
    const correctInsect = getInsectById(question.correctInsectId)
    if (!correctInsect) {
      console.error(`Insect not found: ${question.correctInsectId}`)
      return
    }

    // Create question card
    const questionCard = new QuestionCard(
      this.scene,
      SPAWN_CONFIG.questionSpawnX,
      CARD_CONFIG.questionStartY,
      {
        id: question.id,
        text: question.text,
      }
    )

    // Schedule insect spawning after delay
    this.scene.time.delayedCall(SPAWN_CONFIG.insectSpawnDelay, () => {
      this.spawnInsects(question, correctInsect, questionCard)
    })
  }

  /**
   * Spawn insects for a question
   */
  private spawnInsects(
    question: Question,
    correctInsect: Insect,
    questionCard: QuestionCard
  ) {
    // Get distractor insects (wrong answers)
    const distractors = this.getDistractors(
      correctInsect,
      question.distractorCount
    )

    // Combine correct and distractor insects
    const allInsects = [correctInsect, ...distractors]

    // Shuffle so correct answer isn't always in same position
    Phaser.Utils.Array.Shuffle(allInsects)

    // Calculate spawn positions
    const positions = this.calculateInsectPositions(allInsects.length)

    // Spawn insects with staggered timing
    const insectCards: InsectCard[] = []
    allInsects.forEach((insect, index) => {
      this.scene.time.delayedCall(
        SPAWN_CONFIG.insectSpawnStagger * index,
        () => {
          const isCorrect = insect.id === correctInsect.id
          const insectCard = new InsectCard(
            this.scene,
            positions[index],
            CARD_CONFIG.insectStartY,
            insect,
            isCorrect
          )
          insectCards.push(insectCard)
        }
      )
    })

    // Track this question
    this.activeQuestions.push({
      questionCard,
      insectCards,
      correctInsect,
      spawnTime: this.scene.time.now,
    })
  }

  /**
   * Get distractor insects (wrong answers)
   */
  private getDistractors(correctInsect: Insect, count: number): Insect[] {
    // Get insects from same level or lower
    const availableInsects = INSECTS.filter(
      (insect) =>
        insect.id !== correctInsect.id && insect.level <= correctInsect.level
    )

    // Shuffle and take the requested count
    Phaser.Utils.Array.Shuffle(availableInsects)
    return availableInsects.slice(0, count)
  }

  /**
   * Calculate evenly spaced positions for insects
   */
  private calculateInsectPositions(count: number): number[] {
    const positions: number[] = []
    const totalWidth =
      SPAWN_CONFIG.insectSpawnXMax - SPAWN_CONFIG.insectSpawnXMin
    const spacing = totalWidth / (count + 1)

    for (let i = 0; i < count; i++) {
      positions.push(SPAWN_CONFIG.insectSpawnXMin + spacing * (i + 1))
    }

    return positions
  }

  /**
   * Update all active questions
   */
  update() {
    // Clean up off-screen questions
    this.activeQuestions = this.activeQuestions.filter((spawned) => {
      const questionOffScreen = spawned.questionCard.isOffScreen()

      if (questionOffScreen) {
        // Clean up insects too
        spawned.insectCards.forEach((card) => {
          if (!card.isOffScreenCheck()) {
            card.destroy()
          }
        })
        return false
      }

      return true
    })
  }

  /**
   * Get all active question cards
   */
  getActiveQuestionCards(): QuestionCard[] {
    return this.activeQuestions.map((q) => q.questionCard)
  }

  /**
   * Get all active insect cards
   */
  getActiveInsectCards(): InsectCard[] {
    return this.activeQuestions.flatMap((q) => q.insectCards)
  }

  /**
   * Handle insect caught
   */
  onInsectCaught(insectCard: InsectCard) {
    // Find the question this insect belongs to
    const spawned = this.activeQuestions.find((q) =>
      q.insectCards.includes(insectCard)
    )

    if (spawned) {
      // Clean up this question
      spawned.questionCard.destroy()

      // Clean up remaining insects
      spawned.insectCards.forEach((card) => {
        if (card !== insectCard && !card.isOffScreenCheck()) {
          card.destroy()
        }
      })

      // Remove from active questions
      this.activeQuestions = this.activeQuestions.filter(
        (q) => q !== spawned
      )

      return spawned.correctInsect
    }

    return null
  }

  /**
   * Clean up all spawned objects
   */
  destroy() {
    this.stop()

    // Clean up all active questions
    this.activeQuestions.forEach((spawned) => {
      spawned.questionCard.destroy()
      spawned.insectCards.forEach((card) => card.destroy())
    })

    this.activeQuestions = []
  }
}
