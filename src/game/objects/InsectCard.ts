import Phaser from 'phaser'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'
import { Insect } from '../../types'

export class InsectCard extends Phaser.GameObjects.Container {
  private insectData: Insect
  private isCorrect: boolean
  private fallSpeed: number = CARD_CONFIG.insectFallSpeed
  private isOffScreen: boolean = false
  private attachedToTongue: boolean = false
  private helpGlow: Phaser.GameObjects.Graphics | null = null
  private driftOffset: number = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    insect: Insect,
    isCorrect: boolean
  ) {
    super(scene, x, y)

    this.insectData = insect
    this.isCorrect = isCorrect
    this.driftOffset = Math.random() * Math.PI * 2 // Random phase for drift

    // Create placeholder insect (colored circle)
    const color = parseInt(insect.color.replace('#', '0x'), 16)
    const insectShape = scene.add.circle(0, 0, 40, color)
    insectShape.setStrokeStyle(2, 0xffffff, 0.5)
    this.add(insectShape)

    // Add label below with common name
    const label = scene.add.text(0, 60, insect.commonName, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '16px',
      color: '#2C3E50',
      align: 'center',
      wordWrap: { width: 150 },
    })
    label.setOrigin(0.5)
    this.add(label)

    scene.add.existing(this)

    // Fade in animation
    this.setAlpha(0)
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
    })
  }

  update(delta: number) {
    if (this.attachedToTongue) {
      // Follow tongue position (handled externally)
      return
    }

    // Fall gently
    this.y += (this.fallSpeed * delta) / 1000

    // Gentle horizontal drift (sine wave with unique offset)
    const time = this.scene.time.now / 1000
    this.x += Math.sin(time + this.driftOffset) * 0.3

    // Check if off-screen
    if (this.y > GAME_CONFIG_BOUNDS.height) {
      this.isOffScreen = true
      this.destroy()
    }
  }

  isOffScreenCheck(): boolean {
    return this.isOffScreen || this.y > GAME_CONFIG_BOUNDS.height
  }

  getInsectData(): Insect {
    return this.insectData
  }

  isCorrectAnswer(): boolean {
    return this.isCorrect
  }

  showHelpGlow() {
    // Remove existing glow if any
    if (this.helpGlow) {
      this.helpGlow.destroy()
    }

    // Add pulsing glow around correct insect
    this.helpGlow = this.scene.add.graphics()
    this.helpGlow.lineStyle(4, 0xf4c430, 1) // Golden glow
    this.helpGlow.strokeCircle(0, 0, 60)
    this.add(this.helpGlow)

    // Pulsing animation
    this.scene.tweens.add({
      targets: this.helpGlow,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    })
  }

  hideHelpGlow() {
    if (this.helpGlow) {
      this.helpGlow.destroy()
      this.helpGlow = null
    }
  }

  attachToTongue() {
    this.attachedToTongue = true
    this.hideHelpGlow()
  }

  celebrate() {
    this.hideHelpGlow()
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
