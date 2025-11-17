import { Insect } from '../types'

export const INSECTS: Insect[] = [
  // Placeholder insects - will be fully populated in Phase 5
  {
    id: 'hercules-beetle',
    commonName: 'Hercules Beetle',
    scientificName: 'Dynastes hercules',
    level: 1,
    size: 'large',
    color: '#4A7BA7',
    habitat: 'forest floor',
    diet: 'fruit, sap',
    facts: [
      'This incredible beetle can lift 850 times its own weight!',
      'Male hercules beetles have giant horns for fighting.',
      'Hercules beetles can grow up to 7 inches long.',
    ],
    imageKey: 'hercules-beetle',
    rarity: 'uncommon',
  },
  {
    id: 'glass-wing-butterfly',
    commonName: 'Glass-winged Butterfly',
    scientificName: 'Greta oto',
    level: 1,
    size: 'medium',
    color: '#B8A8E8',
    habitat: 'canopy',
    diet: 'plant nectar',
    facts: [
      'Wings are completely transparent!',
      'You can see right through this butterfly\'s wings.',
      'Glass-wing butterflies can fly up to 12 km per day.',
    ],
    imageKey: 'glass-wing-butterfly',
    rarity: 'uncommon',
  },
  {
    id: 'titan-beetle',
    commonName: 'Titan Beetle',
    scientificName: 'Titanus giganteus',
    level: 1,
    size: 'large',
    color: '#4A7BA7',
    habitat: 'forest floor',
    diet: 'wood',
    facts: [
      'Titan beetles are the largest beetles in the Amazon!',
      'They can snap a pencil with their strong jaws.',
      'Adult titan beetles don\'t eat at all.',
    ],
    imageKey: 'titan-beetle',
    rarity: 'rare',
  },
  {
    id: 'blue-morpho-butterfly',
    commonName: 'Blue Morpho Butterfly',
    scientificName: 'Morpho menelaus',
    level: 1,
    size: 'medium',
    color: '#B8A8E8',
    habitat: 'canopy',
    diet: 'fruit, water',
    facts: [
      'Blue Morpho butterflies shine like the sky!',
      'Their blue color comes from reflected light, not pigment.',
      'Blue Morpho wings can span up to 8 inches wide.',
    ],
    imageKey: 'blue-morpho-butterfly',
    rarity: 'uncommon',
  },
  {
    id: 'rainbow-scarab',
    commonName: 'Rainbow Scarab',
    scientificName: 'Phanaeus vindex',
    level: 1,
    size: 'small',
    color: '#4A7BA7',
    habitat: 'forest floor',
    diet: 'waste',
    facts: [
      'Rainbow scarabs shine like a rainbow!',
      'They help the forest by eating waste.',
      'These beetles have shimmering metallic colors.',
    ],
    imageKey: 'rainbow-scarab',
    rarity: 'common',
  },
]

export function getInsectsByLevel(level: number): Insect[] {
  return INSECTS.filter(insect => insect.level === level)
}

export function getInsectById(id: string): Insect | undefined {
  return INSECTS.find(insect => insect.id === id)
}
