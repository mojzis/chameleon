import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    // Background gradient
    const graphics = this.add.graphics()
    graphics.fillStyle(0xA8D8EA, 1)
    graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)

    graphics.fillStyle(0xE8F4F8, 1)
    graphics.fillRect(0, GAME_CONFIG_BOUNDS.height / 2, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)

    // Title
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      200,
      "Chameleon's Quest",
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '64px',
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
        fontSize: '32px',
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Start button
    const startButton = this.add
      .rectangle(GAME_CONFIG_BOUNDS.centerX, 500, 300, 80, 0x7BA7BC)
      .setInteractive()
      .on('pointerdown', () => {
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
      500,
      'Select Level',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '28px',
        color: '#FFFFFF',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Info text
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      700,
      'Use arrow keys or mouse to aim • Press SPACEBAR or click to shoot',
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '16px',
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)
  }
}
