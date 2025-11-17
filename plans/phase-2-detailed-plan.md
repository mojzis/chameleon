# Phase 2: Chameleon & Tongue Mechanic - Detailed Implementation Plan

**Scope:** Build the core mechanics that make the game feel responsive and satisfying  
**Duration:** Estimated 2-3 weeks  
**Priority:** This is the heart of the game - make it *feel great*

## Overview

Phase 2 focuses on refining the chameleon rotation and tongue shooting mechanic to create an engaging, snappy feel. The goal is to make players *want* to shoot their tongue repeatedly because it feels so good. Every frame counts for responsiveness.

Current state:
- Chameleon renders as green circle with eye
- Tongue extends/retracts with basic animation
- Input handling exists but is basic
- No visual feedback for aiming or state changes

Target outcome:
- Smooth, predictable rotation that responds instantly to input
- Snappy tongue extension that *feels* fast and responsive
- Visual feedback that communicates state (idle, aiming, cooldown)
- Polish that makes the mechanic feel game-like, not prototype-like

---

## 1. Enhanced Chameleon Class Features

### 1.1 Improved Rotation Interpolation

**Current Issue:** Linear interpolation at 0.1 speed is smooth but lacks personality. It should feel more responsive while maintaining smoothness.

**Implementation:**

```typescript
// src/game/objects/Chameleon.ts

export class Chameleon extends Phaser.GameObjects.Container {
  private currentAngle: number = 0
  private targetAngle: number = 0
  private rotationVelocity: number = 0
  private tongue: Tongue | null = null
  private lastTongueShot: number = 0
  private expression: 'neutral' | 'happy' | 'sad' | 'thinking' = 'neutral'

  // Animation states
  private aiming: boolean = false
  private coolingDown: boolean = false

  update(delta: number) {
    // Enhanced rotation with easing and velocity
    this.updateRotation(delta)
    this.updateAimingState()
    this.updateChameleonVisuals()

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
      0.15  // Damping factor (increased from 0.1 for snappier feel)
    )

    // Apply velocity with frame-time independence
    const frameVelocity = (this.rotationVelocity * delta) / 16.67  // 60fps baseline
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
    }
  }

  private updateAimingVisuals() {
    // Visual feedback for when player is actively aiming
    if (this.aiming) {
      this.setAlpha(1.0)
      // Eyes dilate slightly (handled in expression system)
      this.updateExpression(this.expression)
    } else {
      // Neutral stance
      this.setAlpha(0.95)
    }
  }

  private updateChameleonVisuals() {
    // Head tilts slightly when aiming at extreme angles
    const angleRatio = Math.abs(this.currentAngle) / 90
    const tiltAmount = angleRatio * 5  // Max 5 degree tilt
    
    // Small head tilt for personality (optional visual enhancement)
    if (this.data) {
      this.data.set('headTilt', tiltAmount)
    }
  }
}
```

**Key Changes:**
- Replace linear interpolation with velocity-based easing
- Angle difference-based acceleration (respond faster to larger inputs)
- Frame-time independent movement (works at any FPS)
- Aiming state detection for visual feedback

**Config Updates:**
```typescript
export const CHAMELEON_CONFIG = {
  startX: 960,
  startY: 950,
  scale: 1,
  minAngle: -90,
  maxAngle: 90,
  rotationSpeed: 0.15,        // Increased from 0.1
  rotationDamping: 0.15,      // New: velocity damping
  maxRotationVelocity: 180,   // New: max degrees per frame
} as const
```

---

### 1.2 Expression System

**Current Issue:** Chameleon is static. Expressions add personality and help players understand game state.

**Implementation:**

```typescript
// src/game/objects/Chameleon.ts - Expression System

private expressions: {
  neutral: () => void
  happy: () => void
  sad: () => void
  thinking: () => void
} = {
  neutral: () => this.applyNeutralExpression(),
  happy: () => this.applyHappyExpression(),
  sad: () => this.applySadExpression(),
  thinking: () => this.applyThinkingExpression(),
}

setExpression(expression: 'neutral' | 'happy' | 'sad' | 'thinking') {
  if (this.expression === expression) return
  
  this.expression = expression
  this.updateExpression(expression)
}

private updateExpression(expression: string) {
  if (this.expressions[expression as keyof typeof this.expressions]) {
    this.expressions[expression as keyof typeof this.expressions]()
  }
}

private applyNeutralExpression() {
  // Default state: calm, ready
  // Eyes: normal size, forward looking
  this.tweens.add({
    targets: [this.leftEye, this.rightEye],
    scale: 1.0,
    duration: 200,
  })
  
  // Eyelid position (optional, adds detail)
  this.setData('eyeOpenness', 1.0)
}

private applyHappyExpression() {
  // Used when: catching correct insect, positive feedback
  // Eyes: wider, slight squint (happy muscles)
  this.tweens.add({
    targets: [this.leftEye, this.rightEye],
    scale: 1.2,
    duration: 150,
    ease: 'Quad.easeOut',
  })
  
  // Mouth hint (can be subtle circle deformation)
  this.tweens.add({
    targets: this,
    alpha: 1.05,  // Slight brightness boost
    duration: 150,
  })
  
  this.setData('mouthSmile', true)
}

private applySadExpression() {
  // Used when: missing question, wrong answer
  // Eyes: sad angle, droopy
  this.tweens.add({
    targets: [this.leftEye, this.rightEye],
    scale: 0.85,
    duration: 250,
    ease: 'Quad.easeOut',
  })
  
  // Slight head droop
  this.tweens.add({
    targets: this,
    y: this.y + 10,
    duration: 250,
    yoyo: true,
    ease: 'Sine.easeInOut',
  })
  
  this.setData('eyeOpenness', 0.7)
}

private applyThinkingExpression() {
  // Used when: considering answer, cooldown active
  // Eyes: one eye squinted (thinking pose)
  // Right eye squints more
  this.tweens.add({
    targets: this.rightEye,
    scale: 0.6,
    duration: 300,
    ease: 'Quad.easeInOut',
  })
  
  this.tweens.add({
    targets: this.leftEye,
    scale: 1.1,
    duration: 300,
    ease: 'Quad.easeInOut',
  })
  
  // Head tilt (thinking pose)
  this.tweens.add({
    targets: this,
    rotation: 0.1,
    duration: 300,
    ease: 'Quad.easeInOut',
  })
}
```

**Visual Structure:**

For now, use procedurally-generated expressions with basic graphics:

```typescript
private createExpressionGraphics() {
  // Create head groups
  this.headContainer = this.scene.add.container(0, 0)
  this.add(this.headContainer)

  // Main head (green circle)
  this.head = this.scene.add.circle(0, 0, 50, 0x7BC8A0)
  this.headContainer.add(this.head)

  // Left eye
  this.leftEyeWhite = this.scene.add.circle(-20, -10, 12, 0xFFFFFF)
  this.leftEye = this.scene.add.circle(-20, -10, 8, 0x2C3E50)
  this.headContainer.add(this.leftEyeWhite)
  this.headContainer.add(this.leftEye)

  // Right eye
  this.rightEyeWhite = this.scene.add.circle(20, -10, 12, 0xFFFFFF)
  this.rightEye = this.scene.add.circle(20, -10, 8, 0x2C3E50)
  this.headContainer.add(this.rightEyeWhite)
  this.headContainer.add(this.rightEye)

  // Eye shine (highlights for personality)
  this.leftEyeShine = this.scene.add.circle(-18, -12, 3, 0xFFFFFF, 0.6)
  this.rightEyeShine = this.scene.add.circle(22, -12, 3, 0xFFFFFF, 0.6)
  this.headContainer.add(this.leftEyeShine)
  this.headContainer.add(this.rightEyeShine)
}
```

**Expression Behavior Triggers:**

| State | Trigger | Duration | Animation |
|-------|---------|----------|-----------|
| `neutral` | Game start, between questions | Instant | Eyes return to normal |
| `happy` | Insect caught (correct) | 400ms | Eyes widen, brightness pulse |
| `sad` | Wrong answer or miss | 250ms | Eyes close, head droops |
| `thinking` | Cooldown active, waiting | Loops while cooling | One eye squints, head tilts |

---

### 1.3 Visual Feedback for Aiming State

**Current Issue:** Players can't tell if they're aiming or if tongue is on cooldown.

**Implementation:**

```typescript
// src/game/objects/Chameleon.ts - Visual Feedback

private createAimingIndicator() {
  // Subtle targeting reticle that appears while aiming
  this.aimingReticle = this.scene.add.graphics()
  this.add(this.aimingReticle)
  this.aimingReticle.setAlpha(0)
}

private updateAimingIndicator() {
  if (!this.aiming) {
    // Fade out reticle
    this.tweens.add({
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

  this.aimingReticle.lineStyle(2, 0xF4C430, 0.8)
  this.aimingReticle.strokeCircle(aimX, aimY, 20)
}

private setCoolingDown(cooling: boolean) {
  this.coolingDown = cooling
  
  if (cooling) {
    // Visual indication of cooldown: eyes change to thinking expression
    this.setExpression('thinking')
    
    // Optional: Add cooldown ring around chameleon
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
  this.cooldownIndicator.lineStyle(3, 0xF4A6C6, 0.6)
  this.cooldownIndicator.strokeCircle(0, 0, 65)
  
  // Pulsing effect during cooldown
  this.tweens.add({
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
```

---

## 2. Enhanced Tongue Mechanics

### 2.1 Snappy Extension Animation

**Current Issue:** Tongue feels mechanical. It should feel like a snappy action - extension should be quick and satisfying.

**Implementation:**

```typescript
// src/game/objects/Tongue.ts - Enhanced Animation

export class Tongue extends Phaser.GameObjects.Graphics {
  private startX: number
  private startY: number
  private tongueAngle: number
  private currentLength: number = 0
  private maxLength: number = TONGUE_CONFIG.maxLength
  private extending: boolean = true
  private finished: boolean = false

  // Animation curve
  private extensionStartTime: number = 0
  private extensionDuration: number = 200  // ms - should feel snappy
  private peakReachedAt: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    super(scene)
    this.startX = x
    this.startY = y
    this.tongueAngle = angle
    this.extensionStartTime = scene.time.now

    scene.add.existing(this)

    // Emit sound on shoot (will use actual audio in Phase 10)
    this.onTongueShot()
  }

  update(delta: number) {
    const elapsedTime = this.scene.time.now - this.extensionStartTime

    if (this.extending) {
      this.updateExtension(elapsedTime)
    } else {
      this.updateRetraction(delta)
    }

    this.drawTongue()
  }

  private updateExtension(elapsedTime: number) {
    // Use easing curve for snappy feel
    // Fast extension using Power2 easing
    const progress = Math.min(elapsedTime / this.extensionDuration, 1)

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

  private updateRetraction(delta: number) {
    // Physics-based retraction: decelerating curve
    const timeSincePeak = this.scene.time.now - this.peakReachedAt

    // Use sine curve for smooth deceleration
    const retractionProgress = Math.min(
      timeSincePeak / TONGUE_CONFIG.retractionDuration,
      1
    )

    // Sine.easeIn: starts slow, accelerates
    const eased = Math.sin(retractionProgress * Math.PI / 2)
    this.currentLength = this.maxLength * (1.05 - eased * 1.05)

    if (retractionProgress >= 1) {
      this.finished = true
    }
  }

  private onTongueShot() {
    // Placeholder for sound effect
    // Will add actual audio in Phase 10
    // this.scene.sound.play('tongue-shoot', { volume: 0.7 })
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
      this.startX, this.startY,
      this.startX + (endX - this.startX) * 0.8,
      this.startY + (endY - this.startY) * 0.8,
      baseWidth,
      baseWidth
    )

    // Segment from 80% to tip (tapered)
    this.drawTongueSegment(
      this.startX + (endX - this.startX) * 0.8,
      this.startY + (endY - this.startY) * 0.8,
      endX,
      endY,
      baseWidth,
      tipWidth
    )

    // Draw sticky tip with glow
    this.drawStickeyTip(endX, endY)
  }

  private drawTongueSegment(x1: number, y1: number, x2: number, y2: number, width1: number, width2: number) {
    this.lineStyle(width1, 0xF4A6C6, 1)
    this.beginPath()
    this.moveTo(x1, y1)
    this.lineTo(x2, y2)
    this.strokePath()

    if (width2 < width1) {
      // Optional: add tapered appearance
      this.lineStyle(width2, 0xF4A6C6, 0.8)
      this.beginPath()
      this.moveTo(x2, y2)
      this.lineTo(x2, y2)
      this.strokePath()
    }
  }

  private drawStickeyTip(x: number, y: number) {
    // Main sticky tip
    this.fillStyle(0xF4A6C6, 1)
    this.fillCircle(x, y, TONGUE_CONFIG.tipRadius)

    // Glow effect (slightly larger, more transparent)
    this.fillStyle(0xF4A6C6, 0.3)
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
}
```

**Updated Config:**

```typescript
export const TONGUE_CONFIG = {
  maxLength: 400,
  extensionDuration: 200,      // ms (snappy!)
  retractionDuration: 300,     // ms (slightly slower than extension)
  cooldownMs: 1000,
  tipRadius: 12,
  baseTaperRatio: 0.8,         // Where taper starts (80% down tongue)
} as const
```

---

### 2.2 Cooldown Visual Feedback

**Current Issue:** Players can't tell when they can shoot again without trying. Cooldown needs clear visual indication.

**Implementation:**

```typescript
// src/game/scenes/MainScene.ts - Cooldown UI

private createCooldownUI() {
  // Cooldown indicator below chameleon
  this.cooldownText = this.add.text(
    GAME_CONFIG_BOUNDS.centerX,
    CHAMELEON_CONFIG.startY + 80,
    'Ready',
    {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '16px',
      color: '#A8E0C8',
      align: 'center',
    }
  )
  this.cooldownText.setOrigin(0.5)
  this.cooldownText.setAlpha(0.7)

  // Cooldown ring (visual indicator)
  this.cooldownRing = this.add.graphics()
  this.drawCooldownRing(1.0)
}

private updateCooldown() {
  const chameleon = this.chameleon
  const now = this.scene.time.now
  const timeSinceLast = now - chameleon.getLastTongueTime()
  const cooldownRemaining = Math.max(
    0,
    TONGUE_CONFIG.cooldownMs - timeSinceLast
  )

  if (cooldownRemaining > 0) {
    // Still cooling down
    const cooldownPercent = 1 - (cooldownRemaining / TONGUE_CONFIG.cooldownMs)
    
    // Update text
    this.cooldownText.setText(
      `${(cooldownRemaining / 1000).toFixed(1)}s`
    )
    this.cooldownText.setAlpha(0.7)

    // Update ring (progress indicator)
    this.drawCooldownRing(cooldownPercent)
  } else {
    // Ready to shoot
    this.cooldownText.setText('Ready!')
    this.cooldownText.setAlpha(1.0)
    this.drawCooldownRing(1.0)
  }
}

private drawCooldownRing(progress: number) {
  this.cooldownRing.clear()

  const ringX = GAME_CONFIG_BOUNDS.centerX
  const ringY = CHAMELEON_CONFIG.startY + 80
  const ringRadius = 45

  // Background ring (unfilled)
  this.cooldownRing.lineStyle(4, 0xE8F4F8, 0.3)
  this.cooldownRing.strokeCircle(ringX, ringY, ringRadius)

  // Progress ring (filled)
  this.cooldownRing.lineStyle(4, 0xF4A6C6, 0.8)

  // Only draw the progress arc
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (Math.PI * 2 * progress)

  // Approximate arc with lines for Phaser Graphics
  const segments = 32
  const step = (endAngle - startAngle) / segments

  this.cooldownRing.beginPath()
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + step * i
    const x = ringX + ringRadius * Math.cos(angle)
    const y = ringY + ringRadius * Math.sin(angle)
    
    if (i === 0) {
      this.cooldownRing.moveTo(x, y)
    } else {
      this.cooldownRing.lineTo(x, y)
    }
  }
  this.cooldownRing.strokePath()
}
```

---

## 3. Input Refinement

### 3.1 Smooth Mouse Tracking

**Current Issue:** Mouse aiming can feel jittery if not properly smoothed. Players need predictable aiming.

**Implementation:**

```typescript
// src/game/scenes/MainScene.ts

private mouseTrackingEnabled: boolean = true
private lastMouseX: number = 960
private lastMouseY: number = 540

private setupInput() {
  // Keyboard input
  if (this.input.keyboard) {
    this.input.keyboard.on('keydown-LEFT', () => {
      this.chameleon.aimLeft()
    })

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.chameleon.aimRight()
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.chameleon.isCoolingDown()) {
        this.chameleon.shootTongue(this)
      }
    })

    // Pause functionality
    this.input.keyboard.on('keydown-P', () => {
      this.togglePause()
    })
  }

  // Mouse input with smoothing
  this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    this.lastMouseX = pointer.x
    this.lastMouseY = pointer.y

    if (this.mouseTrackingEnabled) {
      // Smooth aim tracking (use interpolated position)
      this.chameleon.aimAtPoint(pointer.x, pointer.y)
    }
  })

  this.input.on('pointerdown', () => {
    if (!this.chameleon.isCoolingDown()) {
      this.chameleon.shootTongue(this)
    }
  })

  // Disable mouse tracking during cooldown (optional, feels smoother)
  this.events.on('cooldownStart', () => {
    this.mouseTrackingEnabled = false
  })

  this.events.on('cooldownEnd', () => {
    this.mouseTrackingEnabled = true
  })
}
```

---

### 3.2 Keyboard Rotation Acceleration

**Current Issue:** Keyboard input is discrete (on/off). Players want responsive, accelerating rotation when holding keys.

**Implementation:**

```typescript
// src/game/scenes/MainScene.ts - Keyboard Rotation with Acceleration

private keyboardState = {
  leftPressed: false,
  rightPressed: false,
  rotationAcceleration: 0,  // degrees/frame
}

private setupInput() {
  if (this.input.keyboard) {
    // Key down events
    this.input.keyboard.on('keydown-LEFT', () => {
      this.keyboardState.leftPressed = true
    })

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.keyboardState.rightPressed = true
    })

    // Key up events
    this.input.keyboard.on('keyup-LEFT', () => {
      this.keyboardState.leftPressed = false
    })

    this.input.keyboard.on('keyup-RIGHT', () => {
      this.keyboardState.rightPressed = false
    })

    // Space to shoot
    this.input.keyboard.on('keydown-SPACE', () => {
      this.chameleon.shootTongue(this)
    })
  }

  // ... mouse input ...
}

update(time: number, delta: number) {
  // Handle continuous keyboard rotation
  this.updateKeyboardRotation()

  // Update chameleon
  this.chameleon.update(delta)

  // Update cooldown UI
  this.updateCooldownUI()
}

private updateKeyboardRotation() {
  if (this.keyboardState.leftPressed) {
    this.chameleon.aimLeft()
  }

  if (this.keyboardState.rightPressed) {
    this.chameleon.aimRight()
  }

  // If both pressed, no rotation (cancel out)
  if (this.keyboardState.leftPressed && this.keyboardState.rightPressed) {
    // Neutral, no change
  }
}
```

---

### 3.3 Input Buffering During Cooldown

**Current Issue:** Players mash spacebar; inputs get lost. Buffering allows "smooth" continuous shooting.

**Implementation:**

```typescript
// src/game/objects/Chameleon.ts - Input Buffering

private inputBuffer: boolean = false
private cooldownStartTime: number = 0

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

update(delta: number) {
  // ... rotation updates ...

  // Check if cooldown ended and we have buffered input
  const now = this.scene.time.now
  if (
    this.inputBuffer &&
    this.tongue === null &&
    (now - this.lastTongueShot) >= TONGUE_CONFIG.cooldownMs
  ) {
    // Execute buffered shot
    this.shootTongue(this.scene)
  }

  // ... tongue updates ...
}

// Allow setting input buffer from outside
bufferInput() {
  this.inputBuffer = true
}
```

---

### 3.4 Accessibility Considerations

**Current Issue:** Game requires mouse or keyboard. Some players need alternatives.

**Implementation:**

```typescript
// src/game/managers/InputManager.ts - Accessibility Layer

export class InputManager {
  private scene: Phaser.Scene
  private inputMode: 'mouse' | 'keyboard' | 'gamepad' | 'touch' = 'mouse'
  private gamepadConnected: boolean = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.detectInputMode()
  }

  private detectInputMode() {
    // Check for gamepad support
    this.scene.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepadConnected = true
      this.inputMode = 'gamepad'
    })

    // Check for touch
    this.scene.input.on('pointerdown', () => {
      if (this.scene.input.pointer1.isDown) {
        this.inputMode = 'touch'
      }
    })
  }

  setupGamepadInput(chameleon: Chameleon) {
    const pad = this.scene.input.gamepad.pad1

    if (!pad) return

    // Left stick for aiming
    const threshold = 0.2

    if (Math.abs(pad.leftStick.x) > threshold) {
      const aimAmount = pad.leftStick.x * 10  // Scale to rotation speed
      chameleon.aimByAmount(aimAmount)
    }

    // A button to shoot
    if (pad.A) {
      chameleon.shootTongue(this.scene)
    }
  }

  setupTouchInput(chameleon: Chameleon) {
    // For mobile: tap position to aim, second tap to shoot
    // Or: continuous finger position for aiming, tap to shoot
  }
}
```

**Keyboard-Only Mode:**
- Arrow keys for rotation (continuous while held)
- Space for shooting
- H for help
- P for pause
- No mouse required

**Gamepad Support:**
- Left stick for rotation
- A button for shoot
- X button for help

**Touch/Mobile:**
- Tap screen position to aim
- Double-tap or separate shoot button to shoot

---

## 4. Feel and Polish

### 4.1 Timing Adjustments for Snappiness

**The key to great feel is timing.** Every millisecond counts.

```typescript
// src/game/config.ts

export const FEEL_CONFIG = {
  // Tongue timing (ms)
  TONGUE_EXTENSION_TIME: 180,      // Snappy! (was 200)
  TONGUE_RETRACTION_TIME: 250,     // Slightly slower
  TONGUE_COOLDOWN: 1000,           // 1 second between shots

  // Chameleon timing
  ROTATION_RESPONSE_TIME: 50,      // ms to reach 63% of target (e-time constant)
  EXPRESSION_TRANSITION_TIME: 200, // ms for expression changes
  COOLDOWN_INDICATOR_PULSE: 800,   // ms for cooldown ring pulse

  // Visual feedback timing
  IMPACT_SHAKE_DURATION: 100,      // ms
  IMPACT_FREEZE_FRAMES: 4,         // frames to pause on impact (60fps)
  PARTICLE_LIFETIME: 500,          // ms
} as const
```

**Rationale:**
- Tongue extension at 180ms feels "snappy" - fast enough to be satisfying, slow enough to see
- Extension/retraction duration combo (180/250) = 430ms total, feels good with 1000ms cooldown
- Rotation response at 50ms = 63.2% overshoot recovery (physics-based sweet spot)
- Expression transitions at 200ms = visible but not slow

---

### 4.2 Visual Juice (Polish Effects)

**Current Issue:** No feedback when tongue shoots. Players need screen impact.

**Implementation:**

```typescript
// src/game/objects/Tongue.ts + MainScene.ts

onTongueShot() {
  // Screenshake effect (subtle)
  this.scene.cameras.main.shake(100, 0.005)

  // Flash effect
  this.createImpactFlash()

  // Optional: particle effect
  this.createTongueParticles()

  // Sound effect (when Phase 10 adds audio)
  // this.scene.sound.play('tongue-shoot', { volume: 0.8 })
}

private createImpactFlash() {
  // Quick white flash when tongue shoots
  const flash = this.scene.add.graphics()
  flash.fillStyle(0xFFFFFF, 0.3)
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
      0xF4A6C6
    )

    this.scene.tweens.add({
      targets: particle,
      x: particle.x + Math.cos(angleRad + spread) * speed,
      y: particle.y + Math.sin(angleRad + spread) * speed,
      alpha: 0,
      scale: 0.5,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => particle.destroy(),
    })
  }
}
```

---

### 4.3 Audio Hooks (Prepare for Phase 10)

**Current Issue:** No audio, but code should be ready for Phase 10.

**Implementation:**

```typescript
// src/game/config.ts - Audio placeholders

export const AUDIO_HOOKS = {
  TONGUE_SHOOT: 'sound:tongue-shoot',    // Wet, snappy sound (0.2s)
  CATCH_CORRECT: 'sound:catch-correct',  // Warm chime (0.5s)
  CATCH_WRONG: 'sound:catch-wrong',      // Gentle curious tone (0.4s)
  COOLDOWN_TICK: 'sound:cooldown-tick',  // Subtle tick (0.1s)
  HELP_ACTIVATE: 'sound:help-activate',  // Magical sparkle (0.6s)
} as const

// In Chameleon.ts
private playSound(soundKey: string, volume: number = 0.8) {
  // Placeholder: will be activated in Phase 10
  // if (this.scene.sound.get(soundKey)) {
  //   this.scene.sound.play(soundKey, { volume })
  // }
}
```

---

### 4.4 Placeholder Visual Improvements

**Current Issue:** Green circle is bland. Make it charming even as placeholder.

**Implementation:**

```typescript
// src/game/objects/Chameleon.ts - Visual Polish

private createChameleonVisuals() {
  // Body: nicer shape (using arc/path)
  const head = this.scene.add.circle(0, 0, 50, 0x7BC8A0)
  head.setStrokeStyle(2, 0x5A9A80, 1)  // Darker outline for definition
  this.add(head)

  // Highlight for 3D effect
  const highlight = this.scene.add.circle(-15, -20, 12, 0xA8E0C8)
  highlight.setAlpha(0.6)
  this.add(highlight)

  // Eye sclera
  const leftWhite = this.scene.add.circle(-20, -10, 12, 0xFFFFFF)
  const rightWhite = this.scene.add.circle(20, -10, 12, 0xFFFFFF)
  this.add(leftWhite)
  this.add(rightWhite)

  // Iris
  this.leftEye = this.scene.add.circle(-20, -10, 7, 0x2C3E50)
  this.rightEye = this.scene.add.circle(20, -10, 7, 0x2C3E50)
  this.add(this.leftEye)
  this.add(this.rightEye)

  // Eye shine (super important for personality!)
  const leftShine = this.scene.add.circle(-18, -12, 2.5, 0xFFFFFF, 0.8)
  const rightShine = this.scene.add.circle(22, -12, 2.5, 0xFFFFFF, 0.8)
  this.add(leftShine)
  this.add(rightShine)

  // Mouth hint (small circle below)
  const mouth = this.scene.add.arc(0, 15, 8, 0, Math.PI, false, 0x5A9A80)
  mouth.setStrokeStyle(2, 0x5A9A80, 1)
  this.add(mouth)
}

// Add subtle idle animation
private createIdleAnimation() {
  // Eyes blink occasionally
  this.time.delayedCall(3000, () => {
    this.blink()
    this.createIdleAnimation()  // Loop
  })
}

private blink() {
  // Quick eye close-open
  this.tweens.add({
    targets: [this.leftEye, this.rightEye],
    scaleY: 0.1,
    duration: 100,
    yoyo: true,
    ease: 'Linear',
  })
}
```

---

## 5. Testing Criteria

### 5.1 Rotation Smoothness Tests

| Test | Criteria | Method |
|------|----------|--------|
| **Instant response** | Rotation starts within 16ms of input | Manual test: press arrow key, observe immediate angle change |
| **No jitter** | Rotation is smooth, not stuttering | Record 60fps video, check for frame-to-frame jitter |
| **Predictable easing** | Rotation follows consistent curve (Power2) | Plot angle vs time, verify against easing equation |
| **Full rotation range** | Can rotate from -90° to +90° smoothly | Rotate all the way left, then right, verify all angles reachable |
| **Velocity damping** | Rotation velocity decelerates smoothly | Stop giving input, verify angle smoothly stops changing |

**Test Implementation:**
```typescript
// src/game/debug/RotationAnalyzer.ts
export class RotationAnalyzer {
  private rotationHistory: Array<{time: number, angle: number}> = []

  recordFrame(time: number, angle: number) {
    this.rotationHistory.push({time, angle})
  }

  analyzeSmoothing(): {jitter: number, easing: string} {
    const deltas = []
    for (let i = 1; i < this.rotationHistory.length; i++) {
      const prev = this.rotationHistory[i - 1]
      const curr = this.rotationHistory[i]
      deltas.push({
        time: curr.time - prev.time,
        angleDelta: curr.angle - prev.angle,
      })
    }

    // Calculate jitter (standard deviation of angle deltas)
    const mean = deltas.reduce((sum, d) => sum + d.angleDelta, 0) / deltas.length
    const variance = deltas.reduce((sum, d) => sum + Math.pow(d.angleDelta - mean, 2), 0) / deltas.length
    const stdev = Math.sqrt(variance)

    return {
      jitter: stdev,
      easing: stdev < 0.5 ? 'smooth' : 'noticeable jitter',
    }
  }
}
```

---

### 5.2 Tongue Extension Timing Tests

| Test | Criteria | Method |
|------|----------|--------|
| **Extension speed** | Reaches max length in 180ms ± 20ms | Use Phaser timer, measure time from shot to full length |
| **Snappiness** | Initial acceleration is noticeable | Measure angle of initial curve (should be steep) |
| **Retraction speed** | Retracts in 250ms ± 20ms | Time from max length to destruction |
| **No overshooting** | Extension doesn't exceed maxLength by >10% | Check getTipX/getTipY at peak |
| **Smooth curve** | No visible "jerks" in extension/retraction | Visual inspection of recorded gameplay |

**Test Implementation:**
```typescript
// src/game/__tests__/objects/Tongue.timing.test.ts
describe('Tongue Timing', () => {
  it('extends to max length in ~180ms', () => {
    const scene = createTestScene()
    const tongue = new Tongue(scene, 960, 950, 0)
    
    let maxReached = false
    let timeToMax = 0
    
    for (let frame = 0; frame < 100; frame++) {
      tongue.update(16.67)
      
      if (!maxReached && tongue.getCurrentLength() >= 400) {
        timeToMax = frame * 16.67
        maxReached = true
        break
      }
    }
    
    expect(timeToMax).toBeLessThan(200)
    expect(timeToMax).toBeGreaterThan(160)
  })
})
```

---

### 5.3 Input Responsiveness Tests

| Test | Criteria | Method |
|------|----------|--------|
| **Keyboard response** | Rotation starts within 1 frame of key down | Check input polling order |
| **Mouse smoothness** | Mouse aim follows cursor without lag | Move mouse in circle, verify chameleon follows |
| **Input buffering** | Rapid clicks register as queued shots | Click rapidly during cooldown, verify shots fire in sequence |
| **No input loss** | No clicks or key presses are lost | Enable input logging, compare with user actions |

---

### 5.4 Feel/Juice Verification

| Test | Criteria | Method |
|------|----------|--------|
| **Satisfying feedback** | Sound/visual on shot feels good | Playtesting feedback: "does it feel snappy?" |
| **Cooldown clarity** | Player always knows when tongue is ready | Check if players accidentally shoot during cooldown |
| **Expression readability** | Expressions communicate state clearly | User testing: "can you tell when chameleon is waiting?" |
| **No visual lag** | Chameleon rotation matches input without delay | Frame-by-frame analysis of input to rotation |
| **Polish finish** | Game feels "done" not "prototype-y" | Subjective playtesting: professional polish level |

---

## 6. Implementation Checklist

### Phase 2A: Core Rotation (Week 1)
- [ ] Replace linear interpolation with velocity-based easing in Chameleon
- [ ] Add rotationVelocity and damping to config
- [ ] Test rotation smoothness (no jitter, responsive)
- [ ] Add aiming state detection
- [ ] Implement basic expression system (neutral state)
- [ ] Create aiming reticle visual indicator

### Phase 2B: Tongue Enhancement (Week 1-2)
- [ ] Update Tongue with proper easing curve (Power2.easeOut)
- [ ] Implement retraction with physics-based curve
- [ ] Add progressive width taper effect
- [ ] Implement sticky tip glow
- [ ] Add impact effects (screenshake, flash)
- [ ] Test tongue timing (extension 180ms, retraction 250ms)

### Phase 2C: Input & Feedback (Week 2)
- [ ] Implement continuous keyboard rotation
- [ ] Add input buffering system
- [ ] Create cooldown visual ring indicator
- [ ] Add cooldown text display
- [ ] Implement expression system (happy, sad, thinking)
- [ ] Set up audio hook placeholders

### Phase 2D: Polish & Testing (Week 2-3)
- [ ] Create particle effects for tongue shot
- [ ] Improve chameleon visuals (highlights, outline, shine)
- [ ] Add idle blink animation
- [ ] Implement screenshake utility
- [ ] Write and run timing tests
- [ ] Playtesting: feel and responsiveness

### Phase 2E: Accessibility & Edge Cases (Week 3)
- [ ] Add gamepad input support
- [ ] Add touch/mobile input support
- [ ] Handle edge cases (rapid input, pause during cooldown)
- [ ] Document input system
- [ ] Keyboard-only mode testing

---

## 7. Technical Debt & Future Improvements

### Known Limitations (Phase 2)
1. **No sprite art** - Using procedural graphics (acceptable for prototype)
2. **No collision detection** - Tongue doesn't interact with insects yet (Phase 4)
3. **No animation tweening** - Expressions use basic tweens (upgrade to timeline in Phase 3+)
4. **No performance optimization** - Object pooling deferred to Phase 3
5. **No audio** - Placeholders only (Phase 10)

### Quality of Life Improvements
- [ ] Add debug visualizer for rotation curve
- [ ] Add performance monitor (FPS, frame time)
- [ ] Add input logger for troubleshooting
- [ ] Create feel config presets (snappy, smooth, responsive)

---

## 8. Success Metrics

After Phase 2, the game should pass these feel tests:

1. **Playtester says: "That felt really good!"** when shooting tongue
2. **No input lag noticed** - Rotation responds immediately to keys/mouse
3. **Cooldown is clear** - Players always know when they can shoot
4. **Expression communicates state** - Happy on success, sad on miss, thinking on cooldown
5. **Tongue feels weighty** - Extension and retraction feel physics-based, not mechanical
6. **Screenshake/impact feedback** - Players feel the shot connect
7. **Rhythm emerges** - Shooting becomes rhythmic and satisfying

**Rejection Criteria (Fix These):**
- Rotation feels sluggish or delayed
- Tongue feels too slow or too fast
- Players can't tell when tongue is on cooldown
- Visual feedback is missing or confusing
- Expressions don't change appropriately
- Input feels laggy compared to other games

---

## 9. Code Organization

### File Structure After Phase 2

```
src/
├── game/
│   ├── objects/
│   │   ├── Chameleon.ts          (Enhanced: rotation, expressions, visuals)
│   │   ├── Tongue.ts             (Enhanced: easing, particles, juice)
│   │   ├── QuestionCard.ts        (No changes)
│   │   └── InsectCard.ts          (No changes)
│   ├── managers/
│   │   └── InputManager.ts        (NEW: keyboard, mouse, gamepad, touch)
│   ├── scenes/
│   │   └── MainScene.ts           (Enhanced: cooldown UI, input handling)
│   ├── debug/
│   │   ├── RotationAnalyzer.ts    (NEW: timing tests)
│   │   └── FeelDebugger.ts        (NEW: feel validation tools)
│   └── config.ts                  (Enhanced: feel config, audio hooks)
└── __tests__/
    └── objects/
        └── Tongue.timing.test.ts   (NEW: timing validation)
```

---

## 10. Quick Reference Commands

### Development Workflow

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Check for issues
npm run lint

# Type check
npm run type-check
```

### Key Modules to Update

1. `Chameleon.ts` - Main focus: rotation system, expressions
2. `Tongue.ts` - Enhanced: timing curves, visual effects
3. `MainScene.ts` - Add: cooldown UI, input handling
4. `config.ts` - Add: feel config, audio hooks
5. NEW `InputManager.ts` - Centralize input handling

---

## 11. Example: Complete Snappy Shot Feel

Here's how all the pieces work together for a satisfying shot:

```
1. Player presses SPACEBAR (or clicks)
   ↓
2. Chameleon.shootTongue() called
   ↓
3. New Tongue created, starting from chameleon mouth
   ↓
4. Screenshake effect (100ms, 0.005 intensity)
   ↓
5. Flash effect (white overlay fades in 100ms)
   ↓
6. Particle burst from mouth (5 particles spread in cone)
   ↓
7. Sound plays: wet, snappy "THWICK" sound (0.2s)  [Phase 10]
   ↓
8. Tongue extends over 180ms:
   - Power2.easeOut: starts fast, decelerates
   - Width gradually tapers
   - Sticky tip glows
   ↓
9. Tongue reaches max length (400px)
   ↓
10. Tongue retracts over 250ms:
    - Sine.easeIn: starts slow, accelerates
    - Recoil physics feel
    ↓
11. Chameleon enters cooldown state (1000ms)
    - Expression changes to 'thinking'
    - Cooldown ring appears and animates
    - "0.9s" text counts down
    ↓
12. When cooldown ends:
    - Expression returns to 'neutral'
    - "Ready!" text displays
    - Player can shoot again
    ↓
Total Time: 180ms (extend) + 250ms (retract) + 1000ms (cooldown) = 1430ms
```

This feels great because:
- **Instant feedback** (screenshake, flash, particles, sound)
- **Snappy timing** (180ms extension is perceivable but fast)
- **Physics-based** (recoil retraction with Sine.easeIn)
- **Clear readout** (cooldown timer and visual ring)
- **State feedback** (expression changes)

---

## 12. Appendix: Easing Functions Reference

**For Tongue Extension (Power2.easeOut):**
```
Progress: 0.0 → 1.0
Eased:    0.0 → 1.0
Formula:  eased = 1 - (1 - progress)²

Example values:
Progress 0.0 → Eased 0.0 (start)
Progress 0.25 → Eased 0.44 (43.75% of distance, but 44% easing = fast start)
Progress 0.5 → Eased 0.75 (75% of distance at halfway progress = accelerating)
Progress 0.75 → Eased 0.94 (almost done, decelerating now)
Progress 1.0 → Eased 1.0 (complete)
```

**For Tongue Retraction (Sine.easeIn):**
```
Progress: 0.0 → 1.0
Eased:    0.0 → 1.0
Formula:  eased = sin(progress * π / 2)

Example values:
Progress 0.0 → Eased 0.0 (start)
Progress 0.25 → Eased 0.38 (slower at start)
Progress 0.5 → Eased 0.71 (pickup)
Progress 0.75 → Eased 0.92 (accelerating)
Progress 1.0 → Eased 1.0 (complete, maximum speed)
```

These curves create the "snappy" feel:
- Extension: Fast start creates impact
- Retraction: Slow start then accelerates creates recoil feel

---

## 13. Next Phase Preview (Phase 3)

After Phase 2 is complete, Phase 3 will focus on:
- Falling question cards with readable text
- Insect cards with proper visual spacing
- Question/insect spawning system
- Gentle falling animation with sine-wave drift

The core mechanic (chameleon + tongue) will be **solid and fun to use** by then.

---

**Document Version:** 1.0  
**Status:** Ready for implementation  
**Estimated Hours:** 40-50 hours  
**Difficulty:** Medium (animation curves, easing, state management)  
**Priority:** Critical - Phase 2 determines if core game feel is good
