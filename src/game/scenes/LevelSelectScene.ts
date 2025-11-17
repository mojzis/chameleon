import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'
import { LEVELS } from '../../data/levels'
import { LevelProgressManager } from '../managers/LevelProgressManager'

export class LevelSelectScene extends Phaser.Scene {
  private progressManager!: LevelProgressManager

  constructor() {
    super({ key: 'LevelSelectScene' })
  }

  create() {
    // Initialize progress manager
    this.progressManager = new LevelProgressManager()

    // Background gradient
    this.createBackground()

    const centerX = GAME_CONFIG_BOUNDS.centerX

    // Title
    const title = this.add.text(centerX, 80, 'Select Level', {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '56px',
      color: '#2C3E50',
      align: 'center',
    })
    title.setOrigin(0.5)

    // Progress summary
    const completionPercent = this.progressManager.getCompletionPercentage()
    const summary = this.add.text(
      centerX,
      150,
      `Progress: ${completionPercent.toFixed(0)}% Complete`,
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '24px',
        color: '#7BA7BC',
        align: 'center',
      }
    )
    summary.setOrigin(0.5)

    // Level cards
    this.createLevelCards(centerX, 230)

    // Back to menu button
    this.createBackButton()

    // Animate in
    this.tweens.add({
      targets: [title, summary],
      alpha: { from: 0, to: 1 },
      y: { from: '-=30', to: '+=30' },
      duration: 600,
      ease: 'Back.easeOut',
      delay: 100,
    })
  }

  private createBackground() {
    const graphics = this.add.graphics()
    graphics.fillStyle(0xa8d8ea, 1)
    graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)

    graphics.fillStyle(0xe8f4f8, 1)
    graphics.fillRect(
      0,
      GAME_CONFIG_BOUNDS.height / 2,
      GAME_CONFIG_BOUNDS.width,
      GAME_CONFIG_BOUNDS.height / 2
    )
  }

  private createLevelCards(centerX: number, startY: number) {
    const cardWidth = 220
    const cardHeight = 280
    const spacing = 30
    const columns = 5
    const totalWidth = cardWidth * columns + spacing * (columns - 1)
    const startX = centerX - totalWidth / 2 + cardWidth / 2

    LEVELS.forEach((level, index) => {
      const x = startX + index * (cardWidth + spacing)
      const y = startY + cardHeight / 2

      const isUnlocked = this.progressManager.isLevelUnlocked(level.id)
      const levelProgress = this.progressManager.getLevelProgress(level.id)

      this.createLevelCard(
        x,
        y,
        cardWidth,
        cardHeight,
        level as (typeof LEVELS)[number],
        isUnlocked,
        levelProgress,
        index
      )
    })
  }

  private createLevelCard(
    x: number,
    y: number,
    width: number,
    height: number,
    level: (typeof LEVELS)[number],
    isUnlocked: boolean,
    progress: any,
    index: number
  ) {
    const container = this.add.container(x, y)

    // Card background
    const card = this.add.graphics()

    if (isUnlocked) {
      // Unlocked - full color
      const color = progress?.completed ? 0x7bc8a0 : 0xe8f4f8
      card.fillStyle(color, 1)
      card.fillRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        12
      )
      card.lineStyle(3, 0x7ba7bc, 1)
      card.strokeRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        12
      )

      // Completion indicator
      if (progress?.completed) {
        const checkmark = this.add.text(-width / 2 + 15, -height / 2 + 15, '✓', {
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '32px',
          color: '#FFFFFF',
        })
        container.add(checkmark)
      }
    } else {
      // Locked - grayed out
      card.fillStyle(0xcccccc, 0.5)
      card.fillRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        12
      )
      card.lineStyle(2, 0x999999, 1)
      card.strokeRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        12
      )

      // Lock icon
      const lock = this.add.text(0, -60, '🔒', {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '48px',
        align: 'center',
      })
      lock.setOrigin(0.5)
      container.add(lock)
    }

    container.add(card)

    // Level number
    const levelNum = this.add.text(0, -80, `Level ${level.id}`, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '24px',
      color: isUnlocked ? '#2C3E50' : '#999999',
      align: 'center',
    })
    levelNum.setOrigin(0.5)
    container.add(levelNum)

    // Level name
    const levelName = this.add.text(0, -40, level.name, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '20px',
      color: isUnlocked ? '#5A6C7D' : '#AAAAAA',
      align: 'center',
      wordWrap: { width: width - 20 },
    })
    levelName.setOrigin(0.5)
    container.add(levelName)

    // Stats (if unlocked)
    if (isUnlocked && progress) {
      const statsY = 10

      // Best score
      if (progress.bestScore > 0) {
        const scoreText = this.add.text(
          0,
          statsY,
          `Best: ${progress.bestScore}`,
          {
            fontFamily: "'Lexend', sans-serif",
            fontSize: '16px',
            color: '#5A6C7D',
            align: 'center',
          }
        )
        scoreText.setOrigin(0.5)
        container.add(scoreText)

        // Accuracy
        const accuracyText = this.add.text(
          0,
          statsY + 25,
          `${Math.round(progress.bestAccuracy)}% Acc`,
          {
            fontFamily: "'Lexend', sans-serif",
            fontSize: '14px',
            color: '#7BA7BC',
            align: 'center',
          }
        )
        accuracyText.setOrigin(0.5)
        container.add(accuracyText)
      } else if (!progress.completed) {
        const newText = this.add.text(0, statsY, 'NEW!', {
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '20px',
          color: '#F4C430',
          align: 'center',
        })
        newText.setOrigin(0.5)
        container.add(newText)
      }

      // Play button
      const buttonY = 75
      const playButton = this.add.graphics()
      playButton.fillStyle(0x7bc8a0, 1)
      playButton.fillRoundedRect(-60, buttonY - 20, 120, 40, 8)

      const playText = this.add.text(0, buttonY, 'Play', {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '20px',
        color: '#FFFFFF',
        align: 'center',
      })
      playText.setOrigin(0.5)

      container.add(playButton)
      container.add(playText)

      // Make clickable
      card.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains
      )

      card.on('pointerdown', () => {
        this.scene.stop('LevelSelectScene')
        this.scene.start('LevelIntroScene', { level: level.id })
      })

      card.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scale: 1.05,
          duration: 150,
          ease: 'Back.easeOut',
        })
        card.clear()
        const hoverColor = progress?.completed ? 0x88d0b0 : 0xffffff
        card.fillStyle(hoverColor, 1)
        card.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
        card.lineStyle(4, 0x7bc8a0, 1)
        card.strokeRoundedRect(-width / 2, -height / 2, width, height, 12)
      })

      card.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 150,
          ease: 'Back.easeIn',
        })
        card.clear()
        const color = progress?.completed ? 0x7bc8a0 : 0xe8f4f8
        card.fillStyle(color, 1)
        card.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
        card.lineStyle(3, 0x7ba7bc, 1)
        card.strokeRoundedRect(-width / 2, -height / 2, width, height, 12)
      })
    } else if (!isUnlocked) {
      // Locked message
      const lockedText = this.add.text(0, 30, 'Complete\nprevious level', {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '14px',
        color: '#999999',
        align: 'center',
      })
      lockedText.setOrigin(0.5)
      container.add(lockedText)
    }

    // Animate cards in with stagger
    container.setAlpha(0)
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: { from: 0.8, to: 1 },
      duration: 500,
      delay: 400 + index * 100,
      ease: 'Back.easeOut',
    })
  }

  private createBackButton() {
    const x = 100
    const y = 50
    const width = 160
    const height = 50

    const button = this.add.graphics()
    button.fillStyle(0x5a6c7d, 1)
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)

    const buttonText = this.add.text(x, y, '← Main Menu', {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center',
    })
    buttonText.setOrigin(0.5)

    button.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    button.on('pointerdown', () => {
      this.scene.stop('LevelSelectScene')
      this.scene.start('MenuScene')
    })

    button.on('pointerover', () => {
      button.clear()
      button.fillStyle(0x6a7c8d, 1)
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)
    })

    button.on('pointerout', () => {
      button.clear()
      button.fillStyle(0x5a6c7d, 1)
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)
    })
  }
}
