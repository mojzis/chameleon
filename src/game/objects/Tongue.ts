import Phaser from 'phaser'
import { TONGUE_CONFIG, FEEL_CONFIG } from '../config'
import { InsectCard } from './InsectCard'

export class Tongue extends Phaser.GameObjects.Graphics {
  private startX: number
  private startY: number
  private tongueAngle: number
  private currentLength: number = 0
  private maxLength: number = TONGUE_CONFIG.maxLength
  private extending: boolean = true
  private finished: boolean = false
  private caughtInsect: InsectCard | null = null

  // Animation curve
  private extensionStartTime: number = 0
  private peakReachedAt: number = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number
  ) {
    super(scene)

    this.startX = x
    this.startY = y
    this.tongueAngle = angle
    this.extensionStartTime = scene.time.now

    scene.add.existing(this)

    // Emit visual effects on shoot
    this.onTongueShot()
  }

  update(_delta: number) {
    const elapsedTime = this.scene.time.now - this.extensionStartTime

    if (this.extending) {
      this.updateExtension(elapsedTime)
    } else {
      this.updateRetraction()
    }

    this.drawTongue()
  }

  private updateExtension(elapsedTime: number) {
    // Use easing curve for snappy feel
    // Fast extension using Power2.easeOut
    const progress = Math.min(
      elapsedTime / FEEL_CONFIG.TONGUE_EXTENSION_TIME,
      1
    )

    // Power2.easeOut: starts fast, decelerates
    const eased = 1 - Math.pow(1 - progress, 2)
    this.currentLength = this.maxLength * eased

    if (progress >= 1) {
      // Reached max length
      this.extending = false
      this.peakReachedAt = this.scene.time.now

      // Slight overshoot for snappiness (5% beyond max)
      this.currentLength = this.maxLength * 1.05
    }
  }

  private updateRetraction() {
    // Physics-based retraction: decelerating curve
    const timeSincePeak = this.scene.time.now - this.peakReachedAt

    // Use sine curve for smooth deceleration
    const retractionProgress = Math.min(
      timeSincePeak / FEEL_CONFIG.TONGUE_RETRACTION_TIME,
      1
    )

    // Sine.easeIn: starts slow, accelerates
    const eased = Math.sin((retractionProgress * Math.PI) / 2)
    this.currentLength = this.maxLength * (1.05 - eased * 1.05)

    if (retractionProgress >= 1) {
      this.finished = true
    }
  }

  private onTongueShot() {
    // Screen shake effect (subtle)
    this.scene.cameras.main.shake(
      FEEL_CONFIG.IMPACT_SHAKE_DURATION,
      0.005
    )

    // Flash effect
    this.createImpactFlash()

    // Particle effect
    this.createTongueParticles()

    // Sound effect placeholder (will be activated in Phase 10)
    // this.scene.sound.play('tongue-shoot', { volume: 0.8 })
  }

  private createImpactFlash() {
    // Quick white flash when tongue shoots
    const flash = this.scene.add.graphics()
    flash.fillStyle(0xffffff, 0.3)
    flash.fillRect(0, 0, 1920, 1080)
    flash.setAlpha(0.5)

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 100,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    })
  }

  private createTongueParticles() {
    // Subtle particle trail from chameleon mouth
    const angleRad = Phaser.Math.DegToRad(this.tongueAngle)

    for (let i = 0; i < 5; i++) {
      const speed = 200 + Math.random() * 100
      const spread = (Math.random() - 0.5) * 0.2

      const particle = this.scene.add.circle(
        this.startX + Math.cos(angleRad) * 30,
        this.startY + Math.sin(angleRad) * 30,
        2 + Math.random() * 2,
        0xf4a6c6
      )

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angleRad + spread) * speed,
        y: particle.y + Math.sin(angleRad + spread) * speed,
        alpha: 0,
        scale: 0.5,
        duration: FEEL_CONFIG.PARTICLE_LIFETIME,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      })
    }
  }

  private drawTongue() {
    this.clear()

    // Calculate end point
    const endX =
      this.startX +
      Math.cos(Phaser.Math.DegToRad(this.tongueAngle)) * this.currentLength
    const endY =
      this.startY +
      Math.sin(Phaser.Math.DegToRad(this.tongueAngle)) * this.currentLength

    // Progressive width taper (thinner at tip)
    const baseWidth = 8
    const tipWidth = 3

    // Draw tongue with gradient width effect
    // Segment from start to 80% of current length (full width)
    this.drawTongueSegment(
      this.startX,
      this.startY,
      this.startX + (endX - this.startX) * TONGUE_CONFIG.baseTaperRatio,
      this.startY + (endY - this.startY) * TONGUE_CONFIG.baseTaperRatio,
      baseWidth,
      baseWidth
    )

    // Segment from 80% to tip (tapered)
    this.drawTongueSegment(
      this.startX + (endX - this.startX) * TONGUE_CONFIG.baseTaperRatio,
      this.startY + (endY - this.startY) * TONGUE_CONFIG.baseTaperRatio,
      endX,
      endY,
      baseWidth,
      tipWidth
    )

    // Draw sticky tip with glow
    this.drawStickyTip(endX, endY)
  }

  private drawTongueSegment(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width1: number,
    width2: number
  ) {
    this.lineStyle(width1, 0xf4a6c6, 1)
    this.beginPath()
    this.moveTo(x1, y1)
    this.lineTo(x2, y2)
    this.strokePath()

    if (width2 < width1) {
      // Add tapered appearance
      this.lineStyle(width2, 0xf4a6c6, 0.8)
      this.beginPath()
      this.moveTo(x2, y2)
      this.lineTo(x2, y2)
      this.strokePath()
    }
  }

  private drawStickyTip(x: number, y: number) {
    // Main sticky tip
    this.fillStyle(0xf4a6c6, 1)
    this.fillCircle(x, y, TONGUE_CONFIG.tipRadius)

    // Glow effect (slightly larger, more transparent)
    this.fillStyle(0xf4a6c6, 0.3)
    this.fillCircle(x, y, TONGUE_CONFIG.tipRadius + 8)
  }

  // Getter methods for collision detection
  getTipX(): number {
    return (
      this.startX +
      Math.cos(Phaser.Math.DegToRad(this.tongueAngle)) * this.currentLength
    )
  }

  getTipY(): number {
    return (
      this.startY +
      Math.sin(Phaser.Math.DegToRad(this.tongueAngle)) * this.currentLength
    )
  }

  isExtending(): boolean {
    return this.extending
  }

  isFinished(): boolean {
    return this.finished
  }

  getCurrentLength(): number {
    return this.currentLength
  }

  // Collision detection helper
  getTipRadius(): number {
    return TONGUE_CONFIG.tipRadius
  }

  // Catch an insect
  catchInsect(insect: InsectCard): void {
    if (this.caughtInsect) return // Already caught something

    this.caughtInsect = insect
    this.extending = false // Start retracting immediately
    this.peakReachedAt = this.scene.time.now

    // Visual/audio feedback
    this.onInsectCaught()

    // Attach insect to tongue
    insect.attachToTongue(this)
  }

  private onInsectCaught() {
    // Impact particles at catch point
    const tipX = this.getTipX()
    const tipY = this.getTipY()

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const speed = 100 + Math.random() * 50

      const particle = this.scene.add.circle(
        tipX,
        tipY,
        3 + Math.random() * 2,
        0xa8e0c8
      )

      this.scene.tweens.add({
        targets: particle,
        x: tipX + Math.cos(angle) * speed,
        y: tipY + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      })
    }

    // Slight camera shake
    this.scene.cameras.main.shake(100, 0.003)
  }

  getCaughtInsect(): InsectCard | null {
    return this.caughtInsect
  }

  hasCaughtInsect(): boolean {
    return this.caughtInsect !== null
  }
}
