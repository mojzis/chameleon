import { describe, it, expect, beforeEach } from 'vitest'
import { ScoreManager } from '../../game/managers/ScoreManager'

describe('ScoreManager', () => {
  let scoreManager: ScoreManager

  beforeEach(() => {
    scoreManager = new ScoreManager()
  })

  describe('constructor', () => {
    it('should initialize with zero score', () => {
      expect(scoreManager.getScore()).toBe(0)
    })

    it('should initialize with zero accuracy', () => {
      expect(scoreManager.getAccuracy()).toBe(0)
    })
  })

  describe('addScore', () => {
    it('should add points to the score', () => {
      scoreManager.addScore(10)
      expect(scoreManager.getScore()).toBe(10)
    })

    it('should accumulate points correctly', () => {
      scoreManager.addScore(10)
      scoreManager.addScore(20)
      scoreManager.addScore(30)
      expect(scoreManager.getScore()).toBe(60)
    })

    it('should handle negative scores', () => {
      scoreManager.addScore(100)
      scoreManager.addScore(-20)
      expect(scoreManager.getScore()).toBe(80)
    })

    it('should handle zero points', () => {
      scoreManager.addScore(0)
      expect(scoreManager.getScore()).toBe(0)
    })

    it('should handle large numbers', () => {
      scoreManager.addScore(999999)
      expect(scoreManager.getScore()).toBe(999999)
    })
  })

  describe('recordCorrect', () => {
    it('should increment correct answers', () => {
      scoreManager.recordCorrect()
      expect(scoreManager.getAccuracy()).toBe(100)
    })

    it('should increment total answers', () => {
      scoreManager.recordCorrect()
      scoreManager.recordIncorrect()
      expect(scoreManager.getAccuracy()).toBe(50)
    })

    it('should add 10 points to score', () => {
      const initialScore = scoreManager.getScore()
      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(initialScore + 10)
    })

    it('should handle multiple correct answers', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(30)
      expect(scoreManager.getAccuracy()).toBe(100)
    })
  })

  describe('recordIncorrect', () => {
    it('should not change the score', () => {
      const initialScore = scoreManager.getScore()
      scoreManager.recordIncorrect()
      expect(scoreManager.getScore()).toBe(initialScore)
    })

    it('should increment total answers', () => {
      scoreManager.recordIncorrect()
      expect(scoreManager.getAccuracy()).toBe(0)
    })

    it('should decrease accuracy', () => {
      scoreManager.recordCorrect()
      expect(scoreManager.getAccuracy()).toBe(100)

      scoreManager.recordIncorrect()
      expect(scoreManager.getAccuracy()).toBe(50)
    })

    it('should handle multiple incorrect answers', () => {
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      expect(scoreManager.getScore()).toBe(0)
      expect(scoreManager.getAccuracy()).toBe(0)
    })
  })

  describe('getScore', () => {
    it('should return current score', () => {
      expect(scoreManager.getScore()).toBe(0)
      scoreManager.addScore(50)
      expect(scoreManager.getScore()).toBe(50)
    })

    it('should reflect changes from recordCorrect', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(20)
    })
  })

  describe('getAccuracy', () => {
    it('should return 0 when no answers recorded', () => {
      expect(scoreManager.getAccuracy()).toBe(0)
    })

    it('should return 100 for all correct answers', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      expect(scoreManager.getAccuracy()).toBe(100)
    })

    it('should return 0 for all incorrect answers', () => {
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      expect(scoreManager.getAccuracy()).toBe(0)
    })

    it('should calculate accuracy correctly for mixed results', () => {
      scoreManager.recordCorrect() // 1/1 = 100%
      expect(scoreManager.getAccuracy()).toBe(100)

      scoreManager.recordIncorrect() // 1/2 = 50%
      expect(scoreManager.getAccuracy()).toBe(50)

      scoreManager.recordCorrect() // 2/3 = 66.666...%
      expect(scoreManager.getAccuracy()).toBeCloseTo(66.67, 1)

      scoreManager.recordCorrect() // 3/4 = 75%
      expect(scoreManager.getAccuracy()).toBe(75)
    })

    it('should return accuracy as a percentage (0-100)', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.recordIncorrect()

      const accuracy = scoreManager.getAccuracy()
      expect(accuracy).toBeGreaterThanOrEqual(0)
      expect(accuracy).toBeLessThanOrEqual(100)
    })
  })

  describe('reset', () => {
    it('should reset score to zero', () => {
      scoreManager.addScore(100)
      scoreManager.reset()
      expect(scoreManager.getScore()).toBe(0)
    })

    it('should reset accuracy to zero', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.reset()
      expect(scoreManager.getAccuracy()).toBe(0)
    })

    it('should reset all counters', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.recordIncorrect()
      scoreManager.addScore(50)

      scoreManager.reset()

      expect(scoreManager.getScore()).toBe(0)
      expect(scoreManager.getAccuracy()).toBe(0)
    })

    it('should allow score to be built up again after reset', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.reset()

      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(10)
      expect(scoreManager.getAccuracy()).toBe(100)
    })
  })

  describe('integration tests', () => {
    it('should handle a typical game session', () => {
      // Start of game
      expect(scoreManager.getScore()).toBe(0)
      expect(scoreManager.getAccuracy()).toBe(0)

      // First question - correct
      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(10)
      expect(scoreManager.getAccuracy()).toBe(100)

      // Second question - correct
      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(20)
      expect(scoreManager.getAccuracy()).toBe(100)

      // Third question - incorrect
      scoreManager.recordIncorrect()
      expect(scoreManager.getScore()).toBe(20)
      expect(scoreManager.getAccuracy()).toBeCloseTo(66.67, 1)

      // Fourth question - correct
      scoreManager.recordCorrect()
      expect(scoreManager.getScore()).toBe(30)
      expect(scoreManager.getAccuracy()).toBe(75)
    })

    it('should handle score additions between answer recordings', () => {
      scoreManager.recordCorrect() // +10
      scoreManager.addScore(5) // bonus
      scoreManager.recordCorrect() // +10
      scoreManager.addScore(10) // combo bonus

      expect(scoreManager.getScore()).toBe(35)
      expect(scoreManager.getAccuracy()).toBe(100)
    })

    it('should maintain accuracy independently of manual score additions', () => {
      scoreManager.recordCorrect()
      scoreManager.addScore(100) // Manual addition shouldn't affect accuracy
      scoreManager.recordIncorrect()

      expect(scoreManager.getScore()).toBe(110) // 10 from correct + 100 manual
      expect(scoreManager.getAccuracy()).toBe(50) // 1 correct out of 2 total
    })
  })

  describe('edge cases', () => {
    it('should handle fractional accuracy percentages', () => {
      scoreManager.recordCorrect()
      scoreManager.recordCorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()
      scoreManager.recordIncorrect()

      // 2 correct out of 9 = 22.222...%
      expect(scoreManager.getAccuracy()).toBeCloseTo(22.22, 1)
    })

    it('should handle very large numbers of answers', () => {
      for (let i = 0; i < 1000; i++) {
        scoreManager.recordCorrect()
      }

      expect(scoreManager.getScore()).toBe(10000)
      expect(scoreManager.getAccuracy()).toBe(100)
    })

    it('should handle alternating correct and incorrect answers', () => {
      for (let i = 0; i < 50; i++) {
        scoreManager.recordCorrect()
        scoreManager.recordIncorrect()
      }

      expect(scoreManager.getScore()).toBe(500) // 50 correct * 10 points
      expect(scoreManager.getAccuracy()).toBe(50) // 50 correct out of 100 total
    })
  })
})
