import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'
import { audioManager } from '../managers/AudioManager'
import { settingsManager } from '../managers/SettingsManager'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    // Start background music for menu
    audioManager.startBackgroundMusic()
    // Background gradient
    const graphics = this.add.graphics()
    graphics.fillStyle(0xA8D8EA, 1)
    graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)

    graphics.fillStyle(0xE8F4F8, 1)
    graphics.fillRect(0, GAME_CONFIG_BOUNDS.height / 2, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)

    // Get font sizes from settings
    const headingSize = settingsManager.getFontSizeValue('heading')
    const questionSize = settingsManager.getFontSizeValue('question')
    const bodySize = settingsManager.getFontSizeValue('body')

    // Title
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      200,
      "Chameleon's Quest",
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: headingSize,
        color: '#2C3E50',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Subtitle
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      300,
      'Amazon Insect Reading Adventure',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: questionSize,
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Start button
    const startButton = this.add
      .rectangle(GAME_CONFIG_BOUNDS.centerX, 450, 300, 80, 0x7BA7BC)
      .setInteractive()
      .on('pointerdown', () => {
        audioManager.playSoundEffect('uiClick')
        this.scene.stop('MenuScene')
        this.scene.start('LevelSelectScene')
      })
      .on('pointerover', () => {
        startButton.setFillStyle(0x88B8A8)
      })
      .on('pointerout', () => {
        startButton.setFillStyle(0x7BA7BC)
      })

    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      450,
      'Select Level',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: questionSize,
        color: '#FFFFFF',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Encyclopedia button
    const encyclopediaButton = this.add
      .rectangle(GAME_CONFIG_BOUNDS.centerX, 570, 300, 80, 0x88B8A8)
      .setInteractive()
      .on('pointerdown', () => {
        audioManager.playSoundEffect('uiClick')
        // Dispatch event to open encyclopedia in React
        window.dispatchEvent(new CustomEvent('openEncyclopedia'))
      })
      .on('pointerover', () => {
        encyclopediaButton.setFillStyle(0xA8E0C8)
      })
      .on('pointerout', () => {
        encyclopediaButton.setFillStyle(0x88B8A8)
      })

    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      570,
      'Encyclopedia 📖',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: questionSize,
        color: '#FFFFFF',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Settings button
    const settingsButton = this.add
      .rectangle(GAME_CONFIG_BOUNDS.centerX, 690, 300, 80, 0xF4C430)
      .setInteractive()
      .on('pointerdown', () => {
        audioManager.playSoundEffect('uiClick')
        // Dispatch event to open settings in React
        window.dispatchEvent(new CustomEvent('openSettings'))
      })
      .on('pointerover', () => {
        settingsButton.setFillStyle(0xF4D460)
      })
      .on('pointerout', () => {
        settingsButton.setFillStyle(0xF4C430)
      })

    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      690,
      'Settings ⚙️',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: questionSize,
        color: '#2C3E50',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Info text
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      820,
      'Use arrow keys or mouse to aim • Press SPACEBAR or click to shoot',
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: bodySize,
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Keyboard hint
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      900,
      'Press P to pause • Press ESC for encyclopedia',
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: bodySize,
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)
  }
}
