import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS, CHAMELEON_CONFIG, TONGUE_CONFIG } from '../config'
import { Chameleon } from '../objects/Chameleon'
import { QuestionCard } from '../objects/QuestionCard'
import { InsectCard } from '../objects/InsectCard'

export class MainScene extends Phaser.Scene {
  private chameleon!: Chameleon
  private currentLevel: number = 1
  private score: number = 0
  private strikes: number = 0
  private maxStrikes: number = 3

  // Placeholder for game objects
  private questionCards: QuestionCard[] = []
  private insectCards: InsectCard[] = []

  // UI elements
  private cooldownText!: Phaser.GameObjects.Text
  private cooldownRing!: Phaser.GameObjects.Graphics

  // Input state
  private keyboardState = {
    leftPressed: false,
    rightPressed: false,
  }
  private mouseTrackingEnabled: boolean = true

  constructor() {
    super({ key: 'MainScene' })
  }

  init(data: { level: number }) {
    this.currentLevel = data.level || 1
    this.score = 0
    this.strikes = 0
  }

  preload() {
    // Placeholder asset loading - will use actual images in Phase 2+
    // For now, we'll create colored rectangles in create()
  }

  create() {
    // Background
    this.createBackground()

    // Chameleon
    this.chameleon = new Chameleon(
      this,
      CHAMELEON_CONFIG.startX,
      CHAMELEON_CONFIG.startY
    )

    // Input handling
    this.setupInput()

    // UI text
    this.createUI()

    // Cooldown UI
    this.createCooldownUI()

    // Game loop
    this.time.delayedCall(2000, () => {
      this.spawnQuestionCard()
    })
  }

  private createBackground() {
    const graphics = this.add.graphics()
    graphics.fillStyle(0xa8d8ea, 1)
    graphics.fillRect(
      0,
      0,
      GAME_CONFIG_BOUNDS.width,
      GAME_CONFIG_BOUNDS.height
    )

    // Placeholder rainforest hint (light green layer at bottom)
    graphics.fillStyle(0xb8c8b0, 0.3)
    graphics.fillRect(
      0,
      GAME_CONFIG_BOUNDS.height - 200,
      GAME_CONFIG_BOUNDS.width,
      200
    )
  }

  private setupInput() {
    // Keyboard input (only if keyboard is available)
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
        if (!this.chameleon.isCoolingDown()) {
          this.chameleon.shootTongue(this)
        } else {
          // Buffer input if on cooldown
          this.chameleon.bufferInput()
        }
      })

      // Pause functionality (placeholder for Phase 6)
      this.input.keyboard.on('keydown-P', () => {
        // this.togglePause()
      })
    }

    // Mouse input with smoothing
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.mouseTrackingEnabled) {
        // Smooth aim tracking
        this.chameleon.aimAtPoint(pointer.x, pointer.y)
      }
    })

    this.input.on('pointerdown', () => {
      if (!this.chameleon.isCoolingDown()) {
        this.chameleon.shootTongue(this)
      } else {
        // Buffer input if on cooldown
        this.chameleon.bufferInput()
      }
    })
  }

  private createUI() {
    // Level display
    this.add.text(50, 30, `Level ${this.currentLevel}`, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '28px',
      color: '#2C3E50',
    })

    // Score display
    this.add.text(50, 80, `Score: ${this.score}`, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '24px',
      color: '#2C3E50',
    })

    // Strikes display
    this.add.text(
      GAME_CONFIG_BOUNDS.width - 200,
      30,
      `Strikes: ${this.strikes}/${this.maxStrikes}`,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '24px',
        color: '#2C3E50',
      }
    )
  }

  private createCooldownUI() {
    // Cooldown indicator below chameleon
    this.cooldownText = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      CHAMELEON_CONFIG.startY + 80,
      'Ready!',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '18px',
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

  private updateCooldownUI() {
    const now = this.time.now
    const timeSinceLast = now - this.chameleon.getLastTongueTime()
    const cooldownRemaining = Math.max(
      0,
      TONGUE_CONFIG.cooldownMs - timeSinceLast
    )

    if (cooldownRemaining > 0) {
      // Still cooling down
      const cooldownPercent =
        1 - cooldownRemaining / TONGUE_CONFIG.cooldownMs

      // Update text
      this.cooldownText.setText(`${(cooldownRemaining / 1000).toFixed(1)}s`)
      this.cooldownText.setAlpha(0.7)
      this.cooldownText.setColor('#F4A6C6')

      // Update ring (progress indicator)
      this.drawCooldownRing(cooldownPercent)
    } else {
      // Ready to shoot
      this.cooldownText.setText('Ready!')
      this.cooldownText.setAlpha(1.0)
      this.cooldownText.setColor('#A8E0C8')
      this.drawCooldownRing(1.0)
    }
  }

  private drawCooldownRing(progress: number) {
    this.cooldownRing.clear()

    const ringX = GAME_CONFIG_BOUNDS.centerX
    const ringY = CHAMELEON_CONFIG.startY + 80
    const ringRadius = 45

    // Background ring (unfilled)
    this.cooldownRing.lineStyle(4, 0xe8f4f8, 0.3)
    this.cooldownRing.strokeCircle(ringX, ringY, ringRadius)

    // Progress ring (filled)
    this.cooldownRing.lineStyle(4, 0xf4a6c6, 0.8)

    // Only draw the progress arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + Math.PI * 2 * progress

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

  private spawnQuestionCard() {
    const question = {
      id: 'placeholder-q1',
      text: 'Which insect has wings you can see through?',
    }

    const card = new QuestionCard(
      this,
      GAME_CONFIG_BOUNDS.centerX,
      100,
      question
    )

    this.questionCards.push(card)
  }

  private updateKeyboardRotation() {
    if (this.keyboardState.leftPressed) {
      this.chameleon.aimLeft()
    }

    if (this.keyboardState.rightPressed) {
      this.chameleon.aimRight()
    }

    // If both pressed, no rotation (cancel out)
    // Already handled by the above logic
  }

  update() {
    // Handle continuous keyboard rotation
    this.updateKeyboardRotation()

    // Update chameleon
    this.chameleon.update(this.game.loop.delta)

    // Update cooldown UI
    this.updateCooldownUI()

    // Update question cards (reverse iteration to safely remove items)
    for (let i = this.questionCards.length - 1; i >= 0; i--) {
      const card = this.questionCards[i]
      card.update(this.game.loop.delta)
      if (card.isOffScreen()) {
        this.questionCards.splice(i, 1)
      }
    }

    // Update insect cards (reverse iteration to safely remove items)
    for (let i = this.insectCards.length - 1; i >= 0; i--) {
      const card = this.insectCards[i]
      card.update(this.game.loop.delta)
      if (card.isOffScreenCheck()) {
        this.insectCards.splice(i, 1)
      }
    }
  }
}
