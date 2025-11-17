import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS, CHAMELEON_CONFIG, TONGUE_CONFIG } from '../config'
import { Chameleon } from '../objects/Chameleon'
import { SpawnManager } from '../managers/SpawnManager'
import { InsectCard } from '../objects/InsectCard'
import { HelpManager } from '../managers/HelpManager'
import { BackgroundLayer } from '../objects/BackgroundLayer'
import { PlaceholderAssets } from '../utils/PlaceholderAssets'
import { ScoreManager } from '../managers/ScoreManager'
import { LevelProgressManager } from '../managers/LevelProgressManager'
import { LEVELS } from '../../data/levels'
import { encyclopediaManager } from '../../App'

export class MainScene extends Phaser.Scene {
  private chameleon!: Chameleon
  private spawnManager!: SpawnManager
  private helpManager!: HelpManager
  private scoreManager!: ScoreManager
  private progressManager!: LevelProgressManager
  private currentLevel: number = 1
  private strikes: number = 0
  private maxStrikes: number = 3
  private questionsCompleted: number = 0
  private targetQuestions: number = 5 // Default, will be set by level config

  // Background layers
  private backgroundLayers: BackgroundLayer[] = []

  // UI elements
  private cooldownText!: Phaser.GameObjects.Text
  private cooldownRing!: Phaser.GameObjects.Graphics
  private scoreText!: Phaser.GameObjects.Text
  private strikesText!: Phaser.GameObjects.Text
  private helpText!: Phaser.GameObjects.Text

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
    this.strikes = 0
    this.questionsCompleted = 0

    // Get level config
    const levelConfig = LEVELS[this.currentLevel - 1]
    this.maxStrikes = levelConfig.strikes
    this.targetQuestions = levelConfig.insectCount * 2 // 2 questions per insect

    // Initialize managers
    this.helpManager = new HelpManager()
    this.scoreManager = new ScoreManager()
    this.progressManager = new LevelProgressManager()

    // Record that this level was played
    this.progressManager.recordLevelPlayed(this.currentLevel)

    // Emit initial help count for React overlay
    this.events.once('create', () => {
      this.events.emit('helpUpdate', this.helpManager.getHelpRemaining())
    })
  }

  preload() {
    // Generate placeholder assets if real images don't exist
    if (PlaceholderAssets.shouldGeneratePlaceholders(this)) {
      PlaceholderAssets.generateAll(this)
    }
    // Real images would be loaded here:
    // this.load.image('chameleon-head-neutral', 'assets/chameleon/chameleon-head-neutral.png')
    // etc.
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

    // Emit initial help count for React overlay
    this.events.emit('helpUpdate', this.helpManager.getHelpRemaining())
  }

  private createBackground() {
    // Layer 1: Sky gradient (static, depth 0)
    const skyLayer = new BackgroundLayer(
      this,
      'level-bg-sky',
      0, // No horizontal scroll
      0, // No vertical scroll
      0, // No float
      0,
      0 // Furthest back
    )
    this.backgroundLayers.push(skyLayer)

    // Layer 2: Distant canopy (slow parallax, depth 1)
    const distantCanopy = new BackgroundLayer(
      this,
      'level-bg-distant-canopy',
      0.1, // Very slow horizontal scroll
      0,
      5, // Gentle float
      0.3, // Slow frequency
      1
    )
    this.backgroundLayers.push(distantCanopy)

    // Layer 3: Mid-canopy (medium parallax, depth 2)
    const midCanopy = new BackgroundLayer(
      this,
      'level-bg-mid-canopy',
      0.3, // Medium horizontal scroll
      0,
      8, // More float
      0.5, // Medium frequency
      2
    )
    this.backgroundLayers.push(midCanopy)

    // Layer 4: Foreground vines (fast parallax, depth 3)
    const foreground = new BackgroundLayer(
      this,
      'level-bg-foreground',
      0.6, // Faster horizontal scroll
      0,
      10, // Even more float
      0.7, // Faster frequency
      3
    )
    this.backgroundLayers.push(foreground)

    // Layer 5: Forest floor (static at bottom, depth 4)
    const floor = this.add.tileSprite(
      GAME_CONFIG_BOUNDS.centerX,
      GAME_CONFIG_BOUNDS.height - 100,
      GAME_CONFIG_BOUNDS.width,
      200,
      'level-bg-floor'
    )
    floor.setOrigin(0.5, 0.5)
    floor.setDepth(4)

    // Add subtle particle effects
    this.createParticleEffects()
  }

  private createParticleEffects() {
    // Falling leaves effect
    const leafParticles = this.add.particles(0, 0, 'leaf-particle', {
      x: { min: 0, max: GAME_CONFIG_BOUNDS.width },
      y: -20,
      lifespan: 8000,
      speedY: { min: 20, max: 40 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.8, end: 0.4 },
      alpha: { start: 0.7, end: 0 },
      angle: { min: 0, max: 360 },
      rotate: { min: -180, max: 180 },
      frequency: 800, // One leaf every 800ms
      quantity: 1,
    })
    leafParticles.setDepth(5) // In front of background, behind game objects

    // Mist effect (very subtle)
    const mistParticles = this.add.particles(0, 0, 'mist-particle', {
      x: { min: 0, max: GAME_CONFIG_BOUNDS.width },
      y: { min: GAME_CONFIG_BOUNDS.height * 0.3, max: GAME_CONFIG_BOUNDS.height * 0.7 },
      lifespan: 12000,
      speedX: { min: -5, max: 5 },
      speedY: { min: -2, max: 2 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0, end: 0.15, ease: 'Sine.easeInOut' },
      frequency: 2000,
      quantity: 1,
    })
    mistParticles.setDepth(2) // Between background layers
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

      // Help key
      this.input.keyboard.on('keydown-H', () => {
        this.activateHelp()
      })

      // Encyclopedia key (ESC)
      this.input.keyboard.on('keydown-ESC', () => {
        window.dispatchEvent(new CustomEvent('openEncyclopedia'))
      })

      // Pause functionality (placeholder for future phase)
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
    this.scoreText = this.add.text(50, 80, `Score: ${this.scoreManager.getScore()}`, {
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

    // Help counter display
    this.helpText = this.add.text(
      GAME_CONFIG_BOUNDS.width - 200,
      80,
      `Help: ${this.helpManager.getHelpRemaining()}/3 (Press H)`,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '24px',
        color: '#F4C430',
      }
    )
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.scoreManager.getScore()}`)
    this.strikesText.setText(`Strikes: ${this.strikes}/${this.maxStrikes}`)
    this.helpText.setText(
      `Help: ${this.helpManager.getHelpRemaining()}/3 (Press H)`
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
    // Update background layers (parallax animation)
    this.backgroundLayers.forEach((layer) => {
      layer.update(this.game.loop.delta)
    })

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
    // Record correct answer with insect ID
    const insectData = insect.getInsectData()
    this.scoreManager.recordCorrect(insectData.id)
    this.scoreManager.recordQuestionAttempted()
    this.questionsCompleted++

    // Unlock insect in encyclopedia
    encyclopediaManager.unlockInsect(insectData.id)
    window.dispatchEvent(new CustomEvent('insectUnlocked', { detail: insectData.id }))

    this.updateUI()

    // Chameleon happy expression
    this.chameleon.setExpression('happy')

    // Celebration effect
    this.createCelebrationParticles()

    // Show fact overlay
    this.showFactOverlay(insect, true)

    // Check if level is complete (enough correct answers)
    this.checkLevelCompletion()
  }

  private onWrongAnswer(insect: InsectCard) {
    // Record incorrect answer with insect ID
    const insectData = insect.getInsectData()
    this.scoreManager.recordIncorrect(insectData.id)
    this.scoreManager.recordQuestionAttempted()

    // Unlock insect in encyclopedia (player still learns about it)
    encyclopediaManager.unlockInsect(insectData.id)
    window.dispatchEvent(new CustomEvent('insectUnlocked', { detail: insectData.id }))

    // Add strike
    this.strikes++
    this.updateUI()

    // Chameleon sad expression
    this.chameleon.setExpression('sad')

    // Show fact overlay with correct answer info
    this.showFactOverlay(insect, false)

    // Check if game over (too many strikes)
    if (this.strikes >= this.maxStrikes) {
      this.time.delayedCall(3000, () => {
        this.endLevel(false) // Failed
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

  // Public method so it can be called from React overlay
  public activateHelp() {
    // Don't allow help during fact display
    if (this.isShowingFact) {
      return
    }

    // Try to use help
    if (!this.helpManager.useHelp()) {
      // No help remaining - show feedback
      this.showNoHelpFeedback()
      return
    }

    // Record help usage in score manager
    this.scoreManager.recordHelpUsed()

    // Update UI to reflect help was used
    this.updateUI()

    // Emit event for React overlay
    this.events.emit('helpUpdate', this.helpManager.getHelpRemaining())

    // Find the correct insect from active insects
    const insectCards = this.spawnManager.getActiveInsectCards()
    const correctInsect = insectCards.find((card) => card.isCorrectAnswer())

    if (correctInsect) {
      // Show golden glow on correct answer
      correctInsect.showHelpGlow()

      // Chameleon thinking expression
      this.chameleon.setExpression('thinking')

      // Reset expression after a delay
      this.time.delayedCall(2000, () => {
        if (!this.isShowingFact) {
          this.chameleon.setExpression('neutral')
        }
      })

      // Show helpful text feedback
      this.showHelpFeedback()
    } else {
      // No active question - refund the help
      this.helpManager.resetLevel()
      this.helpManager.useHelp() // Re-use one to get back to previous state
      // This is a workaround - ideally we'd have a refund method
      // But for now, if there's no active question, player shouldn't lose help
      this.updateUI()
    }
  }

  private showHelpFeedback() {
    // Create temporary text feedback
    const feedbackText = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      150,
      'The glowing insect is the correct answer!',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '28px',
        color: '#F4C430',
        align: 'center',
        stroke: '#2C3E50',
        strokeThickness: 3,
      }
    )
    feedbackText.setOrigin(0.5)

    // Fade in
    feedbackText.setAlpha(0)
    this.tweens.add({
      targets: feedbackText,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    })

    // Fade out and destroy after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: feedbackText,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => feedbackText.destroy(),
      })
    })
  }

  private showNoHelpFeedback() {
    // Create temporary text feedback
    const feedbackText = this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      150,
      'No help remaining! (Recharges next level)',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '28px',
        color: '#F4A6C6',
        align: 'center',
        stroke: '#2C3E50',
        strokeThickness: 3,
      }
    )
    feedbackText.setOrigin(0.5)

    // Fade in
    feedbackText.setAlpha(0)
    this.tweens.add({
      targets: feedbackText,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    })

    // Fade out and destroy after 2 seconds
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: feedbackText,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => feedbackText.destroy(),
      })
    })
  }

  private checkLevelCompletion() {
    // Complete level if enough correct answers achieved
    const correctAnswers = this.scoreManager.getCorrectAnswers()
    if (correctAnswers >= this.targetQuestions) {
      // Delay to show last fact, then end level
      this.time.delayedCall(3000, () => {
        this.endLevel(true) // Completed successfully
      })
    }
  }

  private endLevel(completed: boolean) {
    // Stop spawning
    this.spawnManager.stop()

    // End score tracking
    this.scoreManager.endLevel()

    // Get final stats
    const stats = this.scoreManager.getStats()

    // Update progress manager if completed
    if (completed) {
      this.progressManager.completeLevel(
        this.currentLevel,
        stats.score,
        stats.accuracy,
        stats.insectsDiscovered.size > 0 ? Array.from(stats.insectsDiscovered) : [],
        stats.helpUsed
      )
    }

    // Transition to result scene
    this.scene.stop('MainScene')
    this.scene.start('ResultScene', {
      level: this.currentLevel,
      stats: stats,
      completed: completed,
      strikes: this.strikes,
      maxStrikes: this.maxStrikes,
    })
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
