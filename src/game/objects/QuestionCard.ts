import Phaser from 'phaser'
import { COLORS, THEME } from '../../data/theme'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'

interface QuestionData {
  id: string
  text: string
}

export class QuestionCard extends Phaser.GameObjects.Container {
  private questionText!: Phaser.GameObjects.Text
  private fallSpeed: number = CARD_CONFIG.questionFallSpeed
  private questionData: QuestionData
  private offScreen: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    question: QuestionData
  ) {
    super(scene, x, y)

    this.questionData = question

    // Background card
    const background = scene.add.rectangle(-200, 0, 400, 120, COLORS.cardBg)
    background.setStrokeStyle(3, COLORS.cardBorder)
    this.add(background)

    // Question text
    this.questionText = scene.add.text(0, 0, question.text, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '22px',
      color: THEME.textPrimary,
      align: 'center',
      wordWrap: { width: 360 },
    })
    this.questionText.setOrigin(0.5)
    this.add(this.questionText)

    scene.add.existing(this)
  }

  update(delta: number) {
    // Fall gently
    this.y += (this.fallSpeed * delta) / 1000

    // Check if off-screen
    if (this.y > GAME_CONFIG_BOUNDS.height) {
      this.offScreen = true
      this.destroy()
    }
  }

  isOffScreen(): boolean {
    return this.offScreen || this.y > GAME_CONFIG_BOUNDS.height
  }

  getQuestionData(): QuestionData {
    return this.questionData
  }
}
