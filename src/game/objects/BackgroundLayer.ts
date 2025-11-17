import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'

/**
 * BackgroundLayer - Manages a single parallax background layer
 *
 * Features:
 * - Parallax scrolling effect
 * - Optional vertical movement (gentle floating)
 * - Seamless tiling for infinite scroll
 * - Configurable scroll speed multiplier
 */
export class BackgroundLayer extends Phaser.GameObjects.TileSprite {
  private scrollSpeedX: number
  private scrollSpeedY: number
  private floatAmplitude: number
  private floatFrequency: number
  private baseY: number
  private elapsedTime: number = 0

  /**
   * Create a new background layer
   * @param scene - The Phaser scene
   * @param textureKey - The key for the loaded texture
   * @param scrollSpeedX - Horizontal scroll speed multiplier (0 = static, 1 = normal speed)
   * @param scrollSpeedY - Vertical scroll speed (optional, for gentle floating)
   * @param floatAmplitude - How much the layer floats vertically (pixels)
   * @param floatFrequency - How fast the layer floats (radians per second)
   * @param depth - Z-index for layer ordering (lower = further back)
   */
  constructor(
    scene: Phaser.Scene,
    textureKey: string,
    scrollSpeedX: number = 0,
    scrollSpeedY: number = 0,
    floatAmplitude: number = 0,
    floatFrequency: number = 0,
    depth: number = 0
  ) {
    super(
      scene,
      GAME_CONFIG_BOUNDS.centerX,
      GAME_CONFIG_BOUNDS.centerY,
      GAME_CONFIG_BOUNDS.width,
      GAME_CONFIG_BOUNDS.height,
      textureKey
    )

    this.scrollSpeedX = scrollSpeedX
    this.scrollSpeedY = scrollSpeedY
    this.floatAmplitude = floatAmplitude
    this.floatFrequency = floatFrequency
    this.baseY = GAME_CONFIG_BOUNDS.centerY

    // Set depth for proper layering
    this.setDepth(depth)

    // Set origin to center for proper positioning
    this.setOrigin(0.5, 0.5)

    // Add to scene
    scene.add.existing(this)
  }

  /**
   * Update the background layer
   * @param delta - Time since last frame in milliseconds
   */
  update(delta: number) {
    this.elapsedTime += delta / 1000 // Convert to seconds

    // Horizontal parallax scrolling (moves with camera/time)
    if (this.scrollSpeedX !== 0) {
      this.tilePositionX += this.scrollSpeedX * (delta / 16) // Normalize to 60fps
    }

    // Vertical parallax scrolling (optional)
    if (this.scrollSpeedY !== 0) {
      this.tilePositionY += this.scrollSpeedY * (delta / 16)
    }

    // Gentle floating effect (sine wave vertical movement)
    if (this.floatAmplitude !== 0) {
      const offset =
        Math.sin(this.elapsedTime * this.floatFrequency) * this.floatAmplitude
      this.y = this.baseY + offset
    }
  }

  /**
   * Set the scroll speed for this layer
   * @param speedX - Horizontal scroll speed multiplier
   * @param speedY - Vertical scroll speed (optional)
   */
  setScrollSpeed(speedX: number, speedY: number = 0) {
    this.scrollSpeedX = speedX
    this.scrollSpeedY = speedY
  }

  /**
   * Set the floating effect parameters
   * @param amplitude - How much to float (pixels)
   * @param frequency - How fast to float (radians per second)
   */
  setFloatEffect(amplitude: number, frequency: number) {
    this.floatAmplitude = amplitude
    this.floatFrequency = frequency
  }

  /**
   * Reset the layer position and elapsed time
   */
  reset() {
    this.tilePositionX = 0
    this.tilePositionY = 0
    this.y = this.baseY
    this.elapsedTime = 0
  }

  /**
   * Set the alpha/opacity of the layer
   * @param alpha - Alpha value (0 = transparent, 1 = opaque)
   */
  setLayerAlpha(alpha: number) {
    this.setAlpha(alpha)
  }
}
