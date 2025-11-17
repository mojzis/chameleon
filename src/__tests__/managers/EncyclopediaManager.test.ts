import { describe, it, expect, beforeEach } from 'vitest'
import { EncyclopediaManager } from '../../game/managers/EncyclopediaManager'

describe('EncyclopediaManager', () => {
  let encyclopediaManager: EncyclopediaManager

  beforeEach(() => {
    encyclopediaManager = new EncyclopediaManager()
  })

  describe('constructor', () => {
    it('should initialize with no unlocked insects', () => {
      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
    })

    it('should initialize with empty unlocked insects array', () => {
      expect(encyclopediaManager.getUnlockedInsects()).toEqual([])
    })
  })

  describe('unlockInsect', () => {
    it('should unlock a single insect', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)
    })

    it('should increment unlocked count', () => {
      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })

    it('should unlock multiple different insects', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('glass-wing-butterfly')
      encyclopediaManager.unlockInsect('titan-beetle')

      expect(encyclopediaManager.getUnlockedCount()).toBe(3)
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)
      expect(encyclopediaManager.isUnlocked('glass-wing-butterfly')).toBe(true)
      expect(encyclopediaManager.isUnlocked('titan-beetle')).toBe(true)
    })

    it('should not duplicate insects in the unlocked set', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('hercules-beetle')

      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })

    it('should handle unlocking the same insect multiple times gracefully', () => {
      encyclopediaManager.unlockInsect('titan-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)

      encyclopediaManager.unlockInsect('titan-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)

      expect(encyclopediaManager.isUnlocked('titan-beetle')).toBe(true)
    })

    it('should accept any string as insect ID', () => {
      encyclopediaManager.unlockInsect('custom-insect-123')
      expect(encyclopediaManager.isUnlocked('custom-insect-123')).toBe(true)
    })

    it('should handle special characters in insect IDs', () => {
      encyclopediaManager.unlockInsect('insect-with-special-chars_123')
      expect(encyclopediaManager.isUnlocked('insect-with-special-chars_123')).toBe(true)
    })
  })

  describe('isUnlocked', () => {
    it('should return false for insects that have not been unlocked', () => {
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(false)
    })

    it('should return true for insects that have been unlocked', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)
    })

    it('should return false for non-existent insects', () => {
      expect(encyclopediaManager.isUnlocked('non-existent-insect')).toBe(false)
    })

    it('should be case-sensitive', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.isUnlocked('Hercules-Beetle')).toBe(false)
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)
    })

    it('should distinguish between similar insect IDs', () => {
      encyclopediaManager.unlockInsect('beetle')
      expect(encyclopediaManager.isUnlocked('beetle')).toBe(true)
      expect(encyclopediaManager.isUnlocked('beetle2')).toBe(false)
      expect(encyclopediaManager.isUnlocked('beetle-')).toBe(false)
    })
  })

  describe('getUnlockedCount', () => {
    it('should return 0 initially', () => {
      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
    })

    it('should return correct count after unlocking insects', () => {
      encyclopediaManager.unlockInsect('insect1')
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)

      encyclopediaManager.unlockInsect('insect2')
      expect(encyclopediaManager.getUnlockedCount()).toBe(2)

      encyclopediaManager.unlockInsect('insect3')
      expect(encyclopediaManager.getUnlockedCount()).toBe(3)
    })

    it('should not count duplicate unlocks', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('hercules-beetle')

      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })

    it('should handle large numbers of unlocked insects', () => {
      for (let i = 0; i < 100; i++) {
        encyclopediaManager.unlockInsect(`insect-${i}`)
      }

      expect(encyclopediaManager.getUnlockedCount()).toBe(100)
    })
  })

  describe('getUnlockedInsects', () => {
    it('should return empty array when no insects unlocked', () => {
      const unlocked = encyclopediaManager.getUnlockedInsects()
      expect(unlocked).toEqual([])
      expect(Array.isArray(unlocked)).toBe(true)
    })

    it('should return array with unlocked insect IDs', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('titan-beetle')

      const unlocked = encyclopediaManager.getUnlockedInsects()
      expect(unlocked).toContain('hercules-beetle')
      expect(unlocked).toContain('titan-beetle')
      expect(unlocked.length).toBe(2)
    })

    it('should not include duplicate entries', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('hercules-beetle')

      const unlocked = encyclopediaManager.getUnlockedInsects()
      expect(unlocked.filter(id => id === 'hercules-beetle').length).toBe(1)
    })

    it('should return all unique insects unlocked', () => {
      const insects = ['insect1', 'insect2', 'insect3', 'insect4', 'insect5']
      insects.forEach(id => encyclopediaManager.unlockInsect(id))

      const unlocked = encyclopediaManager.getUnlockedInsects()
      expect(unlocked.length).toBe(5)

      insects.forEach(id => {
        expect(unlocked).toContain(id)
      })
    })

    it('should return a new array (not a reference)', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')

      const unlocked1 = encyclopediaManager.getUnlockedInsects()
      const unlocked2 = encyclopediaManager.getUnlockedInsects()

      expect(unlocked1).not.toBe(unlocked2) // Different references
      expect(unlocked1).toEqual(unlocked2) // Same content
    })

    it('modifying returned array should not affect internal state', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')

      const unlocked = encyclopediaManager.getUnlockedInsects()
      unlocked.push('hacked-insect')

      expect(encyclopediaManager.isUnlocked('hacked-insect')).toBe(false)
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })
  })

  describe('reset', () => {
    it('should clear all unlocked insects', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('titan-beetle')
      encyclopediaManager.unlockInsect('glass-wing-butterfly')

      encyclopediaManager.reset()

      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
      expect(encyclopediaManager.getUnlockedInsects()).toEqual([])
    })

    it('should make previously unlocked insects locked again', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)

      encyclopediaManager.reset()
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(false)
    })

    it('should allow insects to be unlocked again after reset', () => {
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.reset()
      encyclopediaManager.unlockInsect('hercules-beetle')

      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })

    it('should work when called multiple times', () => {
      encyclopediaManager.unlockInsect('insect1')
      encyclopediaManager.reset()
      encyclopediaManager.reset()
      encyclopediaManager.reset()

      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
    })

    it('should work when no insects were unlocked', () => {
      encyclopediaManager.reset()
      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
    })
  })

  describe('integration tests', () => {
    it('should handle a typical game progression', () => {
      // Start of game
      expect(encyclopediaManager.getUnlockedCount()).toBe(0)

      // Answer first question correctly, unlock first insect
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(true)

      // Answer more questions, unlock more insects
      encyclopediaManager.unlockInsect('glass-wing-butterfly')
      encyclopediaManager.unlockInsect('titan-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(3)

      // Try to unlock same insect again (duplicate answer)
      encyclopediaManager.unlockInsect('hercules-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(3)

      // Continue unlocking
      encyclopediaManager.unlockInsect('blue-morpho-butterfly')
      encyclopediaManager.unlockInsect('rainbow-scarab')
      expect(encyclopediaManager.getUnlockedCount()).toBe(5)

      const unlocked = encyclopediaManager.getUnlockedInsects()
      expect(unlocked).toContain('hercules-beetle')
      expect(unlocked).toContain('glass-wing-butterfly')
      expect(unlocked).toContain('titan-beetle')
      expect(unlocked).toContain('blue-morpho-butterfly')
      expect(unlocked).toContain('rainbow-scarab')
    })

    it('should handle game restart', () => {
      // Play through game
      encyclopediaManager.unlockInsect('hercules-beetle')
      encyclopediaManager.unlockInsect('glass-wing-butterfly')
      encyclopediaManager.unlockInsect('titan-beetle')
      expect(encyclopediaManager.getUnlockedCount()).toBe(3)

      // Restart game
      encyclopediaManager.reset()
      expect(encyclopediaManager.getUnlockedCount()).toBe(0)
      expect(encyclopediaManager.isUnlocked('hercules-beetle')).toBe(false)

      // Play again
      encyclopediaManager.unlockInsect('blue-morpho-butterfly')
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
      expect(encyclopediaManager.isUnlocked('blue-morpho-butterfly')).toBe(true)
    })

    it('should track progress correctly across multiple sessions', () => {
      // Session 1
      encyclopediaManager.unlockInsect('insect1')
      encyclopediaManager.unlockInsect('insect2')

      // Session 2 - continuing, not resetting
      encyclopediaManager.unlockInsect('insect3')
      encyclopediaManager.unlockInsect('insect4')

      expect(encyclopediaManager.getUnlockedCount()).toBe(4)

      // Session 3 - new game
      encyclopediaManager.reset()
      encyclopediaManager.unlockInsect('insect1')

      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string as insect ID', () => {
      encyclopediaManager.unlockInsect('')
      expect(encyclopediaManager.isUnlocked('')).toBe(true)
      expect(encyclopediaManager.getUnlockedCount()).toBe(1)
    })

    it('should handle very long insect IDs', () => {
      const longId = 'a'.repeat(1000)
      encyclopediaManager.unlockInsect(longId)
      expect(encyclopediaManager.isUnlocked(longId)).toBe(true)
    })

    it('should handle rapid successive unlocks', () => {
      for (let i = 0; i < 100; i++) {
        encyclopediaManager.unlockInsect(`insect-${i}`)
      }

      expect(encyclopediaManager.getUnlockedCount()).toBe(100)

      for (let i = 0; i < 100; i++) {
        expect(encyclopediaManager.isUnlocked(`insect-${i}`)).toBe(true)
      }
    })

    it('should maintain data integrity after many operations', () => {
      // Unlock many insects
      for (let i = 0; i < 50; i++) {
        encyclopediaManager.unlockInsect(`insect-${i}`)
      }

      // Try to unlock duplicates
      for (let i = 0; i < 50; i++) {
        encyclopediaManager.unlockInsect(`insect-${i}`)
      }

      expect(encyclopediaManager.getUnlockedCount()).toBe(50)

      // Reset and unlock different set
      encyclopediaManager.reset()
      for (let i = 50; i < 100; i++) {
        encyclopediaManager.unlockInsect(`insect-${i}`)
      }

      expect(encyclopediaManager.getUnlockedCount()).toBe(50)

      // Verify old insects are not unlocked
      expect(encyclopediaManager.isUnlocked('insect-0')).toBe(false)
      // Verify new insects are unlocked
      expect(encyclopediaManager.isUnlocked('insect-50')).toBe(true)
    })
  })
})
