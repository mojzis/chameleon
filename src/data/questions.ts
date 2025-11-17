import { Question } from '../types'

// Placeholder questions - will be fully populated in Phase 5
export const QUESTIONS: Question[] = [
  {
    id: 'hercules-1',
    text: 'Which insect can lift 850 times its own weight?',
    correctInsectId: 'hercules-beetle',
    distractorCount: 2,
    difficulty: 'easy',
    type: 'identification',
    insectLevel: 1,
  },
  {
    id: 'glass-wing-1',
    text: 'Which insect has wings you can see through?',
    correctInsectId: 'glass-wing-butterfly',
    distractorCount: 2,
    difficulty: 'easy',
    type: 'identification',
    insectLevel: 1,
  },
  {
    id: 'titan-1',
    text: 'Which beetle can snap a pencil with its jaws?',
    correctInsectId: 'titan-beetle',
    distractorCount: 2,
    difficulty: 'easy',
    type: 'behavior',
    insectLevel: 1,
  },
  {
    id: 'morpho-1',
    text: 'Which butterfly\'s blue color comes from reflected light?',
    correctInsectId: 'blue-morpho-butterfly',
    distractorCount: 2,
    difficulty: 'medium',
    type: 'behavior',
    insectLevel: 1,
  },
  {
    id: 'scarab-1',
    text: 'Which beetle shines like a rainbow?',
    correctInsectId: 'rainbow-scarab',
    distractorCount: 2,
    difficulty: 'easy',
    type: 'identification',
    insectLevel: 1,
  },
]

export function getQuestionsByLevel(level: number): Question[] {
  return QUESTIONS.filter(q => q.insectLevel === level)
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find(q => q.id === id)
}
