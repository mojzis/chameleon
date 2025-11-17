import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionManager } from '../../game/managers/QuestionManager'
import { QUESTIONS } from '../../data/questions'

describe('QuestionManager', () => {
  let questionManager: QuestionManager

  beforeEach(() => {
    questionManager = new QuestionManager(1)
  })

  describe('constructor', () => {
    it('should initialize with the correct level', () => {
      const manager = new QuestionManager(1)
      expect(manager).toBeDefined()
    })

    it('should load questions for the specified level', () => {
      const manager = new QuestionManager(1)
      const question = manager.getNextQuestion()
      expect(question).toBeDefined()
      expect(question?.insectLevel).toBe(1)
    })
  })

  describe('getNextQuestion', () => {
    it('should return a question object', () => {
      const question = questionManager.getNextQuestion()
      expect(question).toBeDefined()
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('text')
      expect(question).toHaveProperty('correctInsectId')
      expect(question).toHaveProperty('distractorCount')
      expect(question).toHaveProperty('difficulty')
      expect(question).toHaveProperty('type')
      expect(question).toHaveProperty('insectLevel')
    })

    it('should return questions for the current level only', () => {
      const question = questionManager.getNextQuestion()
      expect(question?.insectLevel).toBe(1)
    })

    it('should not return the same question twice in a row', () => {
      const firstQuestion = questionManager.getNextQuestion()
      const secondQuestion = questionManager.getNextQuestion()

      if (firstQuestion && secondQuestion) {
        expect(firstQuestion.id).not.toBe(secondQuestion.id)
      }
    })

    it('should mark questions as asked', () => {
      const level1Questions = QUESTIONS.filter(q => q.insectLevel === 1)
      const questionIds = new Set<string>()

      // Get all available questions for level 1
      for (let i = 0; i < level1Questions.length; i++) {
        const question = questionManager.getNextQuestion()
        if (question) {
          questionIds.add(question.id)
        }
      }

      // All questions should be unique
      expect(questionIds.size).toBe(level1Questions.length)
    })

    it('should reset and reload questions when all have been asked', () => {
      const level1Questions = QUESTIONS.filter(q => q.insectLevel === 1)

      // Exhaust all questions
      for (let i = 0; i < level1Questions.length; i++) {
        questionManager.getNextQuestion()
      }

      // Getting next question should reset and provide a question again
      const question = questionManager.getNextQuestion()
      expect(question).toBeDefined()
      expect(question?.insectLevel).toBe(1)
    })

    it('should return random questions (not always in the same order)', () => {
      // With randomization, there's a chance they could be the same
      // but over multiple iterations, they should differ
      // This is a probabilistic test
      const iterations = 10
      let differentCount = 0

      for (let i = 0; i < iterations; i++) {
        const m1 = new QuestionManager(1)
        const m2 = new QuestionManager(1)
        const question1 = m1.getNextQuestion()
        const question2 = m2.getNextQuestion()

        if (question1?.id !== question2?.id) {
          differentCount++
        }
      }

      // At least some should be different (allowing for randomness)
      expect(differentCount).toBeGreaterThan(0)
    })
  })

  describe('resetLevel', () => {
    it('should clear asked questions set', () => {
      const level1Questions = QUESTIONS.filter(q => q.insectLevel === 1)

      // Ask some questions
      questionManager.getNextQuestion()
      questionManager.getNextQuestion()

      // Reset
      questionManager.resetLevel()

      // Should be able to get all questions again
      const questionIds = new Set<string>()
      for (let i = 0; i < level1Questions.length; i++) {
        const question = questionManager.getNextQuestion()
        if (question) {
          questionIds.add(question.id)
        }
      }

      expect(questionIds.size).toBe(level1Questions.length)
    })
  })

  describe('setLevel', () => {
    it('should change to a new level', () => {
      questionManager.setLevel(2)
      const question = questionManager.getNextQuestion()

      // If there are level 2 questions, verify level
      // Otherwise, test that it handles empty question sets
      if (question) {
        expect(question.insectLevel).toBe(2)
      } else {
        // No level 2 questions exist yet
        expect(question).toBeNull()
      }
    })

    it('should reset asked questions when changing levels', () => {
      // Ask a question at level 1
      questionManager.getNextQuestion()

      // Change level and back
      questionManager.setLevel(2)
      questionManager.setLevel(1)

      // Should be able to get questions again (including the first one)
      const level1Questions = QUESTIONS.filter(q => q.insectLevel === 1)
      const questionIds = new Set<string>()

      for (let i = 0; i < level1Questions.length; i++) {
        const question = questionManager.getNextQuestion()
        if (question) {
          questionIds.add(question.id)
        }
      }

      expect(questionIds.size).toBe(level1Questions.length)
    })

    it('should load only questions for the new level', () => {
      questionManager.setLevel(1)
      const question = questionManager.getNextQuestion()

      if (question) {
        expect(question.insectLevel).toBe(1)
      }
    })
  })

  describe('question properties validation', () => {
    it('should return questions with valid difficulty levels', () => {
      const validDifficulties = ['easy', 'medium', 'hard']
      const question = questionManager.getNextQuestion()

      expect(question).toBeDefined()
      if (question) {
        expect(validDifficulties).toContain(question.difficulty)
      }
    })

    it('should return questions with valid types', () => {
      const validTypes = ['identification', 'behavior', 'habitat', 'comparison']
      const question = questionManager.getNextQuestion()

      expect(question).toBeDefined()
      if (question) {
        expect(validTypes).toContain(question.type)
      }
    })

    it('should return questions with positive distractor counts', () => {
      const question = questionManager.getNextQuestion()

      expect(question).toBeDefined()
      if (question) {
        expect(question.distractorCount).toBeGreaterThan(0)
      }
    })
  })
})
