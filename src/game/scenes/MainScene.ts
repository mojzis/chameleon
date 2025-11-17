import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS, CHAMELEON_CONFIG, TONGUE_CONFIG } from '../config'
import { Chameleon } from '../objects/Chameleon'
import { SpawnManager } from '../managers/SpawnManager'
import { InsectCard } from '../objects/InsectCard'

export class MainScene extends Phaser.Scene {
  private chameleon!: Chameleon
  private spawnManager!: SpawnManager
  private currentLevel: number = 1
  private score: number = 0
  private strikes: number = 0
  private maxStrikes: number = 3

  // UI elements
  private cooldownText!: Phaser.GameObjects.Text
  private cooldownRing!: Phaser.GameObjects.Graphics
  private scoreText!: Phaser.GameObjects.Text
  private strikesText!: Phaser.GameObjects.Text

  // Fact display overlay
  private factOverlay: Phaser.GameObjects.Container | null = null
  private isShowingFact: boolean = false

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

    // Initialize spawn manager
    this.spawnManager = new SpawnManager(this, this.currentLevel)

    // Start spawning questions and insects
    this.spawnManager.start()
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
    this.scoreText = this.add.text(50, 80, `Score: ${this.score}`, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '24px',
      color: '#2C3E50',
    })

    // Strikes display
    this.strikesText = this.add.text(
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

  private updateUI() {
    this.scoreText.setText(`Score: ${this.score}`)
    this.strikesText.setText(`Strikes: ${this.strikes}/${this.maxStrikes}`)
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
    // Don't update game state while showing fact overlay
    if (this.isShowingFact) {
      return
    }

    // Handle continuous keyboard rotation
    this.updateKeyboardRotation()

    // Update chameleon
    this.chameleon.update(this.game.loop.delta)

    // Update cooldown UI
    this.updateCooldownUI()

    // Check tongue collision with insects
    this.checkTongueCollision()

    // Check if tongue has returned with caught insect
    this.checkTongueReturnComplete()

    // Update spawn manager (handles question and insect updates)
    this.spawnManager.update()

    // Update all question cards
    const questionCards = this.spawnManager.getActiveQuestionCards()
    questionCards.forEach((card) => {
      card.update(this.game.loop.delta)
    })

    // Update all insect cards
    const insectCards = this.spawnManager.getActiveInsectCards()
    insectCards.forEach((card) => {
      card.update(this.game.loop.delta)
    })
  }

  shutdown() {
    // Clean up spawn manager
    if (this.spawnManager) {
      this.spawnManager.destroy()
    }
  }

  private checkTongueCollision() {
    const tongue = this.chameleon.getTongue()
    if (!tongue || !tongue.isExtending() || tongue.hasCaughtInsect()) {
      return
    }

    const tipX = tongue.getTipX()
    const tipY = tongue.getTipY()
    const tipRadius = tongue.getTipRadius()

    // Check collision with each insect
    const insectCards = this.spawnManager.getActiveInsectCards()
    for (const insect of insectCards) {
      if (insect.isCaughtByTongue()) continue

      const distance = Phaser.Math.Distance.Between(tipX, tipY, insect.x, insect.y)

      if (distance < tipRadius + 40) {
        // Collision detected!
        tongue.catchInsect(insect)
        break
      }
    }
  }

  private checkTongueReturnComplete() {
    const tongue = this.chameleon.getTongue()
    if (!tongue || !tongue.isFinished()) {
      return
    }

    const caughtInsect = tongue.getCaughtInsect()
    if (caughtInsect) {
      // Tongue returned with an insect
      this.onInsectCaught(caughtInsect)
    }
  }

  private onInsectCaught(insect: InsectCard) {
    // Let spawn manager handle cleanup
    this.spawnManager.onInsectCaught(insect)

    // Check if correct answer
    if (insect.isCorrectAnswer()) {
      this.onCorrectAnswer(insect)
    } else {
      this.onWrongAnswer(insect)
    }

    // Destroy the caught insect
    insect.destroy()
  }

  private onCorrectAnswer(insect: InsectCard) {
    // Update score
    this.score += 10
    this.updateUI()

    // Chameleon happy expression
    this.chameleon.setExpression('happy')

    // Celebration effect
    this.createCelebrationParticles()

    // Show fact overlay
    this.showFactOverlay(insect, true)
  }

  private onWrongAnswer(insect: InsectCard) {
    // Add strike
    this.strikes++
    this.updateUI()

    // Chameleon sad expression
    this.chameleon.setExpression('sad')

    // Show fact overlay with correct answer info
    this.showFactOverlay(insect, false)

    // Check if game over
    if (this.strikes >= this.maxStrikes) {
      this.time.delayedCall(3000, () => {
        this.scene.start('MenuScene')
      })
    }
  }

  private createCelebrationParticles() {
    const centerX = GAME_CONFIG_BOUNDS.centerX
    const centerY = GAME_CONFIG_BOUNDS.centerY

    // Burst of celebration particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = 150 + Math.random() * 100

      const particle = this.add.circle(
        centerX,
        centerY,
        4 + Math.random() * 4,
        0xa8e0c8
      )

      this.tweens.add({
        targets: particle,
        x: centerX + Math.cos(angle) * speed,
        y: centerY + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.5,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      })
    }
  }

  private showFactOverlay(insect: InsectCard, isCorrect: boolean) {
    this.isShowingFact = true

    // Pause spawning while showing fact
    this.spawnManager.stop()

    // Create overlay background
    const overlay = this.add.container(0, 0)

    // Semi-transparent background
    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.7)
    bg.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height)
    overlay.add(bg)

    // Content box
    const boxWidth = 800
    const boxHeight = 500
    const boxX = GAME_CONFIG_BOUNDS.centerX - boxWidth / 2
    const boxY = GAME_CONFIG_BOUNDS.centerY - boxHeight / 2

    const contentBox = this.add.graphics()
    contentBox.fillStyle(0xe8f4f8, 0.98)
    contentBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 16)
    contentBox.lineStyle(4, isCorrect ? 0xa8e0c8 : 0xf4c8a8, 1)
    contentBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 16)
    overlay.add(contentBox)

    // Title
    const titleText = isCorrect ? 'Correct!' : 'Oops!'
    const title = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      boxY + 50,
      titleText,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '48px',
        color: isCorrect ? '#7BC8A0' : '#F4A6C6',
        align: 'center',
      }
    )
    title.setOrigin(0.5)
    overlay.add(title)

    // Insect name
    const insectData = insect.getInsectData()
    const insectName = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      boxY + 120,
      insectData.commonName,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '32px',
        color: '#2C3E50',
        align: 'center',
      }
    )
    insectName.setOrigin(0.5)
    overlay.add(insectName)

    // Fact text - use first fact from insect data
    const factText = insectData.facts && insectData.facts.length > 0
      ? insectData.facts[0]
      : 'This insect is fascinating! Learn more about it as you progress through the game.'
    const fact = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      boxY + 200,
      factText,
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '20px',
        color: '#2C3E50',
        align: 'center',
        wordWrap: { width: boxWidth - 100 },
      }
    )
    fact.setOrigin(0.5)
    overlay.add(fact)

    // Continue prompt
    const continueText = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      boxY + boxHeight - 60,
      'Press SPACE or Click to continue',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '18px',
        color: '#7BA7BC',
        align: 'center',
      }
    )
    continueText.setOrigin(0.5)
    overlay.add(continueText)

    // Pulsing animation for continue text
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
    })

    this.factOverlay = overlay

    // Input to dismiss
    const dismissOverlay = () => {
      if (this.factOverlay) {
        this.factOverlay.destroy()
        this.factOverlay = null
      }
      this.isShowingFact = false
      this.chameleon.setExpression('neutral')

      // Resume spawning
      this.spawnManager.start()

      // Remove listeners
      this.input.off('pointerdown', dismissOverlay)
      if (this.input.keyboard) {
        this.input.keyboard.off('keydown-SPACE', dismissOverlay)
      }
    }

    this.input.once('pointerdown', dismissOverlay)
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', dismissOverlay)
    }
  }
}
