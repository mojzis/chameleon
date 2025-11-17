export const THEME = {
  // Sky & Background
  skyGradientStart: '#A8D8EA',
  skyGradientEnd: '#E8F4F8',

  // Rainforest Layers
  canopyDistant: '#7BA7BC',
  canopyMid: '#88B8A8',
  forestFloor: '#B8C8B0',
  water: '#A0C4D8',

  // Chameleon
  chameleonSkin: '#7BC8A0',
  chameleonHighlight: '#A8E0C8',
  chameleonEye: '#F4C430',
  tongue: '#F4A6C6',

  // Insect Cards (Category Colors)
  beetleAccent: '#4A7BA7',
  butterflyAccent: '#B8A8E8',
  antAccent: '#8A7A68',
  biolumAccent: '#C8E8A8',
  glowColor: '#E8F4C0',

  // UI Elements
  cardBgColor: '#E8F4F8',
  cardBorderColor: '#7BA7BC',
  correctFeedback: '#A8E0C8',
  incorrectFeedback: '#F4C8A8',
  helpButton: '#F4C430',

  // Text
  textPrimary: '#2C3E50',
  textSecondary: '#5A6C7D',
} as const

export const COLORS = {
  transparent: 0x000000,
  cardBg: 0xE8F4F8,
  cardBorder: 0x7BA7BC,
  tongue: 0xF4A6C6,
  helpGlow: 0xF4C430,
  correctGlow: 0xA8E0C8,
} as const

export const FONTS = {
  primary: "'Quicksand', sans-serif",
  readable: "'Lexend', sans-serif",
  sizes: {
    heading: '32px',
    question: '22px',
    body: '18px',
    label: '14px',
  },
} as const
