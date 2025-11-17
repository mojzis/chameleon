import Phaser from 'phaser'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'

interface InsectData {
  id: string
  name: string
  color: string
}

export class InsectCard extends Phaser.GameObjects.Container {
  private insectData: InsectData
  private isCorrect: boolean
  private fallSpeed: number = CARD_CONFIG.insectFallSpeed
  private isOffScreen: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    insect: InsectData,
    isCorrect: boolean
  ) {
    super(scene, x, y)

    this.insectData = insect
    this.isCorrect = isCorrect

    // Create placeholder insect (colored circle)
    const color = parseInt(insect.color.replace('#', '0x'), 16)
    const insectShape = scene.add.circle(0, 0, 40, color)
    this.add(insectShape)

    // Add label below
    const label = scene.add.text(0, 50, insect.name, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '14px',
      color: '#2C3E50',
      align: 'center',
    })
    label.setOrigin(0.5)
    this.add(label)

    scene.add.existing(this)
  }

  update(delta: number) {
    // Fall gently
    this.y += (this.fallSpeed * delta) / 1000

    // Gentle horizontal drift (sine wave)
    this.x += Math.sin(this.scene.time.now / 1000 + this.y) * 0.3

    // Check if off-screen
    if (this.y > GAME_CONFIG_BOUNDS.height) {
      this.isOffScreen = true
      this.destroy()
    }
  }

  isOffScreenCheck(): boolean {
    return this.isOffScreen || this.y > GAME_CONFIG_BOUNDS.height
  }

  getInsectData(): InsectData {
    return this.insectData
  }

  isCorrectAnswer(): boolean {
    return this.isCorrect
  }

  celebrate() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.destroy()
      },
    })
  }
}
