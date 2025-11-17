import Phaser from 'phaser'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'
import type { Tongue } from './Tongue'

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
  private attachedToTongue: Tongue | null = null
  private isCaught: boolean = false
  private helpGlow: Phaser.GameObjects.Graphics | null = null

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
    // If attached to tongue, follow tongue position
    if (this.attachedToTongue) {
      this.followTongue()
      return
    }

    // If already caught, don't fall
    if (this.isCaught) {
      return
    }

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

  attachToTongue(tongue: Tongue) {
    this.attachedToTongue = tongue
    this.isCaught = true

    // Add rotation animation for caught effect
    this.scene.tweens.add({
      targets: this,
      angle: this.angle + 360,
      duration: 600,
      ease: 'Quad.easeOut',
    })
  }

  private followTongue() {
    if (!this.attachedToTongue) return

    const tipX = this.attachedToTongue.getTipX()
    const tipY = this.attachedToTongue.getTipY()

    // Smooth follow with slight lag for organic feel
    this.x = Phaser.Math.Linear(this.x, tipX, 0.3)
    this.y = Phaser.Math.Linear(this.y, tipY, 0.3)
  }

  detachFromTongue() {
    this.attachedToTongue = null
  }

  showHelpGlow() {
    // Create pulsing golden glow around correct insect
    if (this.helpGlow) {
      this.helpGlow.destroy()
    }

    this.helpGlow = this.scene.add.graphics()
    this.helpGlow.lineStyle(4, 0xf4c430, 1)
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

  isCaughtByTongue(): boolean {
    return this.isCaught
  }
}
