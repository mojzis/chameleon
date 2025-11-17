import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'
import { LEVELS } from '../../data/levels'
import { INSECTS } from '../../data/insects'

interface LevelIntroData {
  level: number
}

export class LevelIntroScene extends Phaser.Scene {
  private levelNumber!: number

  constructor() {
    super({ key: 'LevelIntroScene' })
  }

  init(data: LevelIntroData) {
    this.levelNumber = data.level || 1
  }

  create() {
    // Background gradient
    this.createBackground()

    const centerX = GAME_CONFIG_BOUNDS.centerX
    const levelData = LEVELS[this.levelNumber - 1]

    // Title
    const title = this.add.text(
      centerX,
      80,
      `Level ${this.levelNumber}`,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '48px',
        color: '#2C3E50',
        align: 'center',
      }
    )
    title.setOrigin(0.5)

    // Level name
    const levelName = this.add.text(
      centerX,
      150,
      levelData.name,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '56px',
        color: '#7BC8A0',
        align: 'center',
      }
    )
    levelName.setOrigin(0.5)

    // Description
    const description = this.add.text(
      centerX,
      230,
      levelData.description,
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '24px',
        color: '#5A6C7D',
        align: 'center',
      }
    )
    description.setOrigin(0.5)

    // Get insects for this level
    const levelInsects = INSECTS.filter((insect) => insect.level === this.levelNumber)

    // Preview insects section
    const previewY = 320
    const previewTitle = this.add.text(
      centerX,
      previewY,
      'Insects in this level:',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '28px',
        color: '#2C3E50',
        align: 'center',
      }
    )
    previewTitle.setOrigin(0.5)

    // Display insect names in a grid
    this.createInsectPreview(levelInsects, centerX, previewY + 60)

    // Level info box
    this.createLevelInfoBox(levelData, centerX, GAME_CONFIG_BOUNDS.height - 250)

    // Start button
    this.createStartButton(centerX, GAME_CONFIG_BOUNDS.height - 100)

    // Animate elements in
    this.tweens.add({
      targets: [title, levelName, description],
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

  private createInsectPreview(
    insects: Array<(typeof INSECTS)[number]>,
    centerX: number,
    startY: number
  ) {
    // Create a visual preview of insects (names for now, could be icons later)
    const container = this.add.container(centerX, startY)

    insects.forEach((insect, index) => {
      // Create card for each insect
      const cardWidth = 180
      const cardHeight = 80
      const spacing = 20
      const columns = 3
      // const rows = Math.ceil(insects.length / columns)

      const col = index % columns
      const row = Math.floor(index / columns)

      const x = (col - (columns - 1) / 2) * (cardWidth + spacing)
      const y = row * (cardHeight + spacing)

      // Card background
      const card = this.add.graphics()
      card.fillStyle(Phaser.Display.Color.HexStringToColor(insect.color).color, 0.2)
      card.fillRoundedRect(
        x - cardWidth / 2,
        y - cardHeight / 2,
        cardWidth,
        cardHeight,
        8
      )
      card.lineStyle(2, Phaser.Display.Color.HexStringToColor(insect.color).color, 1)
      card.strokeRoundedRect(
        x - cardWidth / 2,
        y - cardHeight / 2,
        cardWidth,
        cardHeight,
        8
      )
      container.add(card)

      // Insect name
      const nameText = this.add.text(x, y, insect.commonName, {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '16px',
        color: '#2C3E50',
        align: 'center',
        wordWrap: { width: cardWidth - 10 },
      })
      nameText.setOrigin(0.5)
      container.add(nameText)

      // Animate cards in with stagger
      card.setAlpha(0)
      nameText.setAlpha(0)
      this.tweens.add({
        targets: [card, nameText],
        alpha: 1,
        scale: { from: 0.8, to: 1 },
        duration: 400,
        delay: 800 + index * 100,
        ease: 'Back.easeOut',
      })
    })
  }

  private createLevelInfoBox(
    levelData: (typeof LEVELS)[number],
    centerX: number,
    y: number
  ) {
    const boxWidth = 600
    const boxHeight = 100

    // Info box background
    const box = this.add.graphics()
    box.fillStyle(0xffffff, 0.9)
    box.fillRoundedRect(
      centerX - boxWidth / 2,
      y - boxHeight / 2,
      boxWidth,
      boxHeight,
      12
    )
    box.lineStyle(2, 0x7ba7bc, 1)
    box.strokeRoundedRect(
      centerX - boxWidth / 2,
      y - boxHeight / 2,
      boxWidth,
      boxHeight,
      12
    )

    // Info text
    const infoText = this.add.text(
      centerX,
      y - 15,
      `Difficulty: ${levelData.difficulty.toUpperCase()} • Reading Time: ${levelData.readingTimeSeconds}s • Strikes: ${levelData.strikes}`,
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '18px',
        color: '#5A6C7D',
        align: 'center',
      }
    )
    infoText.setOrigin(0.5)

    // Help reminder
    const helpText = this.add.text(
      centerX,
      y + 15,
      '💡 Press H or click Help button for hints (3 per level)',
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '16px',
        color: '#F4C430',
        align: 'center',
      }
    )
    helpText.setOrigin(0.5)

    // Animate in
    box.setAlpha(0)
    infoText.setAlpha(0)
    helpText.setAlpha(0)
    this.tweens.add({
      targets: [box, infoText, helpText],
      alpha: 1,
      duration: 400,
      delay: 1200,
      ease: 'Power2',
    })
  }

  private createStartButton(centerX: number, y: number) {
    const buttonWidth = 300
    const buttonHeight = 70

    const button = this.add.graphics()
    button.fillStyle(0x7bc8a0, 1)
    button.fillRoundedRect(
      centerX - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      12
    )
    button.lineStyle(3, 0xffffff, 0.5)
    button.strokeRoundedRect(
      centerX - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      12
    )

    const buttonText = this.add.text(centerX, y, 'Start Level', {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '32px',
      color: '#FFFFFF',
      align: 'center',
    })
    buttonText.setOrigin(0.5)

    // Make interactive
    button.setInteractive(
      new Phaser.Geom.Rectangle(
        centerX - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    )

    button.on('pointerdown', () => {
      this.scene.stop('LevelIntroScene')
      this.scene.start('MainScene', { level: this.levelNumber })
    })

    button.on('pointerover', () => {
      button.clear()
      button.fillStyle(0x88d0b0, 1)
      button.fillRoundedRect(
        centerX - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      )
      button.lineStyle(4, 0xffffff, 0.8)
      button.strokeRoundedRect(
        centerX - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      )
      this.tweens.add({
        targets: [button, buttonText],
        scale: 1.05,
        duration: 100,
      })
    })

    button.on('pointerout', () => {
      button.clear()
      button.fillStyle(0x7bc8a0, 1)
      button.fillRoundedRect(
        centerX - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      )
      button.lineStyle(3, 0xffffff, 0.5)
      button.strokeRoundedRect(
        centerX - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      )
      this.tweens.add({
        targets: [button, buttonText],
        scale: 1,
        duration: 100,
      })
    })

    // Animate button in
    button.setAlpha(0)
    buttonText.setAlpha(0)
    this.tweens.add({
      targets: [button, buttonText],
      alpha: 1,
      scale: { from: 0.9, to: 1 },
      duration: 500,
      delay: 1400,
      ease: 'Back.easeOut',
    })

    // Pulsing animation to draw attention
    this.tweens.add({
      targets: [button, buttonText],
      scale: 1.02,
      duration: 1000,
      delay: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Back button (smaller, in corner)
    this.createBackButton()
  }

  private createBackButton() {
    const backButton = this.add.graphics()
    const x = 100
    const y = 50
    const width = 120
    const height = 50

    backButton.fillStyle(0x5a6c7d, 1)
    backButton.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)

    const backText = this.add.text(x, y, '← Back', {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center',
    })
    backText.setOrigin(0.5)

    backButton.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    backButton.on('pointerdown', () => {
      this.scene.stop('LevelIntroScene')
      this.scene.start('LevelSelectScene')
    })

    backButton.on('pointerover', () => {
      backButton.clear()
      backButton.fillStyle(0x6a7c8d, 1)
      backButton.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)
    })

    backButton.on('pointerout', () => {
      backButton.clear()
      backButton.fillStyle(0x5a6c7d, 1)
      backButton.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)
    })
  }
}
