import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LevelProgressManager } from '../../game/managers/LevelProgressManager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('LevelProgressManager', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('initialization', () => {
    it('should initialize with default progress when no saved data', () => {
      const manager = new LevelProgressManager()

      expect(manager.isLevelUnlocked(1)).toBe(true)
      expect(manager.isLevelUnlocked(2)).toBe(false)
      expect(manager.getCurrentLevel()).toBe(1)
      expect(manager.getCompletionPercentage()).toBe(0)
    })

    it('should load saved progress from localStorage', () => {
      // Pre-populate localStorage
      const savedProgress = {
        levels: {
          1: {
            level: 1,
            completed: true,
            bestScore: 100,
            bestAccuracy: 95,
            insectsDiscovered: ['hercules-beetle'],
            timesPlayed: 2,
            helpUsed: 1,
          },
          2: {
            level: 2,
            completed: false,
            bestScore: 0,
            bestAccuracy: 0,
            insectsDiscovered: [],
            timesPlayed: 0,
            helpUsed: 0,
          },
          3: {
            level: 3,
            completed: false,
            bestScore: 0,
            bestAccuracy: 0,
            insectsDiscovered: [],
            timesPlayed: 0,
            helpUsed: 0,
          },
          4: {
            level: 4,
            completed: false,
            bestScore: 0,
            bestAccuracy: 0,
            insectsDiscovered: [],
            timesPlayed: 0,
            helpUsed: 0,
          },
          5: {
            level: 5,
            completed: false,
            bestScore: 0,
            bestAccuracy: 0,
            insectsDiscovered: [],
            timesPlayed: 0,
            helpUsed: 0,
          },
        },
        currentLevel: 2,
        totalInsectsDiscovered: ['hercules-beetle'],
      }
      localStorageMock.setItem(
        'chameleon-quest-progress',
        JSON.stringify(savedProgress)
      )

      const manager = new LevelProgressManager()

      expect(manager.isLevelUnlocked(1)).toBe(true)
      expect(manager.isLevelUnlocked(2)).toBe(true)
      expect(manager.isLevelUnlocked(3)).toBe(false)
      expect(manager.getCurrentLevel()).toBe(2)
      expect(manager.getLevelProgress(1)?.completed).toBe(true)
      expect(manager.getLevelProgress(1)?.bestScore).toBe(100)
    })
  })

  describe('level unlocking', () => {
    it('should always have level 1 unlocked', () => {
      const manager = new LevelProgressManager()
      expect(manager.isLevelUnlocked(1)).toBe(true)
    })

    it('should unlock level 2 when level 1 is completed', () => {
      const manager = new LevelProgressManager()

      expect(manager.isLevelUnlocked(2)).toBe(false)

      manager.completeLevel(1, 100, 90, ['hercules-beetle'], 1)

      expect(manager.isLevelUnlocked(2)).toBe(true)
      expect(manager.isLevelUnlocked(3)).toBe(false)
    })

    it('should return all unlocked levels in order', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 90, ['hercules-beetle'], 1)
      manager.completeLevel(2, 120, 85, ['leafcutter-ant'], 2)

      const unlocked = manager.getUnlockedLevels()
      expect(unlocked).toEqual([1, 2, 3])
    })
  })

  describe('level completion', () => {
    it('should mark level as completed and update stats', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 150, 95, ['hercules-beetle', 'titan-beetle'], 2)

      const progress = manager.getLevelProgress(1)
      expect(progress?.completed).toBe(true)
      expect(progress?.bestScore).toBe(150)
      expect(progress?.bestAccuracy).toBe(95)
      expect(progress?.insectsDiscovered).toContain('hercules-beetle')
      expect(progress?.insectsDiscovered).toContain('titan-beetle')
      expect(progress?.helpUsed).toBe(2)
    })

    it('should update best score when new score is higher', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 80, ['hercules-beetle'], 1)
      manager.completeLevel(1, 150, 90, ['titan-beetle'], 0)

      const progress = manager.getLevelProgress(1)
      expect(progress?.bestScore).toBe(150)
      expect(progress?.bestAccuracy).toBe(90)
      expect(progress?.helpUsed).toBe(1) // Cumulative
    })

    it('should not downgrade best score', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 150, 90, ['hercules-beetle'], 1)
      manager.completeLevel(1, 100, 85, ['titan-beetle'], 2)

      const progress = manager.getLevelProgress(1)
      expect(progress?.bestScore).toBe(150)
      expect(progress?.bestAccuracy).toBe(90)
    })

    it('should track discovered insects across multiple plays', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 80, ['hercules-beetle'], 1)
      manager.completeLevel(1, 120, 85, ['titan-beetle', 'glass-wing-butterfly'], 0)

      const progress = manager.getLevelProgress(1)
      expect(progress?.insectsDiscovered).toHaveLength(3)
      expect(progress?.insectsDiscovered).toContain('hercules-beetle')
      expect(progress?.insectsDiscovered).toContain('titan-beetle')
      expect(progress?.insectsDiscovered).toContain('glass-wing-butterfly')
    })

    it('should track globally discovered insects', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 80, ['hercules-beetle', 'titan-beetle'], 1)
      manager.completeLevel(2, 120, 85, ['leafcutter-ant'], 0)

      const allInsects = manager.getAllDiscoveredInsects()
      expect(allInsects).toHaveLength(3)
      expect(allInsects).toContain('hercules-beetle')
      expect(allInsects).toContain('titan-beetle')
      expect(allInsects).toContain('leafcutter-ant')
    })
  })

  describe('persistence', () => {
    it('should save progress to localStorage', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 90, ['hercules-beetle'], 1)

      const saved = JSON.parse(
        localStorageMock.getItem('chameleon-quest-progress') || '{}'
      )

      expect(saved.levels[1].completed).toBe(true)
      expect(saved.levels[1].bestScore).toBe(100)
      expect(saved.currentLevel).toBe(2)
    })

    it('should persist progress across manager instances', () => {
      const manager1 = new LevelProgressManager()
      manager1.completeLevel(1, 100, 90, ['hercules-beetle'], 1)

      const manager2 = new LevelProgressManager()
      expect(manager2.getLevelProgress(1)?.completed).toBe(true)
      expect(manager2.isLevelUnlocked(2)).toBe(true)
    })
  })

  describe('completion percentage', () => {
    it('should calculate completion percentage correctly', () => {
      const manager = new LevelProgressManager()

      expect(manager.getCompletionPercentage()).toBe(0)

      manager.completeLevel(1, 100, 90, ['hercules-beetle'], 1)
      expect(manager.getCompletionPercentage()).toBe(20) // 1 of 5

      manager.completeLevel(2, 120, 85, ['leafcutter-ant'], 2)
      expect(manager.getCompletionPercentage()).toBe(40) // 2 of 5

      manager.completeLevel(3, 130, 88, ['walking-stick'], 0)
      manager.completeLevel(4, 140, 92, ['railroad-worm'], 1)
      manager.completeLevel(5, 150, 95, ['assassin-bug'], 0)
      expect(manager.getCompletionPercentage()).toBe(100) // 5 of 5
    })
  })

  describe('reset', () => {
    it('should reset all progress', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 90, ['hercules-beetle'], 1)
      manager.completeLevel(2, 120, 85, ['leafcutter-ant'], 2)

      manager.resetProgress()

      expect(manager.isLevelUnlocked(2)).toBe(false)
      expect(manager.getLevelProgress(1)?.completed).toBe(false)
      expect(manager.getCompletionPercentage()).toBe(0)
      expect(manager.getAllDiscoveredInsects()).toHaveLength(0)
    })
  })

  describe('level played tracking', () => {
    it('should track times played', () => {
      const manager = new LevelProgressManager()

      manager.recordLevelPlayed(1)
      manager.recordLevelPlayed(1)
      manager.recordLevelPlayed(1)

      const progress = manager.getLevelProgress(1)
      expect(progress?.timesPlayed).toBe(3)
    })

    it('should increment times played when level is completed', () => {
      const manager = new LevelProgressManager()

      manager.completeLevel(1, 100, 90, ['hercules-beetle'], 1)

      const progress = manager.getLevelProgress(1)
      expect(progress?.timesPlayed).toBe(1)

      manager.completeLevel(1, 120, 92, ['titan-beetle'], 0)
      expect(progress?.timesPlayed).toBe(2)
    })
  })
})
