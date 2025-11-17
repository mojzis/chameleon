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
  },
  backgroundColor: '#E8F4F8',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
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
  rotationSpeed: 0.15, // Increased from 0.1 for snappier feel
  rotationDamping: 0.15, // Velocity damping
  maxRotationVelocity: 180, // Max degrees per frame
} as const

export const CARD_CONFIG = {
  questionFallSpeed: 30, // pixels per second
  insectFallSpeed: 40, // pixels per second (slightly faster than questions)
  descentTimeout: 15000, // milliseconds before cards are unreachable
  questionStartY: -100, // Start above screen
  insectStartY: -50, // Start slightly below question
} as const

export const SPAWN_CONFIG = {
  // Question spawning
  questionSpawnX: 960, // Center X position
  questionSpawnInterval: 8000, // 8 seconds between questions

  // Insect spawning
  insectSpawnDelay: 1500, // Wait 1.5s after question before spawning insects
  insectSpawnStagger: 400, // 0.4s between each insect spawn
  insectSpawnXMin: 300, // Left boundary for insect spawn
  insectSpawnXMax: 1620, // Right boundary for insect spawn
  insectSpacing: 200, // Minimum horizontal spacing between insects

  // Timing
  readingTime: 8000, // 8 seconds to read and respond
  maxActiveQuestions: 2, // Max questions on screen at once
} as const

export const TONGUE_CONFIG = {
  maxLength: 400,
  extensionDuration: 180, // ms - snappy extension
  retractionDuration: 250, // ms - slightly slower retraction
  cooldownMs: 1000,
  tipRadius: 12,
  baseTaperRatio: 0.8, // Where taper starts (80% down tongue)
} as const

export const FEEL_CONFIG = {
  // Tongue timing (ms)
  TONGUE_EXTENSION_TIME: 180, // Snappy!
  TONGUE_RETRACTION_TIME: 250, // Slightly slower
  TONGUE_COOLDOWN: 1000, // 1 second between shots

  // Chameleon timing
  ROTATION_RESPONSE_TIME: 50, // ms to reach 63% of target
  EXPRESSION_TRANSITION_TIME: 200, // ms for expression changes
  COOLDOWN_INDICATOR_PULSE: 800, // ms for cooldown ring pulse

  // Visual feedback timing
  IMPACT_SHAKE_DURATION: 100, // ms
  IMPACT_FREEZE_FRAMES: 4, // frames to pause on impact (60fps)
  PARTICLE_LIFETIME: 500, // ms
} as const

export const AUDIO_HOOKS = {
  TONGUE_SHOOT: 'sound:tongue-shoot', // Wet, snappy sound (0.2s)
  CATCH_CORRECT: 'sound:catch-correct', // Warm chime (0.5s)
  CATCH_WRONG: 'sound:catch-wrong', // Gentle curious tone (0.4s)
  COOLDOWN_TICK: 'sound:cooldown-tick', // Subtle tick (0.1s)
  HELP_ACTIVATE: 'sound:help-activate', // Magical sparkle (0.6s)
} as const
