import Phaser from 'phaser'
import { COLORS, THEME } from '../../data/theme'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'

interface QuestionData {
  id: string
  text: string
}

export class QuestionCard extends Phaser.GameObjects.Container {
  private questionText!: Phaser.GameObjects.Text
  private background!: Phaser.GameObjects.Graphics
  private fallSpeed: number = CARD_CONFIG.questionFallSpeed
  private questionData: QuestionData
  private offScreen: boolean = false
  private spawnTime: number = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    question: QuestionData
  ) {
    super(scene, x, y)

    this.questionData = question
    this.spawnTime = scene.time.now

    // Background card with rounded corners
    this.background = scene.add.graphics()
    this.background.fillStyle(COLORS.cardBg, 0.95)
    this.background.fillRoundedRect(-200, -60, 400, 120, 16)
    this.background.lineStyle(3, COLORS.cardBorder, 1)
    this.background.strokeRoundedRect(-200, -60, 400, 120, 16)
    this.add(this.background)

    // Question text (large, readable)
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

    // Fade in animation
    this.setAlpha(0)
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    })
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

  getSpawnTime(): number {
    return this.spawnTime
  }

  getTimeSinceSpawn(currentTime: number): number {
    return currentTime - this.spawnTime
  }
}
