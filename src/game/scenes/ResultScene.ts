import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'
import { LevelStats } from '../managers/ScoreManager'
import { LEVELS } from '../../data/levels'
import { audioManager } from '../managers/AudioManager'

interface ResultSceneData {
  level: number
  stats: LevelStats
  completed: boolean
  strikes: number
  maxStrikes: number
}

export class ResultScene extends Phaser.Scene {
  private sceneData!: ResultSceneData

  constructor() {
    super({ key: 'ResultScene' })
  }

  init(data: ResultSceneData) {
    this.sceneData = data
  }

  create() {
    // Background gradient
    this.createBackground()

    const centerX = GAME_CONFIG_BOUNDS.centerX
    const startY = 80

    // Main title - shows if level was completed or failed
    const titleText = this.sceneData.completed ? '🎉 Level Complete!' : 'Try Again!'
    const titleColor = this.sceneData.completed ? '#7BC8A0' : '#F4A6C6'

    const title = this.add.text(centerX, startY, titleText, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '56px',
      color: titleColor,
      align: 'center',
    })
    title.setOrigin(0.5)

    // Level name
    const levelData = LEVELS[this.sceneData.level - 1]
    const levelName = this.add.text(
      centerX,
      startY + 80,
      `Level ${this.sceneData.level}: ${levelData.name}`,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '32px',
        color: '#2C3E50',
        align: 'center',
      }
    )
    levelName.setOrigin(0.5)

    // Stats container
    const statsY = startY + 160
    this.createStatsDisplay(centerX, statsY)

    // Buttons
    const buttonsY = GAME_CONFIG_BOUNDS.height - 180
    this.createButtons(centerX, buttonsY)

    // Add entrance animations
    this.tweens.add({
      targets: [title, levelName],
      alpha: { from: 0, to: 1 },
      y: { from: '-=30', to: '+=30' },
      duration: 600,
      ease: 'Back.easeOut',
    })
  }

  private createBackground() {
    const graphics = this.add.graphics()

    // Gradient background based on completion status
    if (this.sceneData.completed) {
      graphics.fillStyle(0xa8e0c8, 1) // Success green
      graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)
      graphics.fillStyle(0xe8f4f8, 1)
      graphics.fillRect(
        0,
        GAME_CONFIG_BOUNDS.height / 2,
        GAME_CONFIG_BOUNDS.width,
        GAME_CONFIG_BOUNDS.height / 2
      )
    } else {
      graphics.fillStyle(0xf4c8a8, 0.5) // Soft peach for failure
      graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)
      graphics.fillStyle(0xe8f4f8, 1)
      graphics.fillRect(
        0,
        GAME_CONFIG_BOUNDS.height / 2,
        GAME_CONFIG_BOUNDS.width,
        GAME_CONFIG_BOUNDS.height / 2
      )
    }
  }

  private createStatsDisplay(centerX: number, startY: number) {
    // Stats box
    const boxWidth = 700
    const boxHeight = 400
    const boxX = centerX - boxWidth / 2
    const boxY = startY - 20

    const statsBox = this.add.graphics()
    statsBox.fillStyle(0xffffff, 0.9)
    statsBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 16)
    statsBox.lineStyle(3, 0x7ba7bc, 1)
    statsBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 16)

    // Stats grid (2 columns)
    const col1X = centerX - 150
    const col2X = centerX + 150
    let currentY = startY + 30

    // Row 1: Score and Accuracy
    this.createStatItem(col1X, currentY, '📊 Score', this.sceneData.stats.score.toString())
    this.createStatItem(
      col2X,
      currentY,
      '🎯 Accuracy',
      `${Math.round(this.sceneData.stats.accuracy)}%`
    )

    currentY += 70

    // Row 2: Correct/Total and Duration
    this.createStatItem(
      col1X,
      currentY,
      '✅ Correct',
      `${this.sceneData.stats.correctAnswers}/${this.sceneData.stats.totalAnswers}`
    )
    this.createStatItem(
      col2X,
      currentY,
      '⏱️ Time',
      this.formatDuration(this.sceneData.stats.duration)
    )

    currentY += 70

    // Row 3: Insects Discovered and Help Used
    this.createStatItem(
      col1X,
      currentY,
      '🐛 Insects Found',
      this.sceneData.stats.insectsDiscovered.size.toString()
    )
    this.createStatItem(
      col2X,
      currentY,
      '💡 Help Used',
      `${this.sceneData.stats.helpUsed}/3`
    )

    currentY += 70

    // Row 4: Strikes (if failed)
    if (!this.sceneData.completed) {
      this.createStatItem(
        centerX,
        currentY,
        '❌ Strikes',
        `${this.sceneData.strikes}/${this.sceneData.maxStrikes}`,
        true
      )
    } else {
      // Show encouragement message
      const messages = [
        'Excellent work!',
        'Great job!',
        'Amazing!',
        'Fantastic!',
        'Well done!',
      ]
      const message = Phaser.Utils.Array.GetRandom(messages)
      const encouragement = this.add.text(centerX, currentY + 20, message, {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '28px',
        color: '#7BC8A0',
        align: 'center',
      })
      encouragement.setOrigin(0.5)
    }
  }

  private createStatItem(
    x: number,
    y: number,
    label: string,
    value: string,
    centered: boolean = false
  ) {
    const labelText = this.add.text(x, y, label, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '20px',
      color: '#5A6C7D',
      align: centered ? 'center' : 'left',
    })
    labelText.setOrigin(centered ? 0.5 : 0, 0)

    const valueText = this.add.text(x, y + 30, value, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '32px',
      color: '#2C3E50',
      align: centered ? 'center' : 'left',
    })
    valueText.setOrigin(centered ? 0.5 : 0, 0)

    // Animate stats in
    this.tweens.add({
      targets: [labelText, valueText],
      alpha: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
      duration: 400,
      delay: 200,
      ease: 'Back.easeOut',
    })
  }

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  private createButtons(centerX: number, y: number) {
    const buttonWidth = 280
    const buttonHeight = 70
    const buttonSpacing = 30

    // Calculate positions for 3 buttons
    const totalWidth = buttonWidth * 3 + buttonSpacing * 2
    const startX = centerX - totalWidth / 2 + buttonWidth / 2

    // Button 1: Retry Level
    this.createButton(
      startX,
      y,
      buttonWidth,
      buttonHeight,
      'Retry Level',
      0x7ba7bc,
      () => {
        this.scene.stop('ResultScene')
        this.scene.start('MainScene', { level: this.sceneData.level })
      }
    )

    // Button 2: Next Level (only if completed and not last level)
    if (this.sceneData.completed && this.sceneData.level < 5) {
      this.createButton(
        startX + buttonWidth + buttonSpacing,
        y,
        buttonWidth,
        buttonHeight,
        'Next Level',
        0x7bc8a0,
        () => {
          this.scene.stop('ResultScene')
          // Show intro for next level
          this.scene.start('LevelIntroScene', { level: this.sceneData.level + 1 })
        }
      )
    } else if (this.sceneData.completed && this.sceneData.level === 5) {
      // Last level completed - show special message
      this.createButton(
        startX + buttonWidth + buttonSpacing,
        y,
        buttonWidth,
        buttonHeight,
        'All Complete! 🎉',
        0xf4c430,
        () => {
          this.scene.stop('ResultScene')
          this.scene.start('LevelSelectScene')
        }
      )
    } else {
      // Failed - encourage to try again
      this.createButton(
        startX + buttonWidth + buttonSpacing,
        y,
        buttonWidth,
        buttonHeight,
        'Select Level',
        0x88b8a8,
        () => {
          this.scene.stop('ResultScene')
          this.scene.start('LevelSelectScene')
        }
      )
    }

    // Button 3: Level Select
    this.createButton(
      startX + (buttonWidth + buttonSpacing) * 2,
      y,
      buttonWidth,
      buttonHeight,
      'Level Select',
      0x5a6c7d,
      () => {
        this.scene.stop('ResultScene')
        this.scene.start('LevelSelectScene')
      }
    )
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    onClick: () => void
  ) {
    const button = this.add
      .rectangle(x, y, width, height, color)
      .setInteractive()
      .on('pointerdown', onClick)
      .on('pointerover', () => {
        // Brighten the button color slightly
        const r = (color >> 16) & 0xff
        const g = (color >> 8) & 0xff
        const b = color & 0xff
        const brightenedColor = Phaser.Display.Color.GetColor(
          Math.min(255, r + 20),
          Math.min(255, g + 20),
          Math.min(255, b + 20)
        )
        button.setFillStyle(brightenedColor)
        button.setScale(1.05)
        this.tweens.add({
          targets: button,
          scale: 1.05,
          duration: 100,
        })
      })
      .on('pointerout', () => {
        button.setFillStyle(color)
        this.tweens.add({
          targets: button,
          scale: 1,
          duration: 100,
        })
      })

    // Rounded corners effect (fake it with graphics)
    const graphics = this.add.graphics()
    graphics.fillStyle(color, 1)
    graphics.fillRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      12
    )
    graphics.lineStyle(2, 0xffffff, 0.5)
    graphics.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      12
    )

    button.setVisible(false) // Hide rectangle, use graphics instead

    const buttonText = this.add.text(x, y, text, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '24px',
      color: '#FFFFFF',
      align: 'center',
    })
    buttonText.setOrigin(0.5)

    // Make graphics interactive instead
    graphics.setInteractive(
      new Phaser.Geom.Rectangle(
        x - width / 2,
        y - height / 2,
        width,
        height
      ),
      Phaser.Geom.Rectangle.Contains
    )
    graphics.on('pointerdown', () => {
      audioManager.playSoundEffect('uiClick')
      onClick()
    })
    graphics.on('pointerover', () => {
      graphics.clear()
      graphics.fillStyle(Phaser.Display.Color.GetColor(
        Math.min(255, ((color >> 16) & 0xff) + 20),
        Math.min(255, ((color >> 8) & 0xff) + 20),
        Math.min(255, (color & 0xff) + 20)
      ), 1)
      graphics.fillRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        12
      )
      graphics.lineStyle(3, 0xffffff, 0.8)
      graphics.strokeRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        12
      )
      this.tweens.add({
        targets: [graphics, buttonText],
        scale: 1.05,
        duration: 100,
      })
    })
    graphics.on('pointerout', () => {
      graphics.clear()
      graphics.fillStyle(color, 1)
      graphics.fillRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        12
      )
      graphics.lineStyle(2, 0xffffff, 0.5)
      graphics.strokeRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        12
      )
      this.tweens.add({
        targets: [graphics, buttonText],
        scale: 1,
        duration: 100,
      })
    })

    // Animate buttons in
    graphics.setAlpha(0)
    buttonText.setAlpha(0)
    this.tweens.add({
      targets: [graphics, buttonText],
      alpha: 1,
      delay: 400,
      duration: 400,
      ease: 'Power2',
    })
  }
}
