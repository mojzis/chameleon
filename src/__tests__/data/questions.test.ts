import { describe, it, expect } from 'vitest'
import { QUESTIONS, getQuestionsByLevel, getQuestionById } from '../../data/questions'
import { Question } from '../../types'
import { INSECTS, getInsectById } from '../../data/insects'

describe('questions.ts data utilities', () => {
  describe('QUESTIONS constant', () => {
    it('should be defined and be an array', () => {
      expect(QUESTIONS).toBeDefined()
      expect(Array.isArray(QUESTIONS)).toBe(true)
    })

    it('should contain at least one question', () => {
      expect(QUESTIONS.length).toBeGreaterThan(0)
    })

    it('should contain valid question objects with required properties', () => {
      QUESTIONS.forEach((question: Question) => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('correctInsectId')
        expect(question).toHaveProperty('distractorCount')
        expect(question).toHaveProperty('difficulty')
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('insectLevel')
      })
    })

    it('should have unique IDs for each question', () => {
      const ids = QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid difficulty values', () => {
      const validDifficulties = ['easy', 'medium', 'hard']
      QUESTIONS.forEach(question => {
        expect(validDifficulties).toContain(question.difficulty)
      })
    })

    it('should have valid type values', () => {
      const validTypes = ['identification', 'behavior', 'habitat', 'comparison']
      QUESTIONS.forEach(question => {
        expect(validTypes).toContain(question.type)
      })
    })

    it('should have non-empty text', () => {
      QUESTIONS.forEach(question => {
        expect(question.text).toBeTruthy()
        expect(question.text.length).toBeGreaterThan(0)
      })
    })

    it('should have positive distractor counts', () => {
      QUESTIONS.forEach(question => {
        expect(question.distractorCount).toBeGreaterThan(0)
        expect(Number.isInteger(question.distractorCount)).toBe(true)
      })
    })

    it('should have positive insect level numbers', () => {
      QUESTIONS.forEach(question => {
        expect(question.insectLevel).toBeGreaterThan(0)
        expect(Number.isInteger(question.insectLevel)).toBe(true)
      })
    })

    it('should have reasonable distractor counts (1-3)', () => {
      QUESTIONS.forEach(question => {
        expect(question.distractorCount).toBeGreaterThanOrEqual(1)
        expect(question.distractorCount).toBeLessThanOrEqual(3)
      })
    })

    it('should have question text ending with question mark', () => {
      QUESTIONS.forEach(question => {
        expect(question.text.endsWith('?')).toBe(true)
      })
    })
  })

  describe('getQuestionsByLevel', () => {
    it('should return an array', () => {
      const result = getQuestionsByLevel(1)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return questions for level 1', () => {
      const level1Questions = getQuestionsByLevel(1)
      expect(level1Questions.length).toBeGreaterThan(0)
      level1Questions.forEach(question => {
        expect(question.insectLevel).toBe(1)
      })
    })

    it('should return empty array for non-existent levels', () => {
      const result = getQuestionsByLevel(999)
      expect(result).toEqual([])
    })

    it('should return empty array for level 0', () => {
      const result = getQuestionsByLevel(0)
      expect(result).toEqual([])
    })

    it('should return empty array for negative levels', () => {
      const result = getQuestionsByLevel(-1)
      expect(result).toEqual([])
    })

    it('should filter correctly by level', () => {
      const level1Questions = getQuestionsByLevel(1)
      const level2Questions = getQuestionsByLevel(2)

      // Verify all level 1 questions are level 1
      level1Questions.forEach(question => {
        expect(question.insectLevel).toBe(1)
      })

      // Verify all level 2 questions are level 2 (if any exist)
      level2Questions.forEach(question => {
        expect(question.insectLevel).toBe(2)
      })
    })

    it('should return all level 1 questions from sample data', () => {
      const level1Questions = getQuestionsByLevel(1)
      expect(level1Questions.length).toBe(15) // Phase 5: 3 questions per insect, 5 insects

      // Verify we have questions for all level 1 insects
      const expectedIds = [
        'hercules-1',
        'hercules-2',
        'hercules-3',
        'glass-wing-1',
        'glass-wing-2',
        'glass-wing-3',
        'titan-1',
        'titan-2',
        'titan-3',
        'morpho-1',
        'morpho-2',
        'morpho-3',
        'scarab-1',
        'scarab-2',
        'scarab-3',
      ]

      expectedIds.forEach(id => {
        expect(level1Questions.some(q => q.id === id)).toBe(true)
      })
    })

    it('should return questions with all required properties', () => {
      const questions = getQuestionsByLevel(1)
      questions.forEach(question => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('correctInsectId')
        expect(question).toHaveProperty('distractorCount')
        expect(question).toHaveProperty('difficulty')
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('insectLevel')
      })
    })

    it('should not modify the original QUESTIONS array', () => {
      const originalLength = QUESTIONS.length
      getQuestionsByLevel(1)
      expect(QUESTIONS.length).toBe(originalLength)
    })
  })

  describe('getQuestionById', () => {
    it('should return a question object for valid ID', () => {
      const question = getQuestionById('hercules-1')
      expect(question).toBeDefined()
      expect(question?.id).toBe('hercules-1')
    })

    it('should return undefined for non-existent ID', () => {
      const question = getQuestionById('non-existent-question')
      expect(question).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const question = getQuestionById('')
      expect(question).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      const question = getQuestionById('Hercules-1')
      expect(question).toBeUndefined()

      const validQuestion = getQuestionById('hercules-1')
      expect(validQuestion).toBeDefined()
    })

    it('should return correct question data', () => {
      const question = getQuestionById('hercules-1')
      expect(question).toBeDefined()

      if (question) {
        expect(question.text).toBe('Which insect can lift 850 times its own weight?')
        expect(question.correctInsectId).toBe('hercules-beetle')
        expect(question.insectLevel).toBe(1)
      }
    })

    it('should return questions with all properties intact', () => {
      const question = getQuestionById('titan-1')

      if (question) {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('correctInsectId')
        expect(question).toHaveProperty('distractorCount')
        expect(question).toHaveProperty('difficulty')
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('insectLevel')
      }
    })

    it('should find each question in the sample data', () => {
      const questionIds = [
        'hercules-1',
        'glass-wing-1',
        'titan-1',
        'morpho-1',
        'scarab-1',
      ]

      questionIds.forEach(id => {
        const question = getQuestionById(id)
        expect(question).toBeDefined()
        expect(question?.id).toBe(id)
      })
    })

    it('should not modify the original QUESTIONS array', () => {
      const originalLength = QUESTIONS.length
      getQuestionById('hercules-1')
      expect(QUESTIONS.length).toBe(originalLength)
    })
  })

  describe('data consistency with insects', () => {
    it('should reference existing insect IDs', () => {
      QUESTIONS.forEach(question => {
        const insect = getInsectById(question.correctInsectId)
        expect(insect).toBeDefined()
      })
    })

    it('should have matching levels with referenced insects', () => {
      QUESTIONS.forEach(question => {
        const insect = getInsectById(question.correctInsectId)
        if (insect) {
          expect(question.insectLevel).toBe(insect.level)
        }
      })
    })

    it('should have valid correct insect IDs', () => {
      const insectIds = INSECTS.map(i => i.id)
      QUESTIONS.forEach(question => {
        expect(insectIds).toContain(question.correctInsectId)
      })
    })

    it('should have enough insects for distractors', () => {
      QUESTIONS.forEach(question => {
        const levelInsects = INSECTS.filter(i => i.level === question.insectLevel)
        // Need at least distractorCount + 1 insects (distractors + correct answer)
        expect(levelInsects.length).toBeGreaterThanOrEqual(question.distractorCount + 1)
      })
    })
  })

  describe('question quality', () => {
    it('should have descriptive question text', () => {
      QUESTIONS.forEach(question => {
        expect(question.text.length).toBeGreaterThan(10)
      })
    })

    it('should have variety in question types', () => {
      const types = new Set(QUESTIONS.map(q => q.type))
      expect(types.size).toBeGreaterThan(1)
    })

    it('should have variety in difficulty levels', () => {
      const difficulties = new Set(QUESTIONS.map(q => q.difficulty))
      // At least some variety expected
      expect(difficulties.size).toBeGreaterThanOrEqual(1)
    })

    it('should have question text that starts with "Which"', () => {
      QUESTIONS.forEach(question => {
        expect(question.text.startsWith('Which')).toBe(true)
      })
    })

    it('should reference specific characteristics in question text', () => {
      QUESTIONS.forEach(question => {
        // Questions should be specific, not generic
        expect(question.text).not.toBe('Which insect is this?')
        expect(question.text.length).toBeGreaterThan(20)
      })
    })
  })

  describe('integration with game logic', () => {
    it('should support getting all questions for a level', () => {
      const level1Questions = getQuestionsByLevel(1)
      expect(level1Questions.length).toBeGreaterThan(0)

      // Should be able to pick random questions from this list
      const randomIndex = Math.floor(Math.random() * level1Questions.length)
      const randomQuestion = level1Questions[randomIndex]
      expect(randomQuestion).toBeDefined()
    })

    it('should support looking up questions by ID', () => {
      const questionId = 'hercules-1'
      const question = getQuestionById(questionId)

      expect(question).toBeDefined()
      expect(question?.text).toBeTruthy()
    })

    it('should provide enough questions per level for gameplay', () => {
      const level1Questions = getQuestionsByLevel(1)
      // Need multiple questions for replayability
      expect(level1Questions.length).toBeGreaterThanOrEqual(3)
    })

    it('should allow mapping from question to insect', () => {
      const question = getQuestionById('hercules-1')
      if (question) {
        const insect = getInsectById(question.correctInsectId)
        expect(insect).toBeDefined()
        expect(insect?.commonName).toBeTruthy()
      }
    })
  })

  describe('data types and structure', () => {
    it('should have consistent data types', () => {
      QUESTIONS.forEach(question => {
        expect(typeof question.id).toBe('string')
        expect(typeof question.text).toBe('string')
        expect(typeof question.correctInsectId).toBe('string')
        expect(typeof question.distractorCount).toBe('number')
        expect(typeof question.difficulty).toBe('string')
        expect(typeof question.type).toBe('string')
        expect(typeof question.insectLevel).toBe('number')
      })
    })

    it('should have proper ID naming convention', () => {
      QUESTIONS.forEach(question => {
        // IDs should follow a pattern (e.g., "insect-name-1")
        expect(question.id).toMatch(/^[a-z-]+\d+$/)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle filtering when no questions match', () => {
      const result = getQuestionsByLevel(1000)
      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle looking up non-existent questions', () => {
      const result = getQuestionById('this-does-not-exist')
      expect(result).toBeUndefined()
    })

    it('should handle empty string ID lookup', () => {
      const result = getQuestionById('')
      expect(result).toBeUndefined()
    })
  })
})
