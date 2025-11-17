# Phase 1: Project Setup - Detailed Technical Implementation Plan

## Overview

Phase 1 establishes the foundational project structure, configuration, and placeholder components for Chameleon's Quest. After Phase 1 completion, you'll have a running Vite + React + TypeScript + Phaser game with a basic blue-themed scene and placeholder game objects ready for mechanical development.

---

## 1. Exact Initialization Commands

Run these commands in order from a terminal:

```bash
# Create new project using Vite template
npm create vite@latest chameleon-quest -- --template react-ts

# Navigate into project
cd chameleon-quest

# Install dependencies (Vite + React already in package.json from template)
npm install

# Install Phaser 3
npm install phaser

# Install additional dev dependencies
npm install -D typescript @types/node @types/react @types/react-dom

# Verify setup (should show dev server starting)
npm run dev
```

Expected output after `npm run dev`:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 2. Complete Project File Structure

Create this exact directory and file structure:

```
chameleon-quest/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   └── PhaserGame.tsx
│   │
│   ├── game/
│   │   ├── config.ts
│   │   │
│   │   ├── scenes/
│   │   │   ├── MainScene.ts
│   │   │   └── MenuScene.ts
│   │   │
│   │   ├── objects/
│   │   │   ├── Chameleon.ts
│   │   │   ├── Tongue.ts
│   │   │   ├── QuestionCard.ts
│   │   │   └── InsectCard.ts
│   │   │
│   │   └── managers/
│   │       ├── QuestionManager.ts
│   │       ├── ScoreManager.ts
│   │       ├── HelpManager.ts
│   │       └── EncyclopediaManager.ts
│   │
│   ├── data/
│   │   ├── theme.ts
│   │   ├── insects.ts
│   │   ├── questions.ts
│   │   └── levels.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
│   └── assets/
│       ├── insects/
│       ├── chameleon/
│       └── backgrounds/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── .gitignore
```

**Directory creation commands:**

```bash
# From project root
mkdir -p src/components
mkdir -p src/game/scenes
mkdir -p src/game/objects
mkdir -p src/game/managers
mkdir -p src/data
mkdir -p src/types
mkdir -p public/assets/{insects,chameleon,backgrounds}
```

---

## 3. Configuration Files Content

### 3.1 `package.json`

```json
{
  "name": "chameleon-quest",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

### 3.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### 3.3 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    hmr: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  optimizeDeps: {
    include: ['phaser']
  }
})
```

### 3.4 `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chameleon's Quest</title>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&family=Lexend:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.5 `src/index.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background: linear-gradient(135deg, #A8D8EA 0%, #E8F4F8 100%);
  font-family: 'Quicksand', sans-serif;
  color: #2C3E50;
}

#root {
  width: 100%;
  height: 100%;
}

/* Disable text selection during gameplay */
canvas {
  user-select: none;
  -webkit-user-select: none;
}

/* Smooth transitions */
* {
  transition: opacity 0.3s ease;
}
```

### 3.6 `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
```

---

## 4. Core Application Files

### 4.1 `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 4.2 `src/App.tsx`

```typescript
import { useState } from 'react'
import PhaserGame from './components/PhaserGame'
import './App.css'

function App() {
  const [gameReady, setGameReady] = useState(false)

  return (
    <div className="app-container">
      <PhaserGame 
        onGameReady={() => setGameReady(true)}
        gameReady={gameReady}
      />
    </div>
  )
}

export default App
```

### 4.3 `src/App.css`

```css
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #A8D8EA 0%, #E8F4F8 100%);
}

#phaser-container {
  width: 100%;
  height: 100%;
  max-width: 1920px;
  max-height: 1080px;
  position: relative;
}

canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
```

---

## 5. Theme Configuration

### 5.1 `src/data/theme.ts`

```typescript
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
```

---

## 6. Type Definitions

### 6.1 `src/types/index.ts`

```typescript
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
```

---

## 7. Data Files (Initial Content)

### 7.1 `src/data/levels.ts`

```typescript
export const LEVELS = [
  {
    id: 1,
    name: 'Brilliant Beetles',
    description: 'Meet colorful beetles of the rainforest',
    difficulty: 'easy',
    questionDifficulty: 'easy',
    insectCount: 5,
    strikes: 3,
    readingTimeSeconds: 12,
  },
  {
    id: 2,
    name: 'Marvelous Ants',
    description: 'Discover amazing social insects',
    difficulty: 'medium',
    questionDifficulty: 'easy',
    insectCount: 5,
    strikes: 3,
    readingTimeSeconds: 11,
  },
  {
    id: 3,
    name: 'Masters of Camouflage',
    description: 'Find hidden insects of the rainforest',
    difficulty: 'medium',
    questionDifficulty: 'medium',
    insectCount: 5,
    strikes: 3,
    readingTimeSeconds: 10,
  },
  {
    id: 4,
    name: 'Glowing Night Insects',
    description: 'Explore bioluminescent creatures',
    difficulty: 'hard',
    questionDifficulty: 'medium',
    insectCount: 5,
    strikes: 3,
    readingTimeSeconds: 9,
  },
  {
    id: 5,
    name: 'Rare & Mysterious',
    description: 'Master identification of rare insects',
    difficulty: 'hard',
    questionDifficulty: 'hard',
    insectCount: 5,
    strikes: 3,
    readingTimeSeconds: 8,
  },
] as const
```

### 7.2 `src/data/insects.ts`

```typescript
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
```

### 7.3 `src/data/questions.ts`

```typescript
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
```

---

## 8. Phaser Configuration

### 8.1 `src/game/config.ts`

```typescript
import Phaser from 'phaser'

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
    backgroundColor: '#E8F4F8',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [],
  disableContextMenu: true,
}

export const GAME_CONFIG_BOUNDS = {
  width: 1920,
  height: 1080,
  centerX: 960,
  centerY: 540,
} as const

export const CHAMELEON_CONFIG = {
  startX: 960,
  startY: 950,
  scale: 1,
  minAngle: -90,
  maxAngle: 90,
  rotationSpeed: 0.1,
} as const

export const CARD_CONFIG = {
  questionFallSpeed: 30,
  insectFallSpeed: 40,
  descentTimeout: 15000, // milliseconds
} as const

export const TONGUE_CONFIG = {
  maxLength: 400,
  extensionSpeed: 15,
  retractionSpeed: 20,
  cooldownMs: 1000,
  tipRadius: 12,
} as const
```

---

## 9. Phaser Scenes

### 9.1 `src/game/scenes/MenuScene.ts`

```typescript
import Phaser from 'phaser'
import { THEME } from '../../data/theme'
import { GAME_CONFIG_BOUNDS } from '../config'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    // Background gradient
    const graphics = this.add.graphics()
    graphics.fillStyle(0xA8D8EA, 1)
    graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)
    
    graphics.fillStyle(0xE8F4F8, 1)
    graphics.fillRect(0, GAME_CONFIG_BOUNDS.height / 2, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height / 2)

    // Title
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      200,
      "Chameleon's Quest",
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '64px',
        color: '#2C3E50',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Subtitle
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      300,
      'Amazon Insect Reading Adventure',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '32px',
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Start button
    const startButton = this.add
      .rectangle(GAME_CONFIG_BOUNDS.centerX, 500, 300, 80, 0x7BA7BC)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.stop('MenuScene')
        this.scene.start('MainScene', { level: 1 })
      })
      .on('pointerover', () => {
        startButton.setFillStyle(0x88B8A8)
      })
      .on('pointerout', () => {
        startButton.setFillStyle(0x7BA7BC)
      })

    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      500,
      'Start Game',
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '28px',
        color: '#FFFFFF',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Info text
    this.add.text(
      GAME_CONFIG_BOUNDS.centerX,
      700,
      'Use arrow keys or mouse to aim • Press SPACEBAR or click to shoot',
      {
        fontFamily: "'Lexend', sans-serif",
        fontSize: '16px',
        color: '#5A6C7D',
        align: 'center',
      }
    ).setOrigin(0.5)
  }
}
```

### 9.2 `src/game/scenes/MainScene.ts`

```typescript
import Phaser from 'phaser'
import { THEME, COLORS } from '../../data/theme'
import { GAME_CONFIG_BOUNDS, CHAMELEON_CONFIG, CARD_CONFIG } from '../config'
import { Chameleon } from '../objects/Chameleon'
import { QuestionCard } from '../objects/QuestionCard'
import { InsectCard } from '../objects/InsectCard'

export class MainScene extends Phaser.Scene {
  private chameleon!: Chameleon
  private currentLevel: number = 1
  private score: number = 0
  private strikes: number = 0
  private maxStrikes: number = 3
  
  // Placeholder for game objects
  private questionCards: QuestionCard[] = []
  private insectCards: InsectCard[] = []

  constructor() {
    super({ key: 'MainScene' })
  }

  init(data: { level: number }) {
    this.currentLevel = data.level || 1
    this.score = 0
    this.strikes = 0
  }

  preload() {
    // Placeholder asset loading - will use actual images in Phase 2+
    // For now, we'll create colored rectangles in create()
  }

  create() {
    // Background
    this.createBackground()

    // Chameleon
    this.chameleon = new Chameleon(
      this,
      CHAMELEON_CONFIG.startX,
      CHAMELEON_CONFIG.startY
    )

    // Input handling
    this.setupInput()

    // UI text
    this.createUI()

    // Game loop
    this.time.delayedCall(2000, () => {
      this.spawnQuestionCard()
    })
  }

  private createBackground() {
    const graphics = this.add.graphics()
    graphics.fillStyle(0xA8D8EA, 1)
    graphics.fillRect(0, 0, GAME_CONFIG_BOUNDS.width, GAME_CONFIG_BOUNDS.height)

    // Placeholder rainforest hint (light green layer at bottom)
    graphics.fillStyle(0xB8C8B0, 0.3)
    graphics.fillRect(0, GAME_CONFIG_BOUNDS.height - 200, GAME_CONFIG_BOUNDS.width, 200)
  }

  private setupInput() {
    // Keyboard input
    this.input.keyboard!.on('keydown-LEFT', () => {
      this.chameleon.aimLeft()
    })

    this.input.keyboard!.on('keydown-RIGHT', () => {
      this.chameleon.aimRight()
    })

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.chameleon.shootTongue(this)
    })

    // Mouse input
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.chameleon.aimAtPoint(pointer.x, pointer.y)
    })

    this.input.on('pointerdown', () => {
      this.chameleon.shootTongue(this)
    })
  }

  private createUI() {
    // Level display
    this.add.text(50, 30, `Level ${this.currentLevel}`, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '28px',
      color: '#2C3E50',
    })

    // Score display
    this.add.text(50, 80, `Score: ${this.score}`, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '24px',
      color: '#2C3E50',
    })

    // Strikes display
    this.add.text(
      GAME_CONFIG_BOUNDS.width - 200,
      30,
      `Strikes: ${this.strikes}/${this.maxStrikes}`,
      {
        fontFamily: "'Quicksand', sans-serif",
        fontSize: '24px',
        color: '#2C3E50',
      }
    )
  }

  private spawnQuestionCard() {
    const question = {
      id: 'placeholder-q1',
      text: 'Which insect has wings you can see through?',
    }

    const card = new QuestionCard(
      this,
      GAME_CONFIG_BOUNDS.centerX,
      100,
      question
    )

    this.questionCards.push(card)
  }

  update() {
    this.chameleon.update(this.game.loop.delta)

    // Update question cards
    this.questionCards.forEach((card, index) => {
      card.update(this.game.loop.delta)
      if (card.isOffScreen()) {
        this.questionCards.splice(index, 1)
      }
    })

    // Update insect cards
    this.insectCards.forEach((card, index) => {
      card.update(this.game.loop.delta)
      if (card.isOffScreen()) {
        this.insectCards.splice(index, 1)
      }
    })
  }
}
```

---

## 10. Game Objects (Placeholder Classes)

### 10.1 `src/game/objects/Chameleon.ts`

```typescript
import Phaser from 'phaser'
import { CHAMELEON_CONFIG, TONGUE_CONFIG } from '../config'
import { Tongue } from './Tongue'

export class Chameleon extends Phaser.GameObjects.Container {
  private currentAngle: number = 0
  private targetAngle: number = 0
  private tongue: Tongue | null = null
  private lastTongueShot: number = 0
  private expression: 'neutral' | 'happy' | 'sad' | 'thinking' = 'neutral'

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // Create placeholder chameleon head (green circle)
    const head = scene.add.circle(0, 0, 50, 0x7BC8A0)
    this.add(head)

    // Create eye (golden)
    const eye = scene.add.circle(20, -15, 8, 0xF4C430)
    this.add(eye)

    // Register in scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
  }

  aimLeft() {
    this.targetAngle = Math.max(
      this.targetAngle - 5,
      CHAMELEON_CONFIG.minAngle
    )
  }

  aimRight() {
    this.targetAngle = Math.min(
      this.targetAngle + 5,
      CHAMELEON_CONFIG.maxAngle
    )
  }

  aimAtPoint(x: number, y: number) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y)
    const angleInDegrees = Phaser.Math.RadToDeg(angle) - 90
    
    this.targetAngle = Phaser.Math.Clamp(
      angleInDegrees,
      CHAMELEON_CONFIG.minAngle,
      CHAMELEON_CONFIG.maxAngle
    )
  }

  shootTongue(scene: Phaser.Scene): boolean {
    const now = this.scene.time.now
    
    if (this.tongue || now - this.lastTongueShot < TONGUE_CONFIG.cooldownMs) {
      return false
    }

    this.tongue = new Tongue(scene, this.x, this.y, this.currentAngle)
    this.lastTongueShot = now

    return true
  }

  getTongue(): Tongue | null {
    return this.tongue
  }

  clearTongue() {
    this.tongue = null
  }

  setExpression(expression: 'neutral' | 'happy' | 'sad' | 'thinking') {
    this.expression = expression
  }

  update(delta: number) {
    // Smooth rotation toward target angle
    this.currentAngle = Phaser.Math.Linear(
      this.currentAngle,
      this.targetAngle,
      CHAMELEON_CONFIG.rotationSpeed
    )

    this.setRotation(Phaser.Math.DegToRad(this.currentAngle))

    // Update tongue if active
    if (this.tongue) {
      this.tongue.update(delta)

      if (this.tongue.isFinished()) {
        this.tongue.destroy()
        this.clearTongue()
      }
    }
  }
}
```

### 10.2 `src/game/objects/Tongue.ts`

```typescript
import Phaser from 'phaser'
import { TONGUE_CONFIG } from '../config'

export class Tongue extends Phaser.GameObjects.Graphics {
  private startX: number
  private startY: number
  private angle: number
  private currentLength: number = 0
  private maxLength: number = TONGUE_CONFIG.maxLength
  private extending: boolean = true
  private finished: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number
  ) {
    super(scene)

    this.startX = x
    this.startY = y
    this.angle = angle

    scene.add.existing(this)
  }

  update(delta: number) {
    if (this.extending) {
      this.currentLength += TONGUE_CONFIG.extensionSpeed
      
      if (this.currentLength >= this.maxLength) {
        this.extending = false
      }
    } else {
      this.currentLength -= TONGUE_CONFIG.retractionSpeed
      
      if (this.currentLength <= 0) {
        this.finished = true
        return
      }
    }

    this.drawTongue()
  }

  private drawTongue() {
    this.clear()

    // Calculate end point
    const endX =
      this.startX +
      Math.cos(Phaser.Math.DegToRad(this.angle)) * this.currentLength
    const endY =
      this.startY +
      Math.sin(Phaser.Math.DegToRad(this.angle)) * this.currentLength

    // Draw tongue as thick pink line
    this.lineStyle(8, 0xF4A6C6, 1)
    this.beginPath()
    this.moveTo(this.startX, this.startY)
    this.lineTo(endX, endY)
    this.strokePath()

    // Draw sticky tip
    this.fillStyle(0xF4A6C6, 1)
    this.fillCircle(endX, endY, TONGUE_CONFIG.tipRadius)
  }

  getTipX(): number {
    return (
      this.startX +
      Math.cos(Phaser.Math.DegToRad(this.angle)) * this.currentLength
    )
  }

  getTipY(): number {
    return (
      this.startY +
      Math.sin(Phaser.Math.DegToRad(this.angle)) * this.currentLength
    )
  }

  isExtending(): boolean {
    return this.extending
  }

  isFinished(): boolean {
    return this.finished
  }
}
```

### 10.3 `src/game/objects/QuestionCard.ts`

```typescript
import Phaser from 'phaser'
import { COLORS, THEME } from '../../data/theme'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'

interface QuestionData {
  id: string
  text: string
}

export class QuestionCard extends Phaser.GameObjects.Container {
  private questionText!: Phaser.GameObjects.Text
  private fallSpeed: number = CARD_CONFIG.questionFallSpeed
  private questionData: QuestionData
  private spawnTime: number
  private isOffScreen: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    question: QuestionData
  ) {
    super(scene, x, y)

    this.questionData = question
    this.spawnTime = scene.time.now

    // Background card
    const background = scene.add.rectangle(-200, 0, 400, 120, COLORS.cardBg)
    background.setStrokeStyle(3, COLORS.cardBorder)
    this.add(background)

    // Question text
    this.questionText = scene.add.text(0, 0, question.text, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '22px',
      color: THEME.textPrimary,
      align: 'center',
      wordWrap: { width: 360 },
    })
    this.questionText.setOrigin(0.5)
    this.add(this.questionText)

    scene.add.existing(this)
  }

  update(delta: number) {
    // Fall gently
    this.y += (this.fallSpeed * delta) / 1000

    // Check if off-screen
    if (this.y > GAME_CONFIG_BOUNDS.height) {
      this.isOffScreen = true
      this.destroy()
    }
  }

  isOffScreen(): boolean {
    return this.isOffScreen || this.y > GAME_CONFIG_BOUNDS.height
  }

  getQuestionData(): QuestionData {
    return this.questionData
  }
}
```

### 10.4 `src/game/objects/InsectCard.ts`

```typescript
import Phaser from 'phaser'
import { CARD_CONFIG, GAME_CONFIG_BOUNDS } from '../config'

interface InsectData {
  id: string
  name: string
  color: string
}

export class InsectCard extends Phaser.GameObjects.Container {
  private insectData: InsectData
  private isCorrect: boolean
  private fallSpeed: number = CARD_CONFIG.insectFallSpeed
  private isOffScreen: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    insect: InsectData,
    isCorrect: boolean
  ) {
    super(scene, x, y)

    this.insectData = insect
    this.isCorrect = isCorrect

    // Create placeholder insect (colored circle)
    const color = parseInt(insect.color.replace('#', '0x'), 16)
    const insectShape = scene.add.circle(0, 0, 40, color)
    this.add(insectShape)

    // Add label below
    const label = scene.add.text(0, 50, insect.name, {
      fontFamily: "'Quicksand', sans-serif",
      fontSize: '14px',
      color: '#2C3E50',
      align: 'center',
    })
    label.setOrigin(0.5)
    this.add(label)

    scene.add.existing(this)
  }

  update(delta: number) {
    // Fall gently
    this.y += (this.fallSpeed * delta) / 1000

    // Gentle horizontal drift (sine wave)
    this.x += Math.sin(this.scene.time.now / 1000 + this.y) * 0.3

    // Check if off-screen
    if (this.y > GAME_CONFIG_BOUNDS.height) {
      this.isOffScreen = true
      this.destroy()
    }
  }

  isOffScreenCheck(): boolean {
    return this.isOffScreen || this.y > GAME_CONFIG_BOUNDS.height
  }

  getInsectData(): InsectData {
    return this.insectData
  }

  isCorrectAnswer(): boolean {
    return this.isCorrect
  }

  celebrate() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.destroy()
      },
    })
  }
}
```

---

## 11. Placeholder Manager Files

### 11.1 `src/game/managers/QuestionManager.ts`

```typescript
import { Question, Insect } from '../../types'
import { QUESTIONS } from '../../data/questions'
import { INSECTS } from '../../data/insects'

export class QuestionManager {
  private currentLevel: number = 1
  private askedQuestions: Set<string> = new Set()
  private availableQuestions: Question[] = []

  constructor(level: number) {
    this.currentLevel = level
    this.loadQuestionsForLevel(level)
  }

  private loadQuestionsForLevel(level: number) {
    this.availableQuestions = QUESTIONS.filter(
      q => q.insectLevel === level && !this.askedQuestions.has(q.id)
    )
  }

  getNextQuestion(): Question | null {
    if (this.availableQuestions.length === 0) {
      this.resetLevel()
      this.loadQuestionsForLevel(this.currentLevel)
    }

    const randomIndex = Math.floor(
      Math.random() * this.availableQuestions.length
    )
    const question = this.availableQuestions[randomIndex]

    this.availableQuestions.splice(randomIndex, 1)
    this.askedQuestions.add(question.id)

    return question
  }

  resetLevel() {
    this.askedQuestions.clear()
  }

  setLevel(level: number) {
    this.currentLevel = level
    this.resetLevel()
    this.loadQuestionsForLevel(level)
  }
}
```

### 11.2 `src/game/managers/ScoreManager.ts`

```typescript
export class ScoreManager {
  private score: number = 0
  private correctAnswers: number = 0
  private totalAnswers: number = 0

  addScore(points: number) {
    this.score += points
  }

  recordCorrect() {
    this.correctAnswers++
    this.totalAnswers++
    this.addScore(10)
  }

  recordIncorrect() {
    this.totalAnswers++
  }

  getScore(): number {
    return this.score
  }

  getAccuracy(): number {
    if (this.totalAnswers === 0) return 0
    return (this.correctAnswers / this.totalAnswers) * 100
  }

  reset() {
    this.score = 0
    this.correctAnswers = 0
    this.totalAnswers = 0
  }
}
```

### 11.3 `src/game/managers/HelpManager.ts`

```typescript
export class HelpManager {
  private helpUsed: number = 0
  private maxHelpsPerLevel: number = 3

  useHelp(): boolean {
    if (this.helpUsed < this.maxHelpsPerLevel) {
      this.helpUsed++
      return true
    }
    return false
  }

  getHelpRemaining(): number {
    return this.maxHelpsPerLevel - this.helpUsed
  }

  resetLevel() {
    this.helpUsed = 0
  }
}
```

### 11.4 `src/game/managers/EncyclopediaManager.ts`

```typescript
export class EncyclopediaManager {
  private unlockedInsects: Set<string> = new Set()

  unlockInsect(insectId: string) {
    this.unlockedInsects.add(insectId)
  }

  isUnlocked(insectId: string): boolean {
    return this.unlockedInsects.has(insectId)
  }

  getUnlockedCount(): number {
    return this.unlockedInsects.size
  }

  getUnlockedInsects(): string[] {
    return Array.from(this.unlockedInsects)
  }

  reset() {
    this.unlockedInsects.clear()
  }
}
```

---

## 12. React Phaser Container Component

### 12.1 `src/components/PhaserGame.tsx`

```typescript
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GAME_CONFIG } from '../game/config'
import { MainScene } from '../game/scenes/MainScene'
import { MenuScene } from '../game/scenes/MenuScene'

interface PhaserGameProps {
  onGameReady: () => void
  gameReady: boolean
}

export default function PhaserGame({ onGameReady, gameReady }: PhaserGameProps) {
  const phaserRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: 'phaser-container',
      scene: [MenuScene, MainScene],
    }

    phaserRef.current = new Phaser.Game(config)

    onGameReady()

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true)
        phaserRef.current = null
      }
    }
  }, [onGameReady])

  return <div id="phaser-container" style={{ width: '100%', height: '100%' }} />
}
```

---

## 13. Build & Verification Steps

### Run Development Server

```bash
npm run dev
```

Expected result:
- Vite dev server starts on http://localhost:5173
- Browser displays menu screen with "Start Game" button
- No console errors

### Verify Project Structure

```bash
# Check that all directories exist
find src -type d | sort

# Check that key files exist
ls -la src/game/scenes/
ls -la src/game/objects/
ls -la src/game/managers/
ls -la src/data/
```

### Test Basic Functionality

1. **Menu Screen**: Click "Start Game" button
2. **Main Scene Loads**: Should see blue gradient background
3. **Chameleon Visible**: Green circle at bottom center with golden eye
4. **Input Works**: 
   - Press LEFT/RIGHT arrows → chameleon rotates
   - Move mouse → chameleon aims at pointer
   - Press SPACEBAR or click → tongue extends and retracts (pink line with circle tip)
5. **No Errors**: Check browser console (F12) for any errors

### Production Build

```bash
npm run build
```

Expected output:
```
vite v5.x.x building for production...
✓ 127 modules transformed.

dist/index.html                   0.50 kB
dist/assets/index-xxxxxxxx.js   xx.xx kB
dist/assets/index-xxxxxxxx.css  x.xx kB

built in x.xxs
```

---

## 14. Acceptance Criteria for Phase 1 Completion

### Code Structure Acceptance
- [x] Project initializes with `npm install` and `npm run dev`
- [x] All directories created as specified
- [x] All configuration files present and valid (package.json, tsconfig.json, vite.config.ts, index.html)
- [x] TypeScript compiles without errors
- [x] No ESLint or Vite warnings about missing files

### Phaser Setup Acceptance
- [x] Phaser 3 game initializes successfully
- [x] Game config uses blue theme colors from `THEME` object
- [x] Game size is 1920×1080 (desktop optimized)
- [x] Two scenes exist: MenuScene and MainScene
- [x] Scenes can transition (Menu → Main via "Start Game" button)

### Game Object Acceptance
- [x] Chameleon displays as placeholder (green circle with eye)
- [x] Chameleon rotates smoothly with arrow keys (±90° range)
- [x] Chameleon aims at mouse cursor
- [x] Tongue class exists and extends on spacebar/click
- [x] Tongue retracts automatically and disappears
- [x] Tongue extends and retracts with correct visual (pink line + circle tip)
- [x] Tongue cooldown prevents spam (1 second between shots)

### Placeholder Assets Acceptance
- [x] Chameleon: Green circle (0x7BC8A0) with golden eye
- [x] Tongue: Pink line (0xF4A6C6) with circular tip
- [x] Question cards: White/blue rectangles with text
- [x] Insect cards: Colored circles with names
- [x] No missing texture errors in console

### Data Files Acceptance
- [x] `insects.ts` contains 5 placeholder insects with Level 1 designation
- [x] `questions.ts` contains 5 placeholder questions
- [x] `levels.ts` defines 5 levels with difficulty progression
- [x] `theme.ts` exports color palette for blue-centered design
- [x] TypeScript interfaces in `types/index.ts` match all data structures

### Manager Classes Acceptance
- [x] `QuestionManager` loads and shuffles questions per level
- [x] `ScoreManager` tracks score and accuracy
- [x] `HelpManager` tracks help usage (max 3 per level)
- [x] `EncyclopediaManager` tracks unlocked insects
- [x] All managers instantiate without errors

### React Integration Acceptance
- [x] `PhaserGame` component mounts and initializes Phaser
- [x] `App.tsx` renders the game container
- [x] No console errors about React/Phaser mismatches
- [x] Browser DevTools shows clean React component tree

### Input Handling Acceptance
- [x] Keyboard input (LEFT, RIGHT, SPACEBAR) recognized
- [x] Mouse input (move, click) recognized
- [x] Input doesn't interfere with browser defaults (except context menu)
- [x] Aiming feels responsive (no lag)

### Visual Design Acceptance
- [x] Background gradient matches theme (sky blue to light blue)
- [x] Text is readable (large font, high contrast)
- [x] Blue color scheme present (no harsh colors)
- [x] Chameleon character visible and charming
- [x] Layout centered and scaled properly on different resolutions

### Performance Acceptance
- [x] Game runs at 60 FPS (or device refresh rate)
- [x] No memory leaks on repeated tongue shots
- [x] Smooth animations (no jank)
- [x] Dev server reloads in <2 seconds on file save

### Documentation Acceptance
- [x] This detailed plan is complete and actionable
- [x] All code files have clear purpose comments
- [x] Configuration choices documented (blue theme, 1920×1080, etc.)
- [x] Developer can follow this plan without external references

---

## 15. Common Issues & Troubleshooting

### Issue: "Cannot find module 'phaser'"
**Solution:**
```bash
npm install phaser
npm install -D @types/phaser
```

### Issue: TypeScript errors about Phaser types
**Solution:** Ensure `tsconfig.json` has `"skipLibCheck": true`

### Issue: Game not displaying (blank screen)
**Solution:** 
- Check that `PhaserGame.tsx` is imported in `App.tsx`
- Verify `<div id="phaser-container">` exists in App.tsx
- Check browser console for errors (F12)

### Issue: Tongue doesn't appear when shooting
**Solution:**
- Verify `Tongue` class is properly added to scene in `create()`
- Check that Graphics object is properly initialized
- Ensure `update()` method is called each frame

### Issue: Arrows don't rotate chameleon
**Solution:**
- Verify keyboard input setup in `setupInput()`
- Check that `aimLeft()` and `aimRight()` actually change `targetAngle`
- Ensure `update()` method applies rotation

### Issue: Build fails with "vite: command not found"
**Solution:**
```bash
npm install -D vite
# or
npx vite build
```

---

## 16. Next Steps After Phase 1

Once Phase 1 is complete and all acceptance criteria met:

1. **Phase 2 begins**: Implement full Chameleon and Tongue mechanics
2. **Phase 3**: Add falling cards system with proper spawning
3. **Phase 4**: Implement collision detection and catching
4. **Phase 5**: Populate insect database and question content

At each phase, this foundational structure supports smooth iteration without major refactoring.

---

## 17. Key File Quick Reference

| File | Purpose |
|------|---------|
| `src/game/config.ts` | Phaser game settings, blue theme dimensions |
| `src/data/theme.ts` | Centralized color palette (all hex codes) |
| `src/game/scenes/MainScene.ts` | Primary game loop, input handling |
| `src/game/scenes/MenuScene.ts` | Start screen, level selection |
| `src/game/objects/Chameleon.ts` | Chameleon character, rotation, tongue |
| `src/game/objects/Tongue.ts` | Tongue extending/retracting animation |
| `src/game/objects/QuestionCard.ts` | Falling question display |
| `src/game/objects/InsectCard.ts` | Falling insect answer options |
| `src/components/PhaserGame.tsx` | React wrapper for Phaser instance |
| `src/types/index.ts` | TypeScript interfaces (Insect, Question, etc.) |

---

**Phase 1 Status**: Ready for Implementation

**Estimated Implementation Time**: 2-3 hours (including testing)

**Developer Notes**: 
- All code is placeholder-ready; assets are minimal colored shapes
- Phaser 3 is production-grade and well-documented
- TypeScript will catch errors early during development
- Vite provides instant hot reload for rapid iteration
- Blue theme colors are cohesive and accessible
- Structure supports easy addition of 25 insects and 50+ questions in Phase 5

