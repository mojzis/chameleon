import { describe, it, expect, beforeEach, vi } from 'vitest'
import Phaser from 'phaser'
import { Chameleon } from '../../game/objects/Chameleon'
import { CHAMELEON_CONFIG, FEEL_CONFIG } from '../../game/config'

describe('Chameleon', () => {
  let scene: Phaser.Scene
  let chameleon: Chameleon

  beforeEach(() => {
    // Create minimal mock scene
    scene = {
      add: {
        existing: vi.fn().mockReturnThis(),
        circle: vi.fn().mockReturnValue({
          setStrokeStyle: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
        }),
        arc: vi.fn().mockReturnValue({
          setStrokeStyle: vi.fn().mockReturnThis(),
        }),
        graphics: vi.fn().mockReturnValue({
          setAlpha: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeCircle: vi.fn().mockReturnThis(),
          fillStyle: vi.fn().mockReturnThis(),
          fillCircle: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
      physics: {
        add: {
          existing: vi.fn(),
        },
      },
      time: {
        delayedCall: vi.fn(),
        now: 0,
      },
      tweens: {
        add: vi.fn(),
      },
      cameras: {
        main: {
          shake: vi.fn(),
        },
      },
    } as unknown as Phaser.Scene

    chameleon = new Chameleon(scene, 960, 950)
  })

  describe('Rotation System', () => {
    it('should initialize with zero rotation', () => {
      expect(chameleon['currentAngle']).toBe(0)
      expect(chameleon['targetAngle']).toBe(0)
    })

    it('should clamp rotation within min/max angles', () => {
      chameleon.aimLeft()
      chameleon.aimLeft()
      chameleon.aimLeft()
      // Each aimLeft adds -5, so after 3 calls: -15
      expect(chameleon['targetAngle']).toBe(-15)

      // Test extreme left (should clamp at -90)
      for (let i = 0; i < 20; i++) {
        chameleon.aimLeft()
      }
      expect(chameleon['targetAngle']).toBe(CHAMELEON_CONFIG.minAngle)

      // Test extreme right (should clamp at 90)
      for (let i = 0; i < 50; i++) {
        chameleon.aimRight()
      }
      expect(chameleon['targetAngle']).toBe(CHAMELEON_CONFIG.maxAngle)
    })

    it('should apply Power2-like easing for rotation', () => {
      // Set a large target angle difference
      chameleon['targetAngle'] = 45
      chameleon['currentAngle'] = 0

      // Call private method through bracket notation
      const easingFactor = chameleon['calculateRotationEasing'](45)

      // Power2 easing: 1 + normalized^2
      // normalized = 45/90 = 0.5
      // easing = 1 + 0.5^2 = 1.25
      expect(easingFactor).toBeCloseTo(1.25, 2)
    })

    it('should have higher easing factor for larger angle differences', () => {
      const smallAngleEasing = chameleon['calculateRotationEasing'](10)
      const largeAngleEasing = chameleon['calculateRotationEasing'](80)

      expect(largeAngleEasing).toBeGreaterThan(smallAngleEasing)
    })

    it('should smoothly approach target angle over time', () => {
      chameleon['targetAngle'] = 45
      chameleon['currentAngle'] = 0

      // Simulate several frames
      const delta = 16.67 // ~60fps
      for (let i = 0; i < 10; i++) {
        chameleon.update(delta)
      }

      // Should have moved towards target but not overshot
      expect(chameleon['currentAngle']).toBeGreaterThan(0)
      expect(chameleon['currentAngle']).toBeLessThan(45)
    })

    it('should respect frame-time independence', () => {
      chameleon['targetAngle'] = 45

      // Test at 60fps
      const delta60 = 16.67
      const chameleon60 = new Chameleon(scene, 960, 950)
      chameleon60['targetAngle'] = 45
      chameleon60.update(delta60)
      const angle60 = chameleon60['currentAngle']

      // Test at 30fps (should move roughly 2x per frame)
      const delta30 = 33.33
      const chameleon30 = new Chameleon(scene, 960, 950)
      chameleon30['targetAngle'] = 45
      chameleon30.update(delta30)
      const angle30 = chameleon30['currentAngle']

      // 30fps should move approximately twice as much per frame
      expect(angle30).toBeGreaterThan(angle60 * 1.8)
      expect(angle30).toBeLessThan(angle60 * 2.2)
    })

    it('should update aiming state based on movement', () => {
      // Start with no movement
      chameleon['targetAngle'] = 0
      chameleon['currentAngle'] = 0
      chameleon.update(16.67)
      expect(chameleon['aiming']).toBe(false)

      // Create movement
      chameleon['targetAngle'] = 45
      chameleon.update(16.67)
      // After update, there should be a difference triggering aiming state
      expect(Math.abs(chameleon['targetAngle'] - chameleon['currentAngle'])).toBeGreaterThan(2)
    })

    it('should aim at a specific point correctly', () => {
      // Chameleon at (960, 950), aiming at point (1000, 900)
      chameleon.aimAtPoint(1000, 900)

      // Calculate expected angle
      const expectedAngle = Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(960, 950, 1000, 900)
      ) - 90

      expect(chameleon['targetAngle']).toBeCloseTo(expectedAngle, 1)
    })
  })

  describe('Expression System', () => {
    it('should initialize with neutral expression', () => {
      expect(chameleon['expression']).toBe('neutral')
    })

    it('should change to happy expression', () => {
      chameleon.setExpression('happy')
      expect(chameleon['expression']).toBe('happy')
      expect(scene.tweens.add).toHaveBeenCalled()
    })

    it('should change to sad expression', () => {
      chameleon.setExpression('sad')
      expect(chameleon['expression']).toBe('sad')
      expect(scene.tweens.add).toHaveBeenCalled()
    })

    it('should change to thinking expression', () => {
      chameleon.setExpression('thinking')
      expect(chameleon['expression']).toBe('thinking')
      expect(scene.tweens.add).toHaveBeenCalled()
    })

    it('should not update expression if already in that state', () => {
      const tweenCallCount = (scene.tweens.add as any).mock.calls.length
      chameleon.setExpression('neutral')
      chameleon.setExpression('neutral')
      chameleon.setExpression('neutral')

      // Should only add tweens once (for the first call)
      expect((scene.tweens.add as any).mock.calls.length).toBe(tweenCallCount)
    })

    it('should transition expressions with correct timing', () => {
      chameleon.setExpression('happy')

      const tweenCalls = (scene.tweens.add as any).mock.calls
      const lastTween = tweenCalls[tweenCalls.length - 1][0]

      // Check that duration matches EXPRESSION_TRANSITION_TIME
      expect(lastTween.duration).toBe(FEEL_CONFIG.EXPRESSION_TRANSITION_TIME)
    })

    it('should set thinking expression when cooling down', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // Cooldown should trigger thinking expression
      expect(chameleon['expression']).toBe('thinking')
    })

    it('should return to neutral after cooldown ends', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)
      expect(chameleon['expression']).toBe('thinking')

      // Simulate cooldown completion
      chameleon['setCoolingDown'](false)
      expect(chameleon['expression']).toBe('neutral')
    })
  })

  describe('Tongue Shooting', () => {
    it('should shoot tongue when not on cooldown', () => {
      scene.time.now = 0
      const result = chameleon.shootTongue(scene)

      expect(result).toBe(true)
      expect(chameleon.getTongue()).toBeTruthy()
      expect(chameleon.getLastTongueTime()).toBe(0)
    })

    it('should not shoot tongue when already active', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      const result = chameleon.shootTongue(scene)
      expect(result).toBe(false)
    })

    it('should not shoot tongue during cooldown', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // Clear tongue to simulate completion
      chameleon.clearTongue()

      // Try to shoot again immediately (still in cooldown)
      scene.time.now = 500 // 500ms later
      const result = chameleon.shootTongue(scene)

      expect(result).toBe(false)
      expect(chameleon.getTongue()).toBeNull()
    })

    it('should allow shooting after cooldown expires', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)
      chameleon.clearTongue()

      // Wait full cooldown period
      scene.time.now = 1000
      const result = chameleon.shootTongue(scene)

      expect(result).toBe(true)
      expect(chameleon.getTongue()).toBeTruthy()
    })

    it('should accurately track cooldown state', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // During cooldown
      scene.time.now = 500
      expect(chameleon.isCoolingDown()).toBe(true)

      // At cooldown boundary
      scene.time.now = 999
      expect(chameleon.isCoolingDown()).toBe(true)

      // After cooldown
      scene.time.now = 1000
      expect(chameleon.isCoolingDown()).toBe(false)
    })
  })

  describe('Input Buffering System', () => {
    it('should buffer input when shooting during cooldown', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // Try to shoot during cooldown
      scene.time.now = 500
      const result = chameleon.shootTongue(scene)

      expect(result).toBe(false)
      expect(chameleon['inputBuffer']).toBe(true)
    })

    it('should execute buffered input after cooldown', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // Buffer input during cooldown
      scene.time.now = 500
      chameleon.shootTongue(scene)
      expect(chameleon['inputBuffer']).toBe(true)

      // Simulate tongue finishing
      const tongue = chameleon.getTongue()
      if (tongue) {
        tongue['finished'] = true
        chameleon.update(16.67)
      }

      // Move past cooldown
      scene.time.now = 1000
      chameleon.update(16.67)

      // Buffered input should have executed
      expect(chameleon['inputBuffer']).toBe(false)
      expect(chameleon.getTongue()).toBeTruthy()
    })

    it('should clear input buffer on successful shot', () => {
      scene.time.now = 0
      chameleon['inputBuffer'] = true

      const result = chameleon.shootTongue(scene)

      expect(result).toBe(true)
      expect(chameleon['inputBuffer']).toBe(false)
    })

    it('should allow manual input buffering', () => {
      chameleon.bufferInput()
      expect(chameleon['inputBuffer']).toBe(true)
    })

    it('should not execute buffered input if tongue is still active', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // Buffer input
      scene.time.now = 500
      chameleon.bufferInput()

      // Move past cooldown but tongue still active
      scene.time.now = 1000
      chameleon.update(16.67)

      // Should not shoot because tongue is still active
      expect(chameleon['inputBuffer']).toBe(true)
    })
  })

  describe('Cooldown Visual Indicators', () => {
    it('should create cooldown indicator when shooting', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      expect(chameleon['cooldownIndicator']).toBeTruthy()
    })

    it('should remove cooldown indicator after cooldown', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      const indicator = chameleon['cooldownIndicator']
      expect(indicator).toBeTruthy()

      // Simulate cooldown end
      chameleon['setCoolingDown'](false)

      expect(chameleon['cooldownIndicator']).toBeNull()
    })

    it('should pulse cooldown indicator during cooldown period', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      // Check that tween was created with correct duration
      const tweenCalls = (scene.tweens.add as any).mock.calls
      const cooldownTween = tweenCalls.find((call: any) =>
        call[0].duration === 1000 && // TONGUE_CONFIG.cooldownMs
        call[0].targets === chameleon['cooldownIndicator']
      )

      expect(cooldownTween).toBeTruthy()
    })
  })

  describe('Timing Precision', () => {
    it('should enforce exactly 1000ms cooldown', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)
      chameleon.clearTongue()

      // Test at 999ms - should still be cooling down
      scene.time.now = 999
      expect(chameleon.isCoolingDown()).toBe(true)
      expect(chameleon.shootTongue(scene)).toBe(false)

      // Test at exactly 1000ms - should be ready
      scene.time.now = 1000
      expect(chameleon.isCoolingDown()).toBe(false)
      expect(chameleon.shootTongue(scene)).toBe(true)
    })

    it('should track last tongue shot time accurately', () => {
      scene.time.now = 12345
      chameleon.shootTongue(scene)

      expect(chameleon.getLastTongueTime()).toBe(12345)

      chameleon.clearTongue()
      scene.time.now = 15000
      chameleon.shootTongue(scene)

      expect(chameleon.getLastTongueTime()).toBe(15000)
    })
  })

  describe('Update Loop Integration', () => {
    it('should update tongue during update cycle', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      const tongue = chameleon.getTongue()
      expect(tongue).toBeTruthy()

      // Mock tongue update
      const updateSpy = vi.spyOn(tongue!, 'update')

      chameleon.update(16.67)

      expect(updateSpy).toHaveBeenCalledWith(16.67)
    })

    it('should clear tongue when finished', () => {
      scene.time.now = 0
      chameleon.shootTongue(scene)

      const tongue = chameleon.getTongue()
      expect(tongue).toBeTruthy()

      // Mark tongue as finished
      tongue!['finished'] = true

      chameleon.update(16.67)

      expect(chameleon.getTongue()).toBeNull()
    })

    it('should continue rotation smoothing during tongue animation', () => {
      scene.time.now = 0
      chameleon['targetAngle'] = 45
      chameleon.shootTongue(scene)

      const initialAngle = chameleon['currentAngle']

      chameleon.update(16.67)

      // Rotation should still update even with active tongue
      expect(chameleon['currentAngle']).not.toBe(initialAngle)
    })
  })
})
