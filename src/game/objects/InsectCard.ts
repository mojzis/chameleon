import Phaser from 'phaser'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'
import { Insect } from '../../types'
import type { Tongue } from './Tongue'

export class InsectCard extends Phaser.GameObjects.Container {
  private insectData: Insect
  private isCorrect: boolean
  private fallSpeed: number = CARD_CONFIG.insectFallSpeed
  private isOffScreen: boolean = false
  private attachedToTongue: Tongue | null = null
  private isCaught: boolean = false
  private helpGlow: Phaser.GameObjects.Graphics | null = null
  private driftOffset: number = 0
  private insectSprite!: Phaser.GameObjects.Sprite

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

    // Create insect sprite using imageKey
    this.insectSprite = scene.add.sprite(0, 0, insect.imageKey)
    this.insectSprite.setOrigin(0.5, 0.5)

    // Scale based on insect size
    const scale = insect.size === 'large' ? 0.8 : insect.size === 'medium' ? 0.6 : 0.4
    this.insectSprite.setScale(scale)
    this.add(this.insectSprite)

    // Add soft shadow for depth
    const shadow = scene.add.ellipse(0, 5, 80 * scale, 20 * scale, 0x000000)
    shadow.setAlpha(0.2)
    shadow.setDepth(-1)
    this.add(shadow)

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

    // Gentle floating/rotation animation
    scene.tweens.add({
      targets: this.insectSprite,
      angle: { from: -5, to: 5 },
      duration: 2000 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
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

  attachToTongue(tongue: Tongue) {
    this.attachedToTongue = tongue
    this.isCaught = true
    this.hideHelpGlow()

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

  isCaughtByTongue(): boolean {
    return this.isCaught
  }
}
