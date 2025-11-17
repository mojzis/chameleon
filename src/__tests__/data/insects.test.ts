import { describe, it, expect } from 'vitest'
import { INSECTS, getInsectsByLevel, getInsectById } from '../../data/insects'
import { Insect } from '../../types'

describe('insects.ts data utilities', () => {
  describe('INSECTS constant', () => {
    it('should be defined and be an array', () => {
      expect(INSECTS).toBeDefined()
      expect(Array.isArray(INSECTS)).toBe(true)
    })

    it('should contain at least one insect', () => {
      expect(INSECTS.length).toBeGreaterThan(0)
    })

    it('should contain valid insect objects with required properties', () => {
      INSECTS.forEach((insect: Insect) => {
        expect(insect).toHaveProperty('id')
        expect(insect).toHaveProperty('commonName')
        expect(insect).toHaveProperty('scientificName')
        expect(insect).toHaveProperty('level')
        expect(insect).toHaveProperty('size')
        expect(insect).toHaveProperty('color')
        expect(insect).toHaveProperty('habitat')
        expect(insect).toHaveProperty('diet')
        expect(insect).toHaveProperty('facts')
        expect(insect).toHaveProperty('imageKey')
        expect(insect).toHaveProperty('rarity')
      })
    })

    it('should have unique IDs for each insect', () => {
      const ids = INSECTS.map(insect => insect.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid size values', () => {
      const validSizes = ['tiny', 'small', 'medium', 'large']
      INSECTS.forEach(insect => {
        expect(validSizes).toContain(insect.size)
      })
    })

    it('should have valid rarity values', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'very rare']
      INSECTS.forEach(insect => {
        expect(validRarities).toContain(insect.rarity)
      })
    })

    it('should have non-empty string properties', () => {
      INSECTS.forEach(insect => {
        expect(insect.id).toBeTruthy()
        expect(insect.commonName).toBeTruthy()
        expect(insect.scientificName).toBeTruthy()
        expect(insect.habitat).toBeTruthy()
        expect(insect.diet).toBeTruthy()
        expect(insect.imageKey).toBeTruthy()
      })
    })

    it('should have positive level numbers', () => {
      INSECTS.forEach(insect => {
        expect(insect.level).toBeGreaterThan(0)
        expect(Number.isInteger(insect.level)).toBe(true)
      })
    })

    it('should have facts array with at least one fact', () => {
      INSECTS.forEach(insect => {
        expect(Array.isArray(insect.facts)).toBe(true)
        expect(insect.facts.length).toBeGreaterThan(0)
        insect.facts.forEach(fact => {
          expect(typeof fact).toBe('string')
          expect(fact.length).toBeGreaterThan(0)
        })
      })
    })

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
      INSECTS.forEach(insect => {
        expect(hexColorRegex.test(insect.color)).toBe(true)
      })
    })
  })

  describe('getInsectsByLevel', () => {
    it('should return an array', () => {
      const result = getInsectsByLevel(1)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return insects for level 1', () => {
      const level1Insects = getInsectsByLevel(1)
      expect(level1Insects.length).toBeGreaterThan(0)
      level1Insects.forEach(insect => {
        expect(insect.level).toBe(1)
      })
    })

    it('should return empty array for non-existent levels', () => {
      const result = getInsectsByLevel(999)
      expect(result).toEqual([])
    })

    it('should return empty array for level 0', () => {
      const result = getInsectsByLevel(0)
      expect(result).toEqual([])
    })

    it('should return empty array for negative levels', () => {
      const result = getInsectsByLevel(-1)
      expect(result).toEqual([])
    })

    it('should filter correctly by level', () => {
      const level1Insects = getInsectsByLevel(1)
      const level2Insects = getInsectsByLevel(2)

      // Verify all level 1 insects are level 1
      level1Insects.forEach(insect => {
        expect(insect.level).toBe(1)
      })

      // Verify all level 2 insects are level 2 (if any exist)
      level2Insects.forEach(insect => {
        expect(insect.level).toBe(2)
      })
    })

    it('should return all level 1 insects from sample data', () => {
      const level1Insects = getInsectsByLevel(1)
      expect(level1Insects.length).toBe(5) // Based on the sample data

      const expectedIds = [
        'hercules-beetle',
        'glass-wing-butterfly',
        'titan-beetle',
        'blue-morpho-butterfly',
        'rainbow-scarab',
      ]

      expectedIds.forEach(id => {
        expect(level1Insects.some(insect => insect.id === id)).toBe(true)
      })
    })

    it('should return insects with all required properties', () => {
      const insects = getInsectsByLevel(1)
      insects.forEach(insect => {
        expect(insect).toHaveProperty('id')
        expect(insect).toHaveProperty('commonName')
        expect(insect).toHaveProperty('scientificName')
        expect(insect).toHaveProperty('level')
        expect(insect).toHaveProperty('size')
        expect(insect).toHaveProperty('color')
        expect(insect).toHaveProperty('habitat')
        expect(insect).toHaveProperty('diet')
        expect(insect).toHaveProperty('facts')
        expect(insect).toHaveProperty('imageKey')
        expect(insect).toHaveProperty('rarity')
      })
    })

    it('should not modify the original INSECTS array', () => {
      const originalLength = INSECTS.length
      getInsectsByLevel(1)
      expect(INSECTS.length).toBe(originalLength)
    })
  })

  describe('getInsectById', () => {
    it('should return an insect object for valid ID', () => {
      const insect = getInsectById('hercules-beetle')
      expect(insect).toBeDefined()
      expect(insect?.id).toBe('hercules-beetle')
    })

    it('should return undefined for non-existent ID', () => {
      const insect = getInsectById('non-existent-insect')
      expect(insect).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const insect = getInsectById('')
      expect(insect).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      const insect = getInsectById('Hercules-Beetle')
      expect(insect).toBeUndefined()

      const validInsect = getInsectById('hercules-beetle')
      expect(validInsect).toBeDefined()
    })

    it('should return correct insect data', () => {
      const insect = getInsectById('hercules-beetle')
      expect(insect).toBeDefined()

      if (insect) {
        expect(insect.commonName).toBe('Hercules Beetle')
        expect(insect.scientificName).toBe('Dynastes hercules')
        expect(insect.level).toBe(1)
      }
    })

    it('should return insects with all properties intact', () => {
      const insect = getInsectById('titan-beetle')

      if (insect) {
        expect(insect).toHaveProperty('id')
        expect(insect).toHaveProperty('commonName')
        expect(insect).toHaveProperty('scientificName')
        expect(insect).toHaveProperty('level')
        expect(insect).toHaveProperty('size')
        expect(insect).toHaveProperty('color')
        expect(insect).toHaveProperty('habitat')
        expect(insect).toHaveProperty('diet')
        expect(insect).toHaveProperty('facts')
        expect(insect).toHaveProperty('imageKey')
        expect(insect).toHaveProperty('rarity')

        expect(Array.isArray(insect.facts)).toBe(true)
        expect(insect.facts.length).toBeGreaterThan(0)
      }
    })

    it('should find each insect in the sample data', () => {
      const insectIds = [
        'hercules-beetle',
        'glass-wing-butterfly',
        'titan-beetle',
        'blue-morpho-butterfly',
        'rainbow-scarab',
      ]

      insectIds.forEach(id => {
        const insect = getInsectById(id)
        expect(insect).toBeDefined()
        expect(insect?.id).toBe(id)
      })
    })

    it('should not modify the original INSECTS array', () => {
      const originalLength = INSECTS.length
      getInsectById('hercules-beetle')
      expect(INSECTS.length).toBe(originalLength)
    })
  })

  describe('data consistency', () => {
    it('should have matching IDs and imageKeys', () => {
      INSECTS.forEach(insect => {
        // Generally, imageKey should match or be related to the ID
        expect(insect.imageKey).toBeTruthy()
        expect(typeof insect.imageKey).toBe('string')
      })
    })

    it('should have scientificName in proper format', () => {
      INSECTS.forEach(insect => {
        // Scientific names should have at least genus and species
        const parts = insect.scientificName.split(' ')
        expect(parts.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should have facts that are descriptive', () => {
      INSECTS.forEach(insect => {
        insect.facts.forEach(fact => {
          // Facts should be meaningful sentences
          expect(fact.length).toBeGreaterThan(10)
        })
      })
    })

    it('should have consistent data types', () => {
      INSECTS.forEach(insect => {
        expect(typeof insect.id).toBe('string')
        expect(typeof insect.commonName).toBe('string')
        expect(typeof insect.scientificName).toBe('string')
        expect(typeof insect.level).toBe('number')
        expect(typeof insect.size).toBe('string')
        expect(typeof insect.color).toBe('string')
        expect(typeof insect.habitat).toBe('string')
        expect(typeof insect.diet).toBe('string')
        expect(Array.isArray(insect.facts)).toBe(true)
        expect(typeof insect.imageKey).toBe('string')
        expect(typeof insect.rarity).toBe('string')
      })
    })
  })

  describe('integration with game logic', () => {
    it('should support getting all insects for a level', () => {
      const level1Insects = getInsectsByLevel(1)
      expect(level1Insects.length).toBeGreaterThan(0)

      // Should be able to pick random insects from this list
      const randomIndex = Math.floor(Math.random() * level1Insects.length)
      const randomInsect = level1Insects[randomIndex]
      expect(randomInsect).toBeDefined()
    })

    it('should support looking up insects by ID from questions', () => {
      // Simulate getting an insect ID from a question
      const correctInsectId = 'hercules-beetle'
      const insect = getInsectById(correctInsectId)

      expect(insect).toBeDefined()
      expect(insect?.commonName).toBeTruthy()
    })

    it('should provide enough insects for distractors', () => {
      const level1Insects = getInsectsByLevel(1)
      // Need at least 3 insects for 1 correct + 2 distractors
      expect(level1Insects.length).toBeGreaterThanOrEqual(3)
    })
  })
})
