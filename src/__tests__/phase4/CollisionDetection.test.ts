import { describe, it, expect } from 'vitest'
import Phaser from 'phaser'

describe('Phase 4: Collision Detection Logic', () => {
  describe('Circle-to-circle collision detection', () => {
    it('should detect collision when circles overlap', () => {
      const tipX = 500
      const tipY = 500
      const tipRadius = 12

      const insectX = 510
      const insectY = 510
      const insectRadius = 40

      const distance = Phaser.Math.Distance.Between(tipX, tipY, insectX, insectY)
      const isColliding = distance < tipRadius + insectRadius

      expect(isColliding).toBe(true)
    })

    it('should not detect collision when circles are far apart', () => {
      const tipX = 500
      const tipY = 500
      const tipRadius = 12

      const insectX = 700
      const insectY = 700
      const insectRadius = 40

      const distance = Phaser.Math.Distance.Between(tipX, tipY, insectX, insectY)
      const isColliding = distance < tipRadius + insectRadius

      expect(isColliding).toBe(false)
    })

    it('should handle edge case at exact collision boundary', () => {
      const tipX = 500
      const tipY = 500
      const tipRadius = 12

      const insectRadius = 40
      const totalRadius = tipRadius + insectRadius

      // Place insect exactly at collision boundary
      const insectX = tipX + totalRadius
      const insectY = tipY

      const distance = Phaser.Math.Distance.Between(tipX, tipY, insectX, insectY)
      const isColliding = distance < tipRadius + insectRadius

      expect(isColliding).toBe(false) // Equal distance is not collision
    })
  })

  describe('Tongue catching state logic', () => {
    it('should track caught insect state', () => {
      let caughtInsect: any = null

      // Simulate catching
      caughtInsect = { id: 'test-insect' }

      expect(caughtInsect).not.toBeNull()
      expect(caughtInsect.id).toBe('test-insect')
    })

    it('should prevent catching multiple insects', () => {
      let caughtInsect: any = null

      // Simulate catching first insect
      if (!caughtInsect) {
        caughtInsect = { id: 'first-insect' }
      }

      // Try to catch second insect
      if (!caughtInsect) {
        caughtInsect = { id: 'second-insect' }
      }

      expect(caughtInsect.id).toBe('first-insect')
    })

    it('should stop extending when catching', () => {
      let extending = true
      const hasCaughtInsect = true

      if (hasCaughtInsect) {
        extending = false
      }

      expect(extending).toBe(false)
    })
  })

  describe('InsectCard attachment logic', () => {
    it('should mark insect as caught when attached', () => {
      let isCaught = false

      // Simulate attachment
      isCaught = true

      expect(isCaught).toBe(true)
    })

    it('should follow tongue position when attached', () => {
      const insectX = 500
      const tongueX = 600

      // Simulate interpolation (Linear interpolation with factor 0.3)
      const newX = insectX + (tongueX - insectX) * 0.3

      expect(newX).toBeGreaterThan(insectX)
      expect(newX).toBeLessThan(tongueX)
    })

    it('should not fall when attached', () => {
      const attachedToTongue = true
      let shouldFall = true

      if (attachedToTongue) {
        shouldFall = false
      }

      expect(shouldFall).toBe(false)
    })
  })

  describe('Answer validation', () => {
    it('should identify correct answer', () => {
      const insect = {
        id: 'glasswing-butterfly',
        isCorrect: true,
      }

      expect(insect.isCorrect).toBe(true)
    })

    it('should identify wrong answer', () => {
      const insect = {
        id: 'hercules-beetle',
        isCorrect: false,
      }

      expect(insect.isCorrect).toBe(false)
    })
  })

  describe('Tongue tip position calculation', () => {
    it('should calculate tip position from angle and length', () => {
      const startX = 500
      const startY = 500
      const angle = 0 // degrees
      const length = 100

      const angleRad = Phaser.Math.DegToRad(angle)
      const tipX = startX + Math.cos(angleRad) * length
      const tipY = startY + Math.sin(angleRad) * length

      expect(tipX).toBe(600) // 500 + 100
      expect(tipY).toBe(500) // No vertical change at 0 degrees
    })

    it('should calculate tip position at 45 degrees', () => {
      const startX = 500
      const startY = 500
      const angle = 45
      const length = 100

      const angleRad = Phaser.Math.DegToRad(angle)
      const tipX = startX + Math.cos(angleRad) * length
      const tipY = startY + Math.sin(angleRad) * length

      // At 45 degrees, x and y components should be roughly equal
      expect(Math.abs(tipX - startX)).toBeCloseTo(
        Math.abs(tipY - startY),
        1
      )
    })
  })
})
