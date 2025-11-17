# Chameleon Quest - Asset Requirements

## Directory Structure

```
assets/
├── backgrounds/      # Rainforest background layers for parallax
├── chameleon/       # Chameleon head expressions
├── insects/         # 25 insect illustrations
├── particles/       # Particle effect textures
└── ui/             # UI elements (buttons, icons)
```

## Background Assets (5 layers)

Create 5 PNG files for parallax backgrounds, dimensions: 1920×1080px

1. **level-bg-sky.png** - Sky gradient layer
   - Soft azure (#A8D8EA) to misty blue (#E8F4F8)
   - No movement (static background)

2. **level-bg-distant-canopy.png** - Distant canopy layer
   - Blurred silhouettes, 70% opacity
   - Dusty blue-green (#7BA7BC)
   - Slow parallax movement (0.2x speed)

3. **level-bg-mid-canopy.png** - Mid-canopy layer
   - Sharper leaves, 85% opacity
   - Sage teal (#88B8A8)
   - Medium parallax movement (0.5x speed)

4. **level-bg-foreground.png** - Foreground vines/leaves
   - Crisp detail, full opacity
   - Frame edges of screen
   - Fast parallax movement (1.5x speed)

5. **level-bg-floor.png** - Forest floor
   - Soft moss green (#B8C8B0)
   - Bottom 200px of screen
   - No movement (static)

## Chameleon Assets (4 expressions)

Create 4 PNG files, dimensions: 200×200px, centered pivot

1. **chameleon-head-neutral.png**
   - Minty green-blue (#7BC8A0) base
   - Light seafoam highlights (#A8E0C8)
   - Warm golden eye (#F4C430)
   - Relaxed expression

2. **chameleon-head-happy.png**
   - Same colors as neutral
   - Eyes wide, slight smile
   - Celebratory expression

3. **chameleon-head-sad.png**
   - Same colors as neutral
   - Eyes droop, concerned look
   - Gentle disappointment

4. **chameleon-head-thinking.png**
   - Same colors as neutral
   - One eye squints
   - Contemplative expression

## Insect Assets (25 illustrations)

Create 25 PNG files with transparency, average dimensions: 150×150px (vary by species size)

### Level 1: Brilliant Beetles (5 insects)
1. **hercules-beetle.png** - Large, blue-gray beetle with giant horns
2. **glass-wing-butterfly.png** - Transparent wings, small body
3. **titan-beetle.png** - Very large brown beetle
4. **blue-morpho-butterfly.png** - Bright blue wings, 8-inch span
5. **rainbow-scarab.png** - Metallic rainbow colors

### Level 2: Marvelous Ants & Social Insects (5 insects)
6. **leafcutter-ant.png** - Red-brown ant carrying leaf piece
7. **bullet-ant.png** - Large black ant
8. **army-ant.png** - Marching ant formation
9. **orchid-bee.png** - Metallic green-blue bee
10. **tarantula-hawk-wasp.png** - Large blue-black wasp

### Level 3: Masters of Camouflage (5 insects)
11. **walking-stick.png** - Brown stick-like insect
12. **leaf-katydid.png** - Dead leaf appearance with veins
13. **moss-mimic-katydid.png** - Green mossy texture
14. **bark-mantis.png** - Flat, bark-textured mantis
15. **thorn-bug.png** - Spike on back, green

### Level 4: Bioluminescent & Night Insects (5 insects)
16. **railroad-worm.png** - Red head lights, green side lights
17. **lantern-fly.png** - Peanut-shaped head, eyespots
18. **click-beetle.png** - Two green glowing spots
19. **firefly-beetle.png** - Glowing abdomen
20. **luna-moth.png** - Pale green with long tails

### Level 5: Rare & Mysterious Insects (5 insects)
21. **peanut-head-bug.png** - Lizard-like head structure
22. **assassin-bug.png** - Curved beak, menacing
23. **goliath-birdeater.png** - Large spider
24. **glasswing-butterfly-v2.png** - Alternative angle/facts
25. **jewel-beetle.png** - Metallic colors, iridescent

## Particle Assets

Create small PNG textures for particle effects:

1. **leaf-particle.png** - 16×16px, simple leaf shape, semi-transparent
2. **mist-particle.png** - 32×32px, soft cloud, very transparent
3. **sparkle-particle.png** - 8×8px, star shape, for celebration

## UI Assets

1. **help-button.png** - 64×64px, golden "?" icon
2. **pause-button.png** - 64×64px, pause icon
3. **card-background.png** - 400×120px, rounded rectangle template

## Color Palette Reference

### Primary Colors (Blue-Centered Rainforest)
- Sky: #A8D8EA → #E8F4F8
- Canopy distant: #7BA7BC
- Canopy mid: #88B8A8
- Forest floor: #B8C8B0
- Water: #A0C4D8

### Chameleon Colors
- Skin base: #7BC8A0
- Highlights: #A8E0C8
- Eye: #F4C430
- Tongue: #F4A6C6

### UI Colors
- Question card: #E8F4F8 (bg), #7BA7BC (border)
- Correct: #A8E0C8
- Incorrect: #F4C8A8
- Help: #F4C430
- Text: #2C3E50

## Image Specifications

- **Format**: PNG with transparency (24-bit RGB + 8-bit alpha)
- **Optimization**: Compress with TinyPNG or similar (<100KB each)
- **Style**: Scientifically accurate but stylized, clean vector-style
- **Outlines**: No harsh black - use darker versions of fill colors
- **Shadows**: Subtle drop shadows, blue-tinted

## Placeholder Assets

For development, simple colored shapes can be used:
- Backgrounds: Gradient rectangles with appropriate colors
- Chameleon: Circle with color for each expression
- Insects: Colored circles/rectangles with species color from database
- Particles: Small colored circles

## Asset Loading

All assets should be loaded in `MainScene.preload()` and `MenuScene.preload()` using Phaser's asset loader:

```typescript
this.load.image('chameleon-head-neutral', 'assets/chameleon/chameleon-head-neutral.png')
this.load.image('hercules-beetle', 'assets/insects/hercules-beetle.png')
this.load.image('level-bg-sky', 'assets/backgrounds/level-bg-sky.png')
```
