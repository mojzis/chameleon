export interface Insect {
  id: string
  commonName: string
  scientificName: string
  level: number
  size: 'tiny' | 'small' | 'medium' | 'large'
  color: string
  habitat: string
  diet: string
  facts: string[]
  imageKey: string
  rarity: 'common' | 'uncommon' | 'rare' | 'very rare'
}

export interface Question {
  id: string
  text: string
  correctInsectId: string
  distractorCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'identification' | 'behavior' | 'habitat' | 'comparison'
  insectLevel: number
}

export interface GameState {
  currentLevel: number
  score: number
  helpUsed: number
  helpRemaining: number
  strikes: number
  insectsCaught: string[]
  unlockedInsects: string[]
}

export interface PointCoords {
  x: number
  y: number
}
