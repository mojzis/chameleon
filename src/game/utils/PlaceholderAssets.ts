import Phaser from 'phaser'
import { GAME_CONFIG_BOUNDS } from '../config'
import { INSECTS } from '../../data/insects'

/**
 * PlaceholderAssets - Generates procedural placeholder assets when images aren't available
 *
 * This allows development to continue without requiring actual art assets.
 * All generated textures can be easily replaced with real images later.
 */
export class PlaceholderAssets {
  /**
   * Generate all placeholder textures for the game
   * @param scene - The Phaser scene
   */
  static generateAll(scene: Phaser.Scene) {
    this.generateBackgrounds(scene)
    this.generateChameleonHeads(scene)
    this.generateInsects(scene)
    this.generateParticles(scene)
    this.generateUI(scene)
  }

  /**
   * Generate 5 parallax background layers
   */
  static generateBackgrounds(scene: Phaser.Scene) {
    const width = GAME_CONFIG_BOUNDS.width
    const height = GAME_CONFIG_BOUNDS.height

    // Layer 1: Sky gradient (static)
    const skyTexture = scene.textures.createCanvas(
      'level-bg-sky',
      width,
      height
    )
    if (!skyTexture) return
    const skyCtx = skyTexture.getContext()
    if (skyCtx) {
      const gradient = skyCtx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#A8D8EA') // Soft azure
      gradient.addColorStop(1, '#E8F4F8') // Misty blue
      skyCtx.fillStyle = gradient
      skyCtx.fillRect(0, 0, width, height)
      skyTexture.refresh()
    }

    // Layer 2: Distant canopy (blurred silhouettes)
    const distantTexture = scene.textures.createCanvas(
      'level-bg-distant-canopy',
      width,
      height
    )
    if (!distantTexture) return
    const distantCtx = distantTexture.getContext()
    if (distantCtx) {
      distantCtx.fillStyle = '#7BA7BC' // Dusty blue-green
      distantCtx.globalAlpha = 0.7

      // Draw random blob shapes for distant trees
      for (let i = 0; i < 8; i++) {
        const x = (width / 8) * i + Math.random() * 100
        const y = height * 0.3 + Math.random() * 100
        const radius = 80 + Math.random() * 60

        distantCtx.beginPath()
        distantCtx.ellipse(x, y, radius, radius * 1.5, 0, 0, Math.PI * 2)
        distantCtx.fill()
      }
      distantTexture.refresh()
    }

    // Layer 3: Mid-canopy (sharper leaves)
    const midTexture = scene.textures.createCanvas(
      'level-bg-mid-canopy',
      width,
      height
    )
    if (!midTexture) return
    const midCtx = midTexture.getContext()
    if (midCtx) {
      midCtx.fillStyle = '#88B8A8' // Sage teal
      midCtx.globalAlpha = 0.85

      // Draw stylized leaf shapes
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * width
        const y = height * 0.2 + Math.random() * (height * 0.5)
        const size = 40 + Math.random() * 60

        // Simple leaf shape
        midCtx.beginPath()
        midCtx.ellipse(x, y, size, size * 2, Math.random() * Math.PI, 0, Math.PI * 2)
        midCtx.fill()
      }
      midTexture.refresh()
    }

    // Layer 4: Foreground vines (crisp detail at edges)
    const foregroundTexture = scene.textures.createCanvas(
      'level-bg-foreground',
      width,
      height
    )
    if (!foregroundTexture) return
    const foregroundCtx = foregroundTexture.getContext()
    if (foregroundCtx) {
      foregroundCtx.fillStyle = '#7BC8A0' // Minty green
      foregroundCtx.globalAlpha = 1.0

      // Draw hanging vines at top edges
      for (let side = 0; side < 2; side++) {
        const x = side === 0 ? 50 : width - 50
        for (let i = 0; i < 5; i++) {
          const offsetX = (Math.random() - 0.5) * 100
          const leafY = i * 80 + 20
          const leafX = x + offsetX

          // Vine leaf
          foregroundCtx.beginPath()
          foregroundCtx.ellipse(leafX, leafY, 30, 50, Math.random() * 0.5, 0, Math.PI * 2)
          foregroundCtx.fill()
        }
      }
      foregroundTexture.refresh()
    }

    // Layer 5: Forest floor (static bottom layer)
    const floorTexture = scene.textures.createCanvas(
      'level-bg-floor',
      width,
      200
    )
    if (!floorTexture) return
    const floorCtx = floorTexture.getContext()
    if (floorCtx) {
      floorCtx.fillStyle = '#B8C8B0' // Soft moss green
      floorCtx.fillRect(0, 0, width, 200)

      // Add some grass texture
      floorCtx.strokeStyle = '#A0B098'
      floorCtx.lineWidth = 2
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width
        const y = Math.random() * 50
        const height = 10 + Math.random() * 30

        floorCtx.beginPath()
        floorCtx.moveTo(x, y)
        floorCtx.lineTo(x, y + height)
        floorCtx.stroke()
      }
      floorTexture.refresh()
    }
  }

  /**
   * Generate chameleon head expressions (4 variations)
   */
  static generateChameleonHeads(scene: Phaser.Scene) {
    const size = 200
    const expressions = ['neutral', 'happy', 'sad', 'thinking']

    expressions.forEach((expression) => {
      const texture = scene.textures.createCanvas(
        `chameleon-head-${expression}`,
        size,
        size
      )
      if (!texture) return
      const ctx = texture.getContext()
      if (!ctx) return

      // Head (circle)
      ctx.fillStyle = '#7BC8A0' // Minty green-blue
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, 80, 0, Math.PI * 2)
      ctx.fill()

      // Highlight
      ctx.fillStyle = '#A8E0C8' // Light seafoam
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(size / 2 - 20, size / 2 - 20, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1.0

      // Eyes
      ctx.fillStyle = '#F4C430' // Warm golden
      const leftEyeX = size / 2 - 30
      const rightEyeX = size / 2 + 30
      const eyeY = size / 2 - 10

      // Expression-specific eye rendering
      switch (expression) {
        case 'happy':
          // Wide eyes
          ctx.beginPath()
          ctx.arc(leftEyeX, eyeY, 15, 0, Math.PI * 2)
          ctx.arc(rightEyeX, eyeY, 15, 0, Math.PI * 2)
          ctx.fill()
          // Smile
          ctx.strokeStyle = '#2C3E50'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(size / 2, size / 2 + 10, 40, 0.2, Math.PI - 0.2)
          ctx.stroke()
          break

        case 'sad':
          // Droopy eyes (ovals)
          ctx.beginPath()
          ctx.ellipse(leftEyeX, eyeY + 5, 12, 10, 0, 0, Math.PI * 2)
          ctx.ellipse(rightEyeX, eyeY + 5, 12, 10, 0, 0, Math.PI * 2)
          ctx.fill()
          // Frown
          ctx.strokeStyle = '#2C3E50'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(size / 2, size / 2 + 40, 40, Math.PI + 0.2, Math.PI * 2 - 0.2)
          ctx.stroke()
          break

        case 'thinking':
          // One eye squinted
          ctx.beginPath()
          ctx.ellipse(leftEyeX, eyeY, 12, 6, 0, 0, Math.PI * 2)
          ctx.arc(rightEyeX, eyeY, 12, 0, Math.PI * 2)
          ctx.fill()
          break

        default: // neutral
          // Normal eyes
          ctx.beginPath()
          ctx.arc(leftEyeX, eyeY, 12, 0, Math.PI * 2)
          ctx.arc(rightEyeX, eyeY, 12, 0, Math.PI * 2)
          ctx.fill()
      }

      // Pupils
      ctx.fillStyle = '#2C3E50'
      ctx.beginPath()
      ctx.arc(leftEyeX, eyeY, 6, 0, Math.PI * 2)
      ctx.arc(rightEyeX, eyeY, 6, 0, Math.PI * 2)
      ctx.fill()

      texture.refresh()
    })
  }

  /**
   * Generate placeholder insect sprites (colored circles with species colors)
   */
  static generateInsects(scene: Phaser.Scene) {
    INSECTS.forEach((insect) => {
      const size = insect.size === 'large' ? 150 : insect.size === 'medium' ? 120 : 90
      const texture = scene.textures.createCanvas(insect.imageKey, size, size)
      if (!texture) return
      const ctx = texture.getContext()
      if (!ctx) return

      // Parse color
      const color = insect.color

      // Main insect body (circle)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2)
      ctx.fill()

      // Add a border
      ctx.strokeStyle = '#2C3E50'
      ctx.lineWidth = 2
      ctx.stroke()

      // Add size indicator (text)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(insect.size.charAt(0).toUpperCase(), size / 2, size / 2)

      texture.refresh()
    })
  }

  /**
   * Generate particle textures
   */
  static generateParticles(scene: Phaser.Scene) {
    // Leaf particle
    const leafTexture = scene.textures.createCanvas('leaf-particle', 16, 16)
    if (!leafTexture) return
    const leafCtx = leafTexture.getContext()
    if (leafCtx) {
      leafCtx.fillStyle = '#88B8A8'
      leafCtx.globalAlpha = 0.7
      leafCtx.beginPath()
      leafCtx.ellipse(8, 8, 6, 10, Math.PI / 4, 0, Math.PI * 2)
      leafCtx.fill()
      leafTexture.refresh()
    }

    // Mist particle
    const mistTexture = scene.textures.createCanvas('mist-particle', 32, 32)
    if (!mistTexture) return
    const mistCtx = mistTexture.getContext()
    if (mistCtx) {
      const gradient = mistCtx.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      mistCtx.fillStyle = gradient
      mistCtx.fillRect(0, 0, 32, 32)
      mistTexture.refresh()
    }

    // Sparkle particle
    const sparkleTexture = scene.textures.createCanvas(
      'sparkle-particle',
      8,
      8
    )
    if (!sparkleTexture) return
    const sparkleCtx = sparkleTexture.getContext()
    if (sparkleCtx) {
      sparkleCtx.fillStyle = '#F4C430'
      sparkleCtx.beginPath()
      // Simple star shape
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i
        sparkleCtx.lineTo(
          4 + Math.cos(angle) * 4,
          4 + Math.sin(angle) * 4
        )
        sparkleCtx.lineTo(
          4 + Math.cos(angle + Math.PI / 4) * 2,
          4 + Math.sin(angle + Math.PI / 4) * 2
        )
      }
      sparkleCtx.closePath()
      sparkleCtx.fill()
      sparkleTexture.refresh()
    }
  }

  /**
   * Generate UI element textures
   */
  static generateUI(scene: Phaser.Scene) {
    // Help button
    const helpTexture = scene.textures.createCanvas('help-button', 64, 64)
    if (!helpTexture) return
    const helpCtx = helpTexture.getContext()
    if (helpCtx) {
      // Circle background
      helpCtx.fillStyle = '#F4C430'
      helpCtx.beginPath()
      helpCtx.arc(32, 32, 30, 0, Math.PI * 2)
      helpCtx.fill()

      // "?" symbol
      helpCtx.fillStyle = '#2C3E50'
      helpCtx.font = 'bold 40px Arial'
      helpCtx.textAlign = 'center'
      helpCtx.textBaseline = 'middle'
      helpCtx.fillText('?', 32, 32)

      helpTexture.refresh()
    }
  }

  /**
   * Check if placeholder generation is needed (images don't exist)
   * @param scene - The Phaser scene
   * @returns true if placeholders should be generated
   */
  static shouldGeneratePlaceholders(scene: Phaser.Scene): boolean {
    // Check if a key texture exists
    return !scene.textures.exists('chameleon-head-neutral')
  }
}
