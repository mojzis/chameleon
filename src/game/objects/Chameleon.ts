import Phaser from 'phaser'
import { CHAMELEON_CONFIG, TONGUE_CONFIG, FEEL_CONFIG } from '../config'
import { Tongue } from './Tongue'

export class Chameleon extends Phaser.GameObjects.Container {
  private currentAngle: number = 0
  private targetAngle: number = 0
  private rotationVelocity: number = 0
  private tongue: Tongue | null = null
  private lastTongueShot: number = 0
  private expression: 'neutral' | 'happy' | 'sad' | 'thinking' = 'neutral'

  // Animation states
  private aiming: boolean = false
  private inputBuffer: boolean = false

  // Visual components
  private head!: Phaser.GameObjects.Arc
  private leftEye!: Phaser.GameObjects.Arc
  private rightEye!: Phaser.GameObjects.Arc
  private leftEyeWhite!: Phaser.GameObjects.Arc
  private rightEyeWhite!: Phaser.GameObjects.Arc
  private leftEyeShine!: Phaser.GameObjects.Arc
  private rightEyeShine!: Phaser.GameObjects.Arc
  private aimingReticle!: Phaser.GameObjects.Graphics
  private cooldownIndicator: Phaser.GameObjects.Graphics | null = null

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.createChameleonVisuals()
    this.createAimingIndicator()

    // Register in scene
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start idle animation
    this.createIdleAnimation()
  }

  private createChameleonVisuals() {
    // Main head (green circle) with outline for definition
    this.head = this.scene.add.circle(0, 0, 50, 0x7bc8a0)
    this.head.setStrokeStyle(2, 0x5a9a80, 1)
    this.add(this.head)

    // Highlight for 3D effect
    const highlight = this.scene.add.circle(-15, -20, 12, 0xa8e0c8)
    highlight.setAlpha(0.6)
    this.add(highlight)

    // Eye sclera (white part)
    this.leftEyeWhite = this.scene.add.circle(-20, -10, 12, 0xffffff)
    this.rightEyeWhite = this.scene.add.circle(20, -10, 12, 0xffffff)
    this.add(this.leftEyeWhite)
    this.add(this.rightEyeWhite)

    // Iris (dark part)
    this.leftEye = this.scene.add.circle(-20, -10, 7, 0x2c3e50)
    this.rightEye = this.scene.add.circle(20, -10, 7, 0x2c3e50)
    this.add(this.leftEye)
    this.add(this.rightEye)

    // Eye shine (highlights for personality!)
    this.leftEyeShine = this.scene.add.circle(-18, -12, 2.5, 0xffffff, 0.8)
    this.rightEyeShine = this.scene.add.circle(22, -12, 2.5, 0xffffff, 0.8)
    this.add(this.leftEyeShine)
    this.add(this.rightEyeShine)

    // Mouth hint (small arc below)
    const mouth = this.scene.add.arc(0, 15, 8, 0, Math.PI, false)
    mouth.setStrokeStyle(2, 0x5a9a80, 1)
    this.add(mouth)
  }

  private createAimingIndicator() {
    // Subtle targeting reticle that appears while aiming
    this.aimingReticle = this.scene.add.graphics()
    this.add(this.aimingReticle)
    this.aimingReticle.setAlpha(0)
  }

  private createIdleAnimation() {
    // Eyes blink occasionally
    this.scene.time.delayedCall(3000 + Math.random() * 2000, () => {
      this.blink()
      this.createIdleAnimation() // Loop
    })
  }

  private blink() {
    // Quick eye close-open
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scaleY: 0.1,
      duration: 100,
      yoyo: true,
      ease: 'Linear',
    })
  }

  aimLeft() {
    this.targetAngle = Math.max(
      this.targetAngle - 5,
      CHAMELEON_CONFIG.minAngle
    )
  }

  aimRight() {
    this.targetAngle = Math.min(
      this.targetAngle + 5,
      CHAMELEON_CONFIG.maxAngle
    )
  }

  aimAtPoint(x: number, y: number) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y)
    const angleInDegrees = Phaser.Math.RadToDeg(angle) - 90

    this.targetAngle = Phaser.Math.Clamp(
      angleInDegrees,
      CHAMELEON_CONFIG.minAngle,
      CHAMELEON_CONFIG.maxAngle
    )
  }

  shootTongue(scene: Phaser.Scene): boolean {
    const now = scene.time.now
    const timeSinceLast = now - this.lastTongueShot

    if (this.tongue || timeSinceLast < TONGUE_CONFIG.cooldownMs) {
      // Buffer this input for when cooldown ends
      this.inputBuffer = true
      return false
    }

    // Reset input buffer on successful shot
    this.inputBuffer = false

    this.tongue = new Tongue(scene, this.x, this.y, this.currentAngle)
    this.lastTongueShot = now
    this.setCoolingDown(true)

    return true
  }

  getTongue(): Tongue | null {
    return this.tongue
  }

  clearTongue() {
    this.tongue = null
  }

  getLastTongueTime(): number {
    return this.lastTongueShot
  }

  isCoolingDown(): boolean {
    const now = this.scene.time.now
    return now - this.lastTongueShot < TONGUE_CONFIG.cooldownMs
  }

  bufferInput() {
    this.inputBuffer = true
  }

  update(delta: number) {
    // Enhanced rotation with easing and velocity
    this.updateRotation(delta)
    this.updateAimingState()
    this.updateChameleonVisuals()

    // Check if cooldown ended and we have buffered input
    const now = this.scene.time.now
    if (
      this.inputBuffer &&
      this.tongue === null &&
      now - this.lastTongueShot >= TONGUE_CONFIG.cooldownMs
    ) {
      // Execute buffered shot
      this.shootTongue(this.scene)
    }

    if (this.tongue) {
      this.tongue.update(delta)
      if (this.tongue.isFinished()) {
        this.tongue.destroy()
        this.clearTongue()
        this.setCoolingDown(false)
      }
    }
  }

  private updateRotation(delta: number) {
    const angleDifference = this.targetAngle - this.currentAngle
    const absDifference = Math.abs(angleDifference)

    // Use Power2 easing for more responsiveness
    // Quick response at start, smooths out at end
    const easeAmount = this.calculateRotationEasing(absDifference)

    this.rotationVelocity = Phaser.Math.Linear(
      this.rotationVelocity,
      angleDifference * easeAmount,
      CHAMELEON_CONFIG.rotationDamping
    )

    // Apply velocity with frame-time independence
    const frameVelocity = (this.rotationVelocity * delta) / 16.67 // 60fps baseline
    this.currentAngle = Phaser.Math.Clamp(
      this.currentAngle + frameVelocity,
      CHAMELEON_CONFIG.minAngle,
      CHAMELEON_CONFIG.maxAngle
    )

    this.setRotation(Phaser.Math.DegToRad(this.currentAngle))
  }

  private calculateRotationEasing(angleDifference: number): number {
    // Power2 easing: start fast, slow down as we approach target
    // This creates a responsive feel while maintaining smoothness
    const normalized = Math.min(angleDifference / 90, 1)
    return 1 + normalized * normalized // Quadratic easing factor
  }

  private updateAimingState() {
    const isMoving = Math.abs(this.targetAngle - this.currentAngle) > 2
    if (isMoving !== this.aiming) {
      this.aiming = isMoving
      this.updateAimingVisuals()
      this.updateAimingIndicator()
    }
  }

  private updateAimingVisuals() {
    // Visual feedback for when player is actively aiming
    if (this.aiming) {
      this.setAlpha(1.0)
    } else {
      // Neutral stance
      this.setAlpha(0.95)
    }
  }

  private updateAimingIndicator() {
    if (!this.aiming) {
      // Fade out reticle
      this.scene.tweens.add({
        targets: this.aimingReticle,
        alpha: 0,
        duration: 200,
      })
      return
    }

    // Show reticle in direction we're aiming
    this.aimingReticle.clear()
    this.aimingReticle.setAlpha(0.5)

    // Draw small circle ahead of chameleon (direction of aim)
    const angleRad = Phaser.Math.DegToRad(this.currentAngle)
    const aimX = Math.cos(angleRad) * 150
    const aimY = Math.sin(angleRad) * 150

    this.aimingReticle.lineStyle(2, 0xf4c430, 0.8)
    this.aimingReticle.strokeCircle(aimX, aimY, 20)
  }

  private updateChameleonVisuals() {
    // Head tilts slightly when aiming at extreme angles
    const angleRatio = Math.abs(this.currentAngle) / 90
    const tiltAmount = angleRatio * 5 // Max 5 degree tilt

    // Small head tilt for personality (optional visual enhancement)
    if (this.data) {
      this.data.set('headTilt', tiltAmount)
    }
  }

  private setCoolingDown(cooling: boolean) {
    if (cooling) {
      // Visual indication of cooldown: eyes change to thinking expression
      this.setExpression('thinking')

      // Add cooldown ring around chameleon
      this.createCooldownIndicator()
    } else {
      this.setExpression('neutral')
      this.removeCooldownIndicator()
    }
  }

  private createCooldownIndicator() {
    if (!this.cooldownIndicator) {
      this.cooldownIndicator = this.scene.add.graphics()
      this.add(this.cooldownIndicator)
    }

    this.cooldownIndicator.clear()
    this.cooldownIndicator.lineStyle(3, 0xf4a6c6, 0.6)
    this.cooldownIndicator.strokeCircle(0, 0, 65)

    // Pulsing effect during cooldown
    this.scene.tweens.add({
      targets: this.cooldownIndicator,
      alpha: { from: 0.6, to: 0.2 },
      duration: TONGUE_CONFIG.cooldownMs,
      ease: 'Sine.easeInOut',
    })
  }

  private removeCooldownIndicator() {
    if (this.cooldownIndicator) {
      this.cooldownIndicator.destroy()
      this.cooldownIndicator = null
    }
  }

  // Expression system
  setExpression(expression: 'neutral' | 'happy' | 'sad' | 'thinking') {
    if (this.expression === expression) return

    this.expression = expression
    this.updateExpression(expression)
  }

  private updateExpression(expression: string) {
    switch (expression) {
      case 'neutral':
        this.applyNeutralExpression()
        break
      case 'happy':
        this.applyHappyExpression()
        break
      case 'sad':
        this.applySadExpression()
        break
      case 'thinking':
        this.applyThinkingExpression()
        break
    }
  }

  private applyNeutralExpression() {
    // Default state: calm, ready
    // Eyes: normal size, forward looking
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scale: 1.0,
      duration: FEEL_CONFIG.EXPRESSION_TRANSITION_TIME,
    })

    // Reset rotation
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      rotation: 0,
      duration: FEEL_CONFIG.EXPRESSION_TRANSITION_TIME,
    })
  }

  private applyHappyExpression() {
    // Used when: catching correct insect, positive feedback
    // Eyes: wider, slight squint (happy muscles)
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scale: 1.2,
      duration: 150,
      ease: 'Quad.easeOut',
    })

    // Mouth hint (slight brightness boost)
    this.scene.tweens.add({
      targets: this,
      alpha: 1.05,
      duration: 150,
      yoyo: true,
    })
  }

  private applySadExpression() {
    // Used when: missing question, wrong answer
    // Eyes: sad angle, droopy
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scale: 0.85,
      duration: 250,
      ease: 'Quad.easeOut',
    })

    // Slight head droop
    this.scene.tweens.add({
      targets: this,
      y: this.y + 10,
      duration: 250,
      yoyo: true,
      ease: 'Sine.easeInOut',
    })
  }

  private applyThinkingExpression() {
    // Used when: considering answer, cooldown active
    // Eyes: one eye squinted (thinking pose)
    this.scene.tweens.add({
      targets: this.rightEye,
      scale: 0.6,
      duration: 300,
      ease: 'Quad.easeInOut',
    })

    this.scene.tweens.add({
      targets: this.leftEye,
      scale: 1.1,
      duration: 300,
      ease: 'Quad.easeInOut',
    })
  }
}
