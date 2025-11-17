# Chameleon's Quest: Amazon Insect Reading Adventure

## Game Concept

A Tux Math-inspired reading game where players control a hungry chameleon at the bottom of the screen, reading facts about rare Amazon rainforest insects and catching the correct answers with the chameleon's tongue. The game emphasizes reading comprehension, vocabulary building, and quick decision-making in a gentle, exploratory atmosphere.

Think: Tux Math meets educational entomology, with a patient chameleon guide introducing children to the hidden wonders of the Amazon's smallest creatures.

## Core Mechanics

### Chameleon Positioning
- Chameleon head fixed at bottom center of screen
- Left/Right arrow keys or mouse to rotate head direction
- Head always faces upward, rotates smoothly (~180° arc)
- Tongue extends in straight line from mouth

### Insect Reading Cards
- Cards slowly descend from top of screen (like falling math problems in Tux Math)
- Each card contains a question/fact at the top
- 2-4 possible answer insects falling separately below the question card
- Player must read question, then aim tongue at correct insect
- Reading time: 8-15 seconds before insects become unreachable

### Tongue Mechanic
- Spacebar or click to shoot tongue
- Tongue extends rapidly, snaps back with insect (if hit)
- Visual feedback: tongue curls around caught insect
- Miss: tongue snaps back empty, can shoot again
- Cooldown: 1 second between tongue shots (prevents spam)

### Help System
- Pressing 'H' key or help button highlights the correct answer with subtle glow
- Help available 3 times per level (recharges between levels)
- Using help still counts as correct (encourages learning over frustration)
- Gentle animation shows which insect is correct
- No penalties for using help

### Failure States
- Wrong insect caught: gentle "oops" feedback, explanation shown
- Question falls off bottom of screen: chameleon looks sad, fact displayed for learning
- 3 strikes per level (forgiving for early readers)
- No time pressure sounds/urgent music (calm, patient atmosphere)

### Progression
- 5 levels, each introducing 5 new insects (25 total)
- Levels organized by insect type:
  - Level 1: Beetles (diverse, colorful)
  - Level 2: Ants & Social Insects
  - Level 3: Camouflaged Insects
  - Level 4: Bioluminescent & Night Insects
  - Level 5: Rare & Mysterious Insects
- Questions get progressively more detailed
- Multiple questions per insect (different facts)

## Technical Architecture

### Modern Tech Stack (2025)

**Core Framework:**
- **Phaser 3** - Game engine for smooth animations and physics
- **React 18+** - UI layer (menus, help overlays, fact displays)
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning-fast build tool and dev server

**Why This Stack?**
- Proven approach from word-reading-downhill-game
- Phaser handles smooth animations (falling cards, tongue extension)
- Easy to separate game logic (Phaser) from UI/reading content (React)
- TypeScript ensures content data is well-structured
- Vite enables rapid iteration during playtesting

### Project Structure
```
chameleon-quest/
├── src/
│   ├── App.tsx                       # React root component
│   ├── components/
│   │   ├── PhaserGame.tsx            # Phaser container component
│   │   ├── MainMenu.tsx              # Start screen UI (React)
│   │   ├── LevelSelect.tsx           # Level selection with preview
│   │   ├── GameOverlay.tsx           # HUD overlay (score, help counter)
│   │   ├── FactDisplay.tsx           # Full-screen fact after catch/miss
│   │   ├── HelpButton.tsx            # Help system UI
│   │   └── InsectEncyclopedia.tsx    # Unlocked insects gallery
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── MainScene.ts          # Primary game scene
│   │   │   ├── MenuScene.ts          # Menu scene
│   │   │   └── ResultScene.ts        # Level results
│   │   ├── objects/
│   │   │   ├── Chameleon.ts          # Phaser Sprite - chameleon head
│   │   │   ├── Tongue.ts             # Phaser Graphics - tongue extension
│   │   │   ├── QuestionCard.ts       # Phaser Container - falling question
│   │   │   ├── InsectCard.ts         # Phaser Sprite - answer insects
│   │   │   └── BackgroundLayer.ts    # Rainforest background elements
│   │   ├── managers/
│   │   │   ├── QuestionManager.ts    # Question/answer pairing logic
│   │   │   ├── ScoreManager.ts       # Progress tracking
│   │   │   ├── HelpManager.ts        # Help system state
│   │   │   └── EncyclopediaManager.ts # Unlocked insects tracking
│   │   └── config.ts                 # Phaser game configuration
│   ├── data/
│   │   ├── insects.ts                # Insect facts database (25 insects)
│   │   ├── questions.ts              # Question templates by difficulty
│   │   ├── levels.ts                 # Level configuration
│   │   └── theme.ts                  # Color palette & styles
│   └── main.tsx                      # App entry point
├── public/
│   └── assets/
│       ├── insects/                  # Individual insect PNGs (25 files)
│       │   ├── hercules-beetle.png
│       │   ├── glass-wing-butterfly.png
│       │   └── ...
│       ├── chameleon/
│       │   ├── head-neutral.png
│       │   ├── head-happy.png
│       │   ├── head-sad.png
│       │   └── tongue-segment.png    # Repeatable texture
│       └── backgrounds/
│           ├── level-1-bg.png        # Rainforest layers
│           └── ...
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Phaser Scene System (MainScene.ts)

**Scene Lifecycle:**
- `init(data)` - Receive level number and difficulty settings
- `preload()` - Load insect sprites, chameleon assets, backgrounds
- `create()` - Set up chameleon, spawn first question, create background
- `update(time, delta)` - Handle falling cards, tongue animations, input

**Main Scene Responsibilities:**
- Chameleon head rotation (follows mouse or arrow keys)
- Question card spawning and descent (constant gentle speed)
- Insect answer card spawning (synchronized with question)
- Tongue shooting mechanic (Phaser Graphics line + collision detection)
- Collision detection (tongue tip vs insect bounds)
- Help system visual feedback (glow effect on correct answer)
- Score/progress tracking

**Key Phaser Features Used:**
- `this.add.sprite()` - Chameleon head, insect cards
- `this.add.container()` - Question cards with text + background
- `this.add.graphics()` - Tongue drawing (dynamic line)
- `this.tweens.add()` - Smooth descent, tongue extension/retraction, help glow pulse
- `this.input.on('pointermove')` - Mouse-based aiming (alternative to arrows)
- `Phaser.Geom.Intersects` - Tongue-to-insect collision

### Game Objects (Phaser-based)

**Chameleon (extends Phaser.GameObjects.Sprite):**
```typescript
class Chameleon extends Phaser.GameObjects.Sprite {
  currentAngle: number;      // -90 to +90 degrees (left to right)
  targetAngle: number;       // For smooth rotation
  tongue: Tongue | null;     // Active tongue instance
  expression: 'neutral' | 'happy' | 'sad' | 'thinking';

  aimLeft() {
    this.targetAngle = Math.max(this.targetAngle - 5, -90);
  }

  aimRight() {
    this.targetAngle = Math.min(this.targetAngle + 5, 90);
  }

  aimAtPoint(x: number, y: number) {
    // Calculate angle from chameleon mouth to pointer
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    this.targetAngle = Phaser.Math.RadToDeg(angle) - 90; // Adjust for upward facing
  }

  shootTongue(scene: Phaser.Scene) {
    if (this.tongue) return; // Already shooting
    this.tongue = new Tongue(scene, this.x, this.y, this.currentAngle);
    // Tongue extends, checks collision, returns
  }

  setExpression(expression: 'neutral' | 'happy' | 'sad' | 'thinking') {
    this.setTexture(`chameleon-head-${expression}`);
  }

  update(delta: number) {
    // Smooth rotation toward target angle
    this.currentAngle = Phaser.Math.Linear(this.currentAngle, this.targetAngle, 0.1);
    this.setRotation(Phaser.Math.DegToRad(this.currentAngle));
  }
}
```

**Tongue (extends Phaser.GameObjects.Graphics):**
```typescript
class Tongue extends Phaser.GameObjects.Graphics {
  startX: number;
  startY: number;
  angle: number;
  currentLength: number;  // Extends over time
  maxLength: number = 400;
  extending: boolean = true;
  caughtInsect: InsectCard | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    super(scene);
    this.startX = x;
    this.startY = y;
    this.angle = angle;
    this.currentLength = 0;
  }

  update(delta: number) {
    if (this.extending) {
      this.currentLength += 15; // Extension speed (pixels per frame)
      if (this.currentLength >= this.maxLength) {
        this.extending = false; // Start retracting
      }
    } else {
      this.currentLength -= 20; // Retraction speed (faster return)
      if (this.currentLength <= 0) {
        this.destroy(); // Remove tongue
        return;
      }
    }

    this.drawTongue();
    this.checkCollisions();
  }

  drawTongue() {
    this.clear();
    const endX = this.startX + Math.cos(Phaser.Math.DegToRad(this.angle)) * this.currentLength;
    const endY = this.startY + Math.sin(Phaser.Math.DegToRad(this.angle)) * this.currentLength;

    // Draw tongue as thick line with sticky tip
    this.lineStyle(8, 0xF4A6C6, 1); // Pink tongue color
    this.beginPath();
    this.moveTo(this.startX, this.startY);
    this.lineTo(endX, endY);
    this.strokePath();

    // Draw sticky tip (circle)
    this.fillStyle(0xF4A6C6, 1);
    this.fillCircle(endX, endY, 12);
  }

  checkCollisions() {
    // Get tongue tip position
    const tipX = this.startX + Math.cos(Phaser.Math.DegToRad(this.angle)) * this.currentLength;
    const tipY = this.startY + Math.sin(Phaser.Math.DegToRad(this.angle)) * this.currentLength;

    // Check against all active insects (passed from scene)
    // If collision detected, catch insect and retract
  }

  catchInsect(insect: InsectCard) {
    this.caughtInsect = insect;
    this.extending = false; // Start retracting immediately
    insect.attachToTongue(this); // Insect follows tongue back
  }
}
```

**QuestionCard (extends Phaser.GameObjects.Container):**
```typescript
class QuestionCard extends Phaser.GameObjects.Container {
  questionText: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.Graphics;
  fallSpeed: number = 30; // Pixels per second
  questionData: Question;

  constructor(scene: Phaser.Scene, x: number, y: number, question: Question) {
    super(scene, x, y);

    this.questionData = question;

    // Background card
    this.background = scene.add.graphics();
    this.background.fillStyle(0xE8F4F8, 0.95); // Soft blue-white
    this.background.fillRoundedRect(-200, -60, 400, 120, 16);
    this.background.lineStyle(3, 0x7BA7BC, 1); // Gentle blue border
    this.background.strokeRoundedRect(-200, -60, 400, 120, 16);
    this.add(this.background);

    // Question text (large, readable)
    this.questionText = scene.add.text(0, 0, question.text, {
      fontFamily: 'Quicksand, sans-serif',
      fontSize: '22px',
      color: '#2C3E50',
      align: 'center',
      wordWrap: { width: 360 }
    });
    this.questionText.setOrigin(0.5);
    this.add(this.questionText);

    scene.add.existing(this);
  }

  update(delta: number) {
    // Fall gently from top to bottom
    this.y += (this.fallSpeed * delta) / 1000;

    // Check if off-screen (bottom)
    if (this.y > 650) {
      this.emit('missed'); // Notify scene
      this.destroy();
    }
  }
}
```

**InsectCard (extends Phaser.GameObjects.Sprite):**
```typescript
class InsectCard extends Phaser.GameObjects.Sprite {
  insectData: Insect;
  isCorrect: boolean;
  fallSpeed: number = 40; // Slightly faster than question
  helpGlow: Phaser.GameObjects.Graphics | null = null;
  attachedToTongue: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, insect: Insect, isCorrect: boolean) {
    super(scene, x, y, insect.imageKey);

    this.insectData = insect;
    this.isCorrect = isCorrect;
    this.setScale(0.8); // Slightly smaller than life-size
    this.setInteractive(); // Enable hover effects later

    scene.add.existing(this);
  }

  update(delta: number) {
    if (this.attachedToTongue) {
      // Follow tongue position (handled by Tongue class)
      return;
    }

    // Fall gently
    this.y += (this.fallSpeed * delta) / 1000;

    // Gentle floating animation (sine wave horizontal drift)
    this.x += Math.sin(Date.now() / 1000 + this.y) * 0.3;

    // Check if off-screen
    if (this.y > 650) {
      this.destroy();
    }
  }

  showHelpGlow() {
    // Add pulsing glow around correct insect
    this.helpGlow = this.scene.add.graphics();
    this.helpGlow.lineStyle(4, 0xF4C430, 1); // Golden glow
    this.helpGlow.strokeCircle(this.x, this.y, 60);

    this.scene.tweens.add({
      targets: this.helpGlow,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  attachToTongue(tongue: Tongue) {
    this.attachedToTongue = true;
    // Tween to follow tongue retraction
  }

  celebrate() {
    // Caught correctly - scale up briefly, then disappear
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      alpha: 0,
      duration: 400,
      onComplete: () => this.destroy()
    });
  }
}
```

### Question Manager (TypeScript class)

**Responsibilities:**
- Loads question templates and insect database
- Pairs questions with correct insects
- Generates 2-3 wrong answer insects (distractors)
- Ensures variety (no repeated questions in same level)
- Tracks which insects have been introduced
- Difficulty scaling (word complexity, question length)

**Interface:**
```typescript
interface Insect {
  id: string;
  commonName: string;
  scientificName: string;
  level: number; // 1-5, which level introduces this insect
  size: string; // "tiny", "small", "medium"
  color: string; // Hex color for UI accents
  habitat: string; // "forest floor", "canopy", "water"
  diet: string;
  fact1: string; // Multiple facts per insect
  fact2: string;
  fact3: string;
  rarity: string; // "common", "rare", "very rare"
  imageKey: string; // Phaser texture key
}

interface Question {
  id: string;
  text: string; // The question displayed on card
  correctInsectId: string;
  distractorCount: number; // How many wrong answers (2-3)
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'identification' | 'behavior' | 'habitat' | 'comparison';
}

class QuestionManager {
  private insects: Map<string, Insect> = new Map();
  private questions: Question[] = [];
  private currentLevel: number = 1;
  private askedQuestions: Set<string> = new Set();

  loadInsects(level: number) {
    // Load all insects unlocked up to this level
    const availableInsects = INSECT_DATABASE.filter(i => i.level <= level);
    availableInsects.forEach(insect => {
      this.insects.set(insect.id, insect);
    });
  }

  generateQuestion(): { question: Question, insects: InsectCard[] } {
    // Pick random question template
    const question = this.pickUnaskedQuestion();

    // Get correct insect
    const correctInsect = this.insects.get(question.correctInsectId);

    // Generate 2-3 distractors (wrong answers from same level)
    const distractors = this.pickDistractors(question.correctInsectId, question.distractorCount);

    // Shuffle insects so correct answer isn't always in same position
    const allInsects = [correctInsect, ...distractors];
    Phaser.Utils.Array.Shuffle(allInsects);

    return { question, insects: allInsects };
  }

  pickDistractors(correctId: string, count: number): Insect[] {
    // Pick visually/conceptually similar insects to create challenge
    const available = Array.from(this.insects.values())
      .filter(i => i.id !== correctId && i.level <= this.currentLevel);

    return Phaser.Utils.Array.GetRandom(available, count);
  }

  markQuestionAsked(questionId: string) {
    this.askedQuestions.add(questionId);
  }

  resetLevel() {
    this.askedQuestions.clear();
  }
}
```

## Visual Design

### Color Palette (Gentle Blue-Centered Rainforest)

**Primary Palette (Subtle Blues & Greens):**
- Sky gradient: `#A8D8EA` → `#E8F4F8` (soft azure to misty blue)
- Rainforest canopy (distant): `#7BA7BC` (dusty blue-green)
- Rainforest canopy (mid): `#88B8A8` (sage teal)
- Forest floor: `#B8C8B0` (soft moss green)
- Water elements: `#A0C4D8` (gentle aqua)

**Chameleon Colors:**
- Chameleon skin base: `#7BC8A0` (minty green-blue)
- Chameleon highlights: `#A8E0C8` (light seafoam)
- Chameleon eye: `#F4C430` (warm golden accent)
- Tongue: `#F4A6C6` (soft pink, contrasts with blue/green)

**Insect Card Accents (Vivid but Gentle):**
- Beetle cards: `#4A7BA7` (deep blue-gray)
- Butterfly cards: `#B8A8E8` (soft lavender-blue)
- Ant cards: `#8A7A68` (warm earth tone, contrasts gently)
- Bioluminescent insects: `#C8E8A8` with `#E8F4C0` glow (phosphorescent yellow-green)

**UI Elements:**
- Question card background: `#E8F4F8` with `#7BA7BC` border (pale blue)
- Correct answer feedback: `#A8E0C8` (mint green)
- Incorrect answer feedback: `#F4C8A8` (soft peach, not harsh red)
- Help button: `#F4C430` (golden, warm accent)
- Text color: `#2C3E50` (charcoal, high contrast on light backgrounds)

### Visual Style Guidelines

**Background Layers (Parallax):**
- 4-5 layers of rainforest depth
- Distant canopy: Blurred silhouettes, 70% opacity, muted blue-green
- Mid-canopy: Sharper leaves, 85% opacity, richer green-blue
- Foreground vines: Crisp detail, full opacity, frame edges of screen
- All elements use thin line art with subtle gradients
- No harsh black outlines - use darker versions of fill colors

**Insect Illustrations:**
- Scientifically accurate but stylized (slight cartoon friendliness)
- Clean vector-style with smooth edges
- Vivid colors on insects (contrast with gentle backgrounds)
- Subtle drop shadows (soft, blue-tinted)
- Size variations: beetles larger, ants smaller, butterflies medium

**Typography:**
- **Headings**: Quicksand Bold, 32px+, generous spacing
- **Questions**: Quicksand Regular, 22px, line height 1.5
- **Body text/facts**: Lexend Regular, 18px (dyslexia-friendly)
- **Small labels**: Quicksand Medium, 14px
- All text with 1-2px letter-spacing for readability

**Animation Principles:**
- Smooth easing (Sine.easeInOut, Power2)
- Gentle floating (insects drift slightly, never static)
- No sudden movements (everything telegraphed)
- Celebration effects: Scale + fade, particles optional
- Mistake effects: Gentle shake, brief pause, explanation

**Chameleon Character:**
- Expressive eyes (blink occasionally, follow insects)
- Head tilts slightly when aiming
- Happy expression: eyes widen, slight smile
- Sad expression: eyes droop, concerned look
- Thinking expression: one eye squints, contemplative

## Insect Content Strategy

### 25 Rare Amazon Insects (5 per level)

**Level 1: Brilliant Beetles**
1. **Hercules Beetle** (*Dynastes hercules*)
   - Facts: Can lift 850x its weight; males have giant horns for fighting; horns change color based on humidity
   - Questions: "Which insect can lift 850 times its own weight?", "Which beetle's horns change color when it rains?"

2. **Glass-winged Butterfly** (*Greta oto*)
   - Facts: Wings are completely transparent; scales only on edges; can fly up to 12 km/day
   - Questions: "Which insect has wings you can see through?", "Which butterfly has no scales in the center of its wings?"

3. **Titan Beetle** (*Titanus giganteus*)
   - Facts: Largest beetle in Amazon (6.5 inches); doesn't eat as adult; strong jaws can snap pencils
   - Questions: "Which beetle can snap a pencil with its jaws?", "Which insect doesn't eat when it's fully grown?"

4. **Blue Morpho Butterfly** (*Morpho menelaus*)
   - Facts: Blue color from light reflection, not pigment; wings span up to 8 inches; caterpillars are red-brown and hairy
   - Questions: "Which butterfly's blue color comes from reflected light?", "Which insect's babies look completely different from adults?"

5. **Rainbow Scarab** (*Phanaeus vindex*)
   - Facts: Metallic rainbow colors; eats animal droppings; helps forest by recycling waste
   - Questions: "Which beetle helps clean the forest by eating waste?", "Which insect shines like a rainbow?"

**Level 2: Marvelous Ants & Social Insects**
6. **Leafcutter Ant** (*Atta cephalotes*)
   - Facts: Farms fungus underground; can carry 50x its weight; colonies have up to 8 million ants
   - Questions: "Which ant grows its own food like a farmer?", "Which insect lives in a family of millions?"

7. **Bullet Ant** (*Paraponera clavata*)
   - Facts: Most painful insect sting (24 hours of pain); name comes from sting feeling like gunshot; used in indigenous coming-of-age rituals
   - Questions: "Which ant has the most painful sting in the world?", "Which insect's sting feels like getting shot?"

8. **Army Ant** (*Eciton burchellii*)
   - Facts: No permanent home (always marching); up to 200,000 ants in one colony; can make living bridges with their bodies
   - Questions: "Which ant makes bridges out of its own body?", "Which insect never builds a nest?"

9. **Orchid Bee** (*Euglossa*)
   - Facts: Metallic green and blue colors; males collect perfumes from orchids; can hover perfectly still
   - Questions: "Which bee collects perfume from flowers?", "Which insect shines like metal?"

10. **Tarantula Hawk Wasp** (*Pepsis*)
    - Facts: Hunts giant spiders; paralyzes tarantulas with sting; lays eggs inside living spiders
    - Questions: "Which insect hunts spiders bigger than itself?", "Which wasp's babies eat spiders from the inside?"

**Level 3: Masters of Camouflage**
11. **Walking Stick** (*Phasmatodea*)
    - Facts: Looks exactly like a twig; can regrow lost legs; some can spray defensive chemicals
    - Questions: "Which insect looks like a stick?", "Which bug can grow a new leg if it loses one?"

12. **Leaf Katydid** (*Pterochroza ocellata*)
    - Facts: Wings look like dead leaves (veins and holes); can mimic leaf movement in wind; eye spots scare predators
    - Questions: "Which insect looks like a dead leaf?", "Which bug has fake eyes on its wings?"

13. **Moss Mimic Katydid** (*Mimetica*)
    - Facts: Body looks like green moss; stays perfectly still for hours; only found in cloudforests
    - Questions: "Which insect looks like fuzzy green moss?", "Which bug stays frozen for hours?"

14. **Bark Mantis** (*Liturgusa*)
    - Facts: Flat body matches tree bark texture; ambush predator; can turn head 180 degrees
    - Questions: "Which insect can turn its head all the way around?", "Which bug hides by looking like bark?"

15. **Thorn Bug** (*Umbonia crassicornis*)
    - Facts: Spike on back looks like plant thorn; lives in groups on stems; mothers guard their babies
    - Questions: "Which insect has a spike that looks like a thorn?", "Which bug mom protects her babies?"

**Level 4: Bioluminescent & Night Insects**
16. **Railroad Worm** (*Phrixothrix*)
    - Facts: Has red lights on head, green lights on sides; lights warn predators; actually a beetle larva
    - Questions: "Which insect has two different color lights?", "Which glowing bug is actually a baby beetle?"

17. **Lantern Fly** (*Fulgora laternaria*)
    - Facts: False eyespots on wings scare birds; head shaped like peanut; doesn't actually glow (old myth)
    - Questions: "Which bug has fake eyes to scare enemies?", "Which insect has a head shaped like a peanut?"

18. **Click Beetle** (*Pyrophorus*)
    - Facts: Two glowing green spots on back; can flip into air when on back; bright enough to read by
    - Questions: "Which beetle is bright enough to read by?", "Which bug can jump by clicking its body?"

19. **Firefly Beetle** (*Photinus*)
    - Facts: Flashes patterns to find mates; different species flash differently; uses chemical reaction for light
    - Questions: "Which insect talks to others using flashing lights?", "Which bug makes light with chemicals in its body?"

20. **Luna Moth** (*Actias luna*)
    - Facts: Pale green with long tails; adults don't eat (no mouth); live only 1 week as adults
    - Questions: "Which moth doesn't have a mouth?", "Which insect lives only one week as an adult?"

**Level 5: Rare & Mysterious Insects**
21. **Peanut Head Bug** (*Fulgora laternaria*) [variation]
    - Facts: Hollow head structure amplifies mating calls; looks like lizard head to scare birds; sap-sucker
    - Questions: "Which bug's head helps make its voice louder?", "Which insect's head tricks birds?"

22. **Assassin Bug** (*Reduviidae*)
    - Facts: Stabs prey with curved beak; injects venom that melts insides; some species wear dead ant corpses as camouflage
    - Questions: "Which bug wears dead ants as a disguise?", "Which insect turns its prey into liquid before eating?"

23. **Goliath Birdeater Tarantula** (*Theraphosa blondi*) [technically arachnid, but included for drama]
    - Facts: Largest spider by mass (6 oz); fangs 1 inch long; makes hissing sound; rarely eats birds
    - Questions: "Which spider is bigger than your hand?", "Which spider can make hissing sounds?"

24. **Glasswing Butterfly** (*Greta oto*) [different facts than Level 1]
    - Facts: Transparent wings hide from predators; can fly in rain (water rolls off); migrates hundreds of miles
    - Questions: "Which butterfly can fly through rainstorms?", "Which insect can travel hundreds of miles?"

25. **Jewel Beetle** (*Chrysochroa*)
    - Facts: Metallic colors last forever (even after death); ancient cultures used in jewelry; colors from nano-structures
    - Questions: "Which beetle's colors never fade?", "Which insect was used to make jewelry?"

### Question Types by Difficulty

**Easy (Level 1-2):**
- Direct matching: "Which insect has wings you can see through?"
- Physical features: "Which beetle can snap a pencil?"
- Simple behaviors: "Which ant grows its own food?"
- Word count: 8-12 words

**Medium (Level 3-4):**
- Comparisons: "Which bug can turn its head all the way around?"
- Cause/effect: "Which beetle is bright enough to read by?"
- Habitat clues: "Which insect lives only one week as an adult?"
- Word count: 12-18 words

**Hard (Level 5):**
- Multi-part facts: "Which spider is bigger than your hand and can make hissing sounds?"
- Scientific concepts: "Which insect's colors come from tiny structures, not pigments?"
- Rare vocabulary: "Which bug turns its prey into liquid before eating?"
- Word count: 15-25 words

### Fact Display Format

After catching (or missing) an insect:
```
[Full-screen overlay with caught insect illustration]

HERCULES BEETLE
(Dynastes hercules)

This incredible beetle can lift 850 times its own
weight! That's like you lifting 10 elephants.

Male hercules beetles have giant horns they use
to fight other males. The horns actually change
color based on how humid the air is - they turn
from yellow-green to black when it rains!

Hercules beetles are one of the longest beetles
in the world, growing up to 7 inches long.

[Press SPACE to continue]
```

## Implementation Plan

### Phase 1: Project Setup
- Initialize Vite + React + TypeScript project
- Install Phaser 3
- Create basic project structure (scenes, objects, managers)
- Set up Phaser config with gentle blue theme
- Create placeholder assets (colored rectangles for insects, circle for chameleon)

### Phase 2: Chameleon & Tongue Mechanic
- Build Chameleon sprite with rotation controls
- Implement arrow key rotation (smooth interpolation)
- Implement mouse aiming (alternative control method)
- Create Tongue class with extension/retraction animation
- Add tongue cooldown system
- Test feel: tongue should feel snappy and satisfying

### Phase 3: Falling Cards System
- Create QuestionCard container (text + background)
- Implement gentle falling animation (constant speed)
- Create InsectCard sprites with falling behavior
- Add horizontal drift (sine wave gentle sway)
- Spawn system: question first, then 2-4 insects staggered
- Despawn when off bottom of screen

### Phase 4: Collision & Catching
- Implement tongue-tip to insect collision detection
- Catch mechanic: insect attaches to tongue, follows retraction
- Chameleon "eats" insect at bottom (scale animation)
- Correct answer: celebration animation + fact display
- Wrong answer: gentle feedback + correct fact display
- Missed question: explanation overlay

### Phase 5: Question Management & Content
- Build insect database (25 insects with all facts)
- Create question templates (50+ questions total)
- Implement QuestionManager (pairing, shuffling, tracking)
- Add difficulty progression (word complexity by level)
- Ensure variety (no repeated questions per level)
- Validate all content for reading level (grades 2-4)

### Phase 6: Help System
- Add HelpManager (track uses, 3 per level)
- Implement 'H' key and button UI
- Visual feedback: golden glow on correct answer
- Pulsing animation (gentle, not distracting)
- Help counter display in HUD
- Recharge help between levels

### Phase 7: Level Progression
- Create 5 levels with increasing difficulty
- Level unlock system (complete previous to unlock next)
- Level intro screens (preview insects for this level)
- Score tracking (correct answers, help uses, speed)
- Level results screen (facts learned, insects discovered)
- Save progress to localStorage

### Phase 8: Visual Polish (Backgrounds & Art)
- Design 5 rainforest background layers (parallax)
- Create or source 25 insect illustrations (PNG with transparency)
- Create chameleon head expressions (neutral, happy, sad, thinking)
- Polish UI elements (cards, buttons, overlays)
- Add subtle particle effects (leaves falling, mist)
- Implement smooth transitions between screens

### Phase 9: Encyclopedia & Rewards
- Build InsectEncyclopedia component (React)
- Display all discovered insects (locked/unlocked states)
- Click insect to read full fact sheet
- Track completion percentage
- Add "Did You Know?" trivia for each insect
- Unlock system: insect added when first encountered

### Phase 10: Audio & Final Polish
- Add gentle ambient rainforest sounds (birds, water)
- Tongue shooting sound (wet, snappy)
- Correct answer chime (warm, encouraging)
- Wrong answer sound (gentle, not punishing)
- Help activation sound (magical, helpful)
- Background music (calm, exploration-themed)

### Phase 11: Accessibility & Settings
- Add difficulty settings (reading time multiplier)
- Font size options (18px, 22px, 26px)
- Colorblind mode (adjust glow colors)
- Keyboard-only controls (no mouse required)
- Screen reader support for facts (optional)
- Pause functionality (spacebar when not aiming)

### Phase 12: Playtesting & Iteration
- Test with target age group (grades 2-4)
- Observe reading behavior (skipping vs reading)
- Measure help system usage (too easy/hard?)
- Adjust falling speed based on feedback
- Refine question wording for clarity
- Balance difficulty curve

## Technical Considerations

### Performance
- **Object Pooling**: Reuse QuestionCard and InsectCard objects (Phaser Groups)
- **Lazy Loading**: Load insect sprites per level (not all 25 upfront)
- **Efficient Collision**: Only check tongue-tip point vs insect bounds (not full line)
- **Canvas Optimization**: Use Phaser's built-in culling for off-screen objects
- **Text Rendering**: Cache question text as textures (don't re-render each frame)

### Phaser-Specific Optimizations
- Use `Phaser.GameObjects.Group` for insect pooling
- Enable `setScrollFactor(0)` for fixed UI elements
- Use `Phaser.Geom.Circle` for tongue-tip collision (faster than Rectangle)
- Leverage `Phaser.Tweens.TweenManager` for all animations (hardware accelerated)
- Batch sprite draws (insects use same atlas when possible)

### Content Management
- **Insect Data**: JSON structure with TypeScript interfaces
- **Question Templates**: Separate from insect data (many questions per insect)
- **Localization Ready**: Text separated for future translation
- **Fact Validation**: Reading level checker (Lexile analyzer integration?)

### State Management
- **React State**: UI layer (menu visibility, encyclopedia, settings)
- **Phaser Registry**: Game state shared across scenes (score, level, unlocks)
- **Scene Data**: Pass data between scenes (level number, difficulty)
- **localStorage**: Persistent progress (unlocked levels, insects, high scores)
- **Event Emitters**: Bridge Phaser → React (score updates, insect catches)

**React-Phaser Bridge Example:**
```typescript
// Emit events from Phaser to React
this.events.emit('insectCaught', insectId);
this.events.emit('scoreUpdate', newScore);
this.events.emit('helpUsed', remainingHelps);

// Listen in React component
useEffect(() => {
  const game = phaserRef.current;
  const scene = game.scene.getScene('MainScene');

  scene.events.on('insectCaught', handleInsectCaught);
  scene.events.on('scoreUpdate', setScore);

  return () => {
    scene.events.off('insectCaught', handleInsectCaught);
    scene.events.off('scoreUpdate', setScore);
  };
}, []);
```

### Input Handling
- **Keyboard**: Arrow keys (rotation), Spacebar (shoot), H (help), P (pause)
- **Mouse**: Move (aim), Click (shoot)
- **Touch**: Tap screen position (aim), Second tap (shoot), Help button (UI)
- **Gamepad**: Optional support for accessibility (left stick = aim, A = shoot)

### Collision Detection Strategy
```typescript
// Efficient tongue-to-insect collision
checkTongueCollision(tongue: Tongue, insects: InsectCard[]): InsectCard | null {
  const tipX = tongue.getTipX();
  const tipY = tongue.getTipY();
  const tipCircle = new Phaser.Geom.Circle(tipX, tipY, 12);

  for (const insect of insects) {
    const insectBounds = insect.getBounds();
    if (Phaser.Geom.Intersects.CircleToRectangle(tipCircle, insectBounds)) {
      return insect; // Hit!
    }
  }

  return null; // Miss
}
```

## Educational Value

### Learning Objectives
- **Reading Comprehension**: Understand questions before acting
- **Vocabulary Expansion**: Scientific terms, descriptive language
- **Decision Making**: Evaluate multiple options under gentle time pressure
- **Scientific Literacy**: Learn real entomology facts, species diversity
- **Critical Thinking**: Match descriptions to visual features
- **Perseverance**: Use help system when stuck (normalize asking for help)

### Pedagogical Design
- **Scaffolding**: Easy questions first, build confidence
- **Spaced Repetition**: Same insects appear multiple times with different questions
- **Multi-sensory**: Visual (insect images), auditory (sounds), kinesthetic (aiming/shooting)
- **Intrinsic Motivation**: Unlock encyclopedia entries, discover rare insects
- **Growth Mindset**: Mistakes show correct answer + full explanation
- **No Punishment**: Missing questions teaches, doesn't penalize

### Reading Level Targets
- **Grade Level**: 2-4 (ages 7-10)
- **Lexile Range**: 300L - 600L
- **Vocabulary**: Mix of Tier 1 (common), Tier 2 (academic), Tier 3 (domain-specific)
- **Sentence Structure**: Simple and compound sentences, active voice
- **Word Count**: Questions 8-25 words, Facts 50-100 words

## Unique Features vs Word-Reading Game

| Aspect | Word-Reading Downhill | Chameleon Quest |
|--------|----------------------|-----------------|
| **Perspective** | Top-down ski/sled | Bottom-up aiming |
| **Reading Task** | Command words (action) | Questions + answers (comprehension) |
| **Movement** | Player moves through world | World comes to player |
| **Mechanic** | Lane switching | Aiming + shooting |
| **Failure** | Crash and restart | Gentle miss + explanation |
| **Content** | 100+ single words | 25 insects × 3-4 facts each |
| **Help System** | None | 3 helps per level |
| **Pacing** | Speed increases | Constant gentle speed |
| **Art Style** | Thin lines, pastels | Vivid insects on gentle backgrounds |
| **Educational Goal** | Sight word recognition | Comprehension + science learning |

## Modern Tech Stack Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

### Project Initialization
```bash
# Create new Vite + React + TypeScript project
npm create vite@latest chameleon-quest -- --template react-ts
cd chameleon-quest

# Install Phaser 3
npm install phaser

# Install dev dependencies (if not included)
npm install -D typescript @types/node

# Start development server
npm run dev
```

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebGL 2.0 required (Canvas fallback available)

## Asset Requirements

### Art Assets Needed
- **Chameleon**: 4 expressions × 1 head sprite = 4 PNGs
- **Insects**: 25 species × 1 sprite each = 25 PNGs
- **Backgrounds**: 5 levels × 3 parallax layers = 15 PNGs
- **UI Elements**: Card backgrounds, buttons, icons ≈ 10 PNGs
- **Total**: ~54 image assets

### Image Specifications
- **Format**: PNG with transparency
- **Chameleon Head**: 200×200px, centered pivot
- **Insect Sprites**: 150×150px average (vary by species size)
- **Backgrounds**: 1920×1080px (scale down for smaller screens)
- **Color Depth**: 24-bit RGB + 8-bit alpha
- **File Size**: <100KB each (optimize with TinyPNG)

### Font Requirements
- **Primary**: Quicksand (Google Fonts, free)
- **Readability**: Lexend (Google Fonts, dyslexia-friendly)
- **Fallback**: System sans-serif

### Audio Assets (Optional Phase 10)
- Ambient rainforest: 2-minute loop, OGG format
- Tongue shoot: Short (0.2s), wet snap sound
- Correct chime: Warm, encouraging (0.5s)
- Wrong sound: Gentle, curious (0.4s)
- Help activation: Magical sparkle (0.6s)

## Development Workflow

### Setup Phase
1. Initialize Vite + React + TypeScript
2. Install Phaser 3
3. Create basic project structure
4. Set up Phaser config with blue theme
5. Create placeholder assets (colored shapes)

### Core Loop Phase
6. Build Chameleon with rotation controls
7. Implement Tongue shooting mechanic
8. Create falling QuestionCard system
9. Add InsectCard spawning
10. Implement collision detection

### Content Phase
11. Write 25 insect fact sheets
12. Create 50+ question templates
13. Implement QuestionManager
14. Build fact display overlays
15. Add help system

### Polish Phase
16. Design 5 rainforest backgrounds
17. Create/source 25 insect illustrations
18. Create chameleon expressions
19. Add particle effects and animations
20. Implement sound effects
21. Build encyclopedia feature

### Testing Phase
22. Internal testing (bug fixes)
23. Reading level validation
24. Playtesting with target age (grades 2-4)
25. Iterate based on feedback
26. Performance optimization

## Success Criteria

### Prototype is Successful if:
✅ Players read questions completely before shooting (measured via eye-tracking or time-to-shoot)
✅ Help system is used thoughtfully (not spammed, not ignored)
✅ Players can complete Level 1 without frustration
✅ 80%+ question accuracy after seeing insect 2-3 times (learning retention)
✅ Players voluntarily explore encyclopedia after gameplay
✅ Tongue mechanic feels responsive and satisfying
✅ Reading is paced comfortably (not rushed, not boring)

### Educational Goals Met if:
✅ Players learn at least 5 insect facts per session
✅ Players can identify insects by visual features + facts
✅ Players show curiosity about insects ("Can I see more?")
✅ Reading comprehension improves across levels
✅ Players use scientific vocabulary in conversation

## Future Expansion Ideas

### Advanced Features
- **Custom Levels**: Player-created questions with provided insects
- **Multiplayer**: Co-op mode (two chameleons, take turns)
- **Daily Challenges**: Special rare insect each day
- **Photo Mode**: Screenshot encyclopedia entries to share
- **Seasonal Events**: New insects during holidays
- **Achievement System**: Badges for streaks, speed, accuracy

### Content Expansion
- **More Biomes**: Amazon River (aquatic insects), Canopy (flying insects), Cave (bioluminescent)
- **50 Total Insects**: Expand to 10 insects per level
- **Reading Passages**: Longer 3-4 sentence questions at higher levels
- **Comparison Questions**: "Which is bigger: X or Y?"
- **True/False Mode**: Alternative question format

### Accessibility
- **Text-to-Speech**: Read questions aloud (Web Speech API)
- **Dyslexia Font**: OpenDyslexic option
- **High Contrast Mode**: Increase color difference
- **Slow Mode**: Falling speed reduced 50%
- **Auto-Aim Assist**: Slight magnetic pull to correct answer (for motor difficulties)

## Quick Reference

**Start Development:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

**Key Files:**
- `src/game/config.ts` - Phaser configuration
- `src/components/PhaserGame.tsx` - Phaser container
- `src/game/scenes/MainScene.ts` - Primary game logic
- `src/data/insects.ts` - Insect database (25 entries)
- `src/data/questions.ts` - Question templates (50+)
- `src/data/theme.ts` - Blue-centered color palette

---

## Appendix: Sample Insect Data Structure

```typescript
// src/data/insects.ts
export const INSECTS: Insect[] = [
  {
    id: 'hercules-beetle',
    commonName: 'Hercules Beetle',
    scientificName: 'Dynastes hercules',
    level: 1,
    size: 'large',
    color: '#4A7BA7', // Deep blue-gray
    habitat: 'forest floor',
    diet: 'fruit, sap',
    rarity: 'uncommon',
    imageKey: 'hercules-beetle',

    facts: [
      'This incredible beetle can lift 850 times its own weight! That\'s like you lifting 10 elephants.',
      'Male hercules beetles have giant horns they use to fight other males. The horns actually change color based on how humid the air is.',
      'Hercules beetles are one of the longest beetles in the world, growing up to 7 inches long.'
    ],

    questions: [
      {
        id: 'hercules-1',
        text: 'Which insect can lift 850 times its own weight?',
        difficulty: 'easy',
        type: 'identification'
      },
      {
        id: 'hercules-2',
        text: 'Which beetle\'s horns change color when it rains?',
        difficulty: 'medium',
        type: 'behavior'
      },
      {
        id: 'hercules-3',
        text: 'Which insect can grow to be 7 inches long?',
        difficulty: 'easy',
        type: 'comparison'
      }
    ]
  },

  // ... 24 more insects
];
```

---

**Document Version:** 1.0
**Created:** November 2025
**For:** Chameleon's Quest: Amazon Insect Reading Adventure
**Tech Foundation:** Phaser 3 + React + TypeScript + Vite
**Target Audience:** Grades 2-4 (ages 7-10)
**Core Mechanic:** Read → Aim → Shoot → Learn

---

*Plan ready for modern prototyping - Phaser 3 handles smooth animations and collision, React manages educational content display, focus remains on reading comprehension and discovery.*
