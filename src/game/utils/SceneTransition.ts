import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'

/**
 * SceneTransition - Provides smooth transitions between scenes
 *
 * Features:
 * - Fade in/out transitions
 * - Slide transitions
 * - Customizable duration and easing
 */
export class SceneTransition {
  /**
   * Fade out the current scene, then start a new scene with fade in
   * @param scene - The current scene
   * @param targetSceneKey - The key of the scene to transition to
   * @param duration - Duration of each fade in milliseconds (default: 500)
   * @param data - Optional data to pass to the new scene
   */
  static fadeToScene(
    scene: Phaser.Scene,
    targetSceneKey: string,
    duration: number = 500,
    data?: object
  ) {
    // Create black overlay for fade
    const fadeOverlay = scene.add.rectangle(
      GAME_CONFIG_BOUNDS.centerX,
      GAME_CONFIG_BOUNDS.centerY,
      GAME_CONFIG_BOUNDS.width,
      GAME_CONFIG_BOUNDS.height,
      0x000000
    )
    fadeOverlay.setDepth(10000) // Render on top of everything
    fadeOverlay.setAlpha(0)

    // Fade out
    scene.tweens.add({
      targets: fadeOverlay,
      alpha: 1,
      duration,
      ease: 'Power2',
      onComplete: () => {
        // Start new scene
        scene.scene.start(targetSceneKey, data)

        // Fade in the new scene
        const newScene = scene.scene.get(targetSceneKey)
        if (newScene) {
          this.fadeIn(newScene, duration)
        }
      },
    })
  }

  /**
   * Fade in a scene from black
   * @param scene - The scene to fade in
   * @param duration - Duration in milliseconds (default: 500)
   */
  static fadeIn(scene: Phaser.Scene, duration: number = 500) {
    const fadeOverlay = scene.add.rectangle(
      GAME_CONFIG_BOUNDS.centerX,
      GAME_CONFIG_BOUNDS.centerY,
      GAME_CONFIG_BOUNDS.width,
      GAME_CONFIG_BOUNDS.height,
      0x000000
    )
    fadeOverlay.setDepth(10000)
    fadeOverlay.setAlpha(1)

    scene.tweens.add({
      targets: fadeOverlay,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => {
        fadeOverlay.destroy()
      },
    })
  }

  /**
   * Slide transition - slide out current scene, slide in new scene
   * @param scene - The current scene
   * @param targetSceneKey - The key of the scene to transition to
   * @param direction - Direction to slide ('left', 'right', 'up', 'down')
   * @param duration - Duration in milliseconds (default: 800)
   * @param data - Optional data to pass to the new scene
   */
  static slideToScene(
    scene: Phaser.Scene,
    targetSceneKey: string,
    direction: 'left' | 'right' | 'up' | 'down' = 'left',
    duration: number = 800,
    data?: object
  ) {
    // Create a container with all scene children
    const sceneContainer = scene.add.container(0, 0)

    // Move all existing displayable objects into container
    scene.children.list.forEach((child) => {
      if (child !== sceneContainer && 'x' in child) {
        const gameObject = child as Phaser.GameObjects.GameObject
        sceneContainer.add(gameObject)
      }
    })

    // Calculate slide destination based on direction
    let targetX = 0
    let targetY = 0

    switch (direction) {
      case 'left':
        targetX = -GAME_CONFIG_BOUNDS.width
        break
      case 'right':
        targetX = GAME_CONFIG_BOUNDS.width
        break
      case 'up':
        targetY = -GAME_CONFIG_BOUNDS.height
        break
      case 'down':
        targetY = GAME_CONFIG_BOUNDS.height
        break
    }

    // Slide out
    scene.tweens.add({
      targets: sceneContainer,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Power2',
      onComplete: () => {
        // Start new scene
        scene.scene.start(targetSceneKey, data)

        // Slide in the new scene
        const newScene = scene.scene.get(targetSceneKey)
        if (newScene) {
          this.slideIn(newScene, direction, duration)
        }
      },
    })
  }

  /**
   * Slide in a scene from a direction
   * @param scene - The scene to slide in
   * @param direction - Direction to slide from
   * @param duration - Duration in milliseconds (default: 800)
   */
  static slideIn(
    scene: Phaser.Scene,
    direction: 'left' | 'right' | 'up' | 'down',
    duration: number = 800
  ) {
    // Create container for scene content
    const sceneContainer = scene.add.container(0, 0)

    // Set initial position based on direction
    let startX = 0
    let startY = 0

    switch (direction) {
      case 'left':
        startX = GAME_CONFIG_BOUNDS.width
        break
      case 'right':
        startX = -GAME_CONFIG_BOUNDS.width
        break
      case 'up':
        startY = GAME_CONFIG_BOUNDS.height
        break
      case 'down':
        startY = -GAME_CONFIG_BOUNDS.height
        break
    }

    sceneContainer.setPosition(startX, startY)

    // Move all existing displayable objects into container
    scene.children.list.forEach((child) => {
      if (child !== sceneContainer && 'x' in child) {
        const gameObject = child as Phaser.GameObjects.GameObject
        sceneContainer.add(gameObject)
      }
    })

    // Slide in
    scene.tweens.add({
      targets: sceneContainer,
      x: 0,
      y: 0,
      duration,
      ease: 'Power2',
    })
  }

  /**
   * Flash transition - quick flash effect between scenes
   * @param scene - The current scene
   * @param targetSceneKey - The key of the scene to transition to
   * @param color - Flash color (default: white)
   * @param duration - Duration in milliseconds (default: 300)
   * @param data - Optional data to pass to the new scene
   */
  static flashToScene(
    scene: Phaser.Scene,
    targetSceneKey: string,
    color: number = 0xffffff,
    duration: number = 300,
    data?: object
  ) {
    const flashOverlay = scene.add.rectangle(
      GAME_CONFIG_BOUNDS.centerX,
      GAME_CONFIG_BOUNDS.centerY,
      GAME_CONFIG_BOUNDS.width,
      GAME_CONFIG_BOUNDS.height,
      color
    )
    flashOverlay.setDepth(10000)
    flashOverlay.setAlpha(0)

    // Flash in
    scene.tweens.add({
      targets: flashOverlay,
      alpha: 1,
      duration: duration / 2,
      ease: 'Power2',
      onComplete: () => {
        // Start new scene at peak flash
        scene.scene.start(targetSceneKey, data)

        // Flash out
        scene.tweens.add({
          targets: flashOverlay,
          alpha: 0,
          duration: duration / 2,
          ease: 'Power2',
          onComplete: () => {
            flashOverlay.destroy()
          },
        })
      },
    })
  }

  /**
   * Circular wipe transition - expanding circle reveals new scene
   * @param scene - The current scene
   * @param targetSceneKey - The key of the scene to transition to
   * @param duration - Duration in milliseconds (default: 600)
   * @param data - Optional data to pass to the new scene
   */
  static wipeToScene(
    scene: Phaser.Scene,
    targetSceneKey: string,
    duration: number = 600,
    data?: object
  ) {
    // Create circular mask that grows
    const mask = scene.add.graphics()
    mask.fillStyle(0x000000, 1)
    mask.setDepth(10000)

    // Start with full screen covered
    mask.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height)

    // Animate circle expanding from center to reveal scene
    const maxRadius = Math.sqrt(
      GAME_CONFIG_BOUNDS.width ** 2 + GAME_CONFIG_BOUNDS.height ** 2
    )

    let currentRadius = 0
    const step = (maxRadius / duration) * 16 // Approximately 60fps

    const wipeInterval = scene.time.addEvent({
      delay: 16,
      callback: () => {
        currentRadius += step

        if (currentRadius >= maxRadius) {
          wipeInterval.remove()
          scene.scene.start(targetSceneKey, data)
          mask.destroy()
        } else {
          // Redraw mask with expanding hole
          mask.clear()
          mask.fillStyle(0x000000, 1)
          mask.fillRect(
            0,
            0,
            GAME_CONFIG_BOUNDS.width,
            GAME_CONFIG_BOUNDS.height
          )
          mask.fillStyle(0x000000, 0) // Clear circle
          mask.fillCircle(
            GAME_CONFIG_BOUNDS.centerX,
            GAME_CONFIG_BOUNDS.centerY,
            currentRadius
          )
        }
      },
      loop: true,
    })
  }
}
