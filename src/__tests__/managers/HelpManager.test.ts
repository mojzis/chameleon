import { describe, it, expect, beforeEach } from 'vitest'
import { HelpManager } from '../../game/managers/HelpManager'

describe('HelpManager', () => {
  let helpManager: HelpManager

  beforeEach(() => {
    helpManager = new HelpManager()
  })

  describe('constructor', () => {
    it('should initialize with maximum helps available', () => {
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should initialize with zero helps used', () => {
      const initialHelps = helpManager.getHelpRemaining()
      expect(initialHelps).toBe(3)
    })
  })

  describe('useHelp', () => {
    it('should return true when help is available', () => {
      const result = helpManager.useHelp()
      expect(result).toBe(true)
    })

    it('should decrement help remaining', () => {
      expect(helpManager.getHelpRemaining()).toBe(3)
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(2)
    })

    it('should return false when all helps are used', () => {
      // Use all 3 helps
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()

      // Try to use a 4th help
      const result = helpManager.useHelp()
      expect(result).toBe(false)
    })

    it('should not decrement below zero', () => {
      // Use all 3 helps
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()

      expect(helpManager.getHelpRemaining()).toBe(0)

      // Try to use more
      helpManager.useHelp()
      helpManager.useHelp()

      expect(helpManager.getHelpRemaining()).toBe(0)
    })

    it('should allow exactly 3 helps per level', () => {
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(false)
    })

    it('should track sequential help usage correctly', () => {
      expect(helpManager.getHelpRemaining()).toBe(3)

      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(2)

      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(1)

      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(0)
    })
  })

  describe('getHelpRemaining', () => {
    it('should return 3 initially', () => {
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should return correct count after using helps', () => {
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(2)

      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(1)
    })

    it('should return 0 when all helps are used', () => {
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(0)
    })

    it('should always return a non-negative number', () => {
      for (let i = 0; i < 10; i++) {
        helpManager.useHelp()
      }
      expect(helpManager.getHelpRemaining()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('resetLevel', () => {
    it('should restore all helps', () => {
      helpManager.useHelp()
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(1)

      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should work when all helps were used', () => {
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(0)

      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should work when no helps were used', () => {
      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should allow helps to be used again after reset', () => {
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()

      helpManager.resetLevel()

      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.getHelpRemaining()).toBe(0)
    })

    it('should be callable multiple times', () => {
      helpManager.resetLevel()
      helpManager.resetLevel()
      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)
    })
  })

  describe('integration tests', () => {
    it('should handle a typical level progression', () => {
      // Level 1: Use 2 helps
      helpManager.useHelp()
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(1)

      // Advance to Level 2: Reset
      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)

      // Level 2: Use all helps
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(0)
      expect(helpManager.useHelp()).toBe(false)

      // Advance to Level 3: Reset
      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should handle not using any helps in a level', () => {
      // Complete a level without using helps
      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)

      // Start next level
      helpManager.resetLevel()
      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should handle partial help usage patterns', () => {
      // Use 1 help
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.getHelpRemaining()).toBe(2)

      // Reset
      helpManager.resetLevel()

      // Use 2 helps
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.getHelpRemaining()).toBe(1)

      // Reset
      helpManager.resetLevel()

      // Use all 3 helps
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.useHelp()).toBe(true)
      expect(helpManager.getHelpRemaining()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid help usage', () => {
      const results = [
        helpManager.useHelp(),
        helpManager.useHelp(),
        helpManager.useHelp(),
        helpManager.useHelp(),
        helpManager.useHelp(),
      ]

      expect(results).toEqual([true, true, true, false, false])
    })

    it('should maintain state across multiple operations', () => {
      helpManager.useHelp()
      const remaining1 = helpManager.getHelpRemaining()

      helpManager.useHelp()
      const remaining2 = helpManager.getHelpRemaining()

      expect(remaining1).toBe(2)
      expect(remaining2).toBe(1)
      expect(remaining1 - remaining2).toBe(1)
    })

    it('should handle alternating use and reset', () => {
      helpManager.useHelp()
      helpManager.resetLevel()
      helpManager.useHelp()
      helpManager.resetLevel()
      helpManager.useHelp()
      helpManager.resetLevel()

      expect(helpManager.getHelpRemaining()).toBe(3)
    })

    it('should work correctly after many resets', () => {
      for (let i = 0; i < 100; i++) {
        helpManager.resetLevel()
      }

      expect(helpManager.getHelpRemaining()).toBe(3)
      expect(helpManager.useHelp()).toBe(true)
    })
  })

  describe('canUseHelp logic', () => {
    it('should indicate help is available when remaining > 0', () => {
      expect(helpManager.getHelpRemaining()).toBeGreaterThan(0)
    })

    it('should indicate help is not available when remaining = 0', () => {
      helpManager.useHelp()
      helpManager.useHelp()
      helpManager.useHelp()
      expect(helpManager.getHelpRemaining()).toBe(0)
    })

    it('should correctly reflect availability before and after use', () => {
      const beforeUse = helpManager.getHelpRemaining() > 0
      helpManager.useHelp()
      const afterUse = helpManager.getHelpRemaining() > 0

      expect(beforeUse).toBe(true)
      expect(afterUse).toBe(true) // Still 2 remaining
    })

    it('should correctly reflect availability at boundary', () => {
      helpManager.useHelp()
      helpManager.useHelp()

      const beforeLast = helpManager.getHelpRemaining() > 0
      expect(beforeLast).toBe(true)

      helpManager.useHelp()

      const afterLast = helpManager.getHelpRemaining() > 0
      expect(afterLast).toBe(false)
    })
  })
})
