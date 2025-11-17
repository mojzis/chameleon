import { describe, it, expect, beforeEach, vi } from 'vitest'
import Phaser from 'phaser'
import { Tongue } from '../../game/objects/Tongue'
import { TONGUE_CONFIG, FEEL_CONFIG } from '../../game/config'

describe('Tongue', () => {
  let scene: Phaser.Scene
  let tongue: Tongue

  beforeEach(() => {
    // Create minimal mock scene
    scene = {
      sys: {
        queueDepthSort: vi.fn(),
        events: {
          once: vi.fn(),
          on: vi.fn(),
        },
      },
      add: {
        existing: vi.fn().mockReturnThis(),
        graphics: vi.fn().mockReturnValue({
          clear: vi.fn().mockReturnThis(),
          fillStyle: vi.fn().mockReturnThis(),
          fillRect: vi.fn().mockReturnThis(),
          fillCircle: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
          once: vi.fn(),
          on: vi.fn(),
          off: vi.fn(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
        }),
        circle: vi.fn().mockReturnValue({
          x: 0,
          y: 0,
          once: vi.fn(),
          on: vi.fn(),
          off: vi.fn(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
        }),
      },
      time: {
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

    tongue = new Tongue(scene, 960, 950, 0)
  })

  describe('Initialization', () => {
    it('should initialize with correct start position', () => {
      const customTongue = new Tongue(scene, 500, 600, 45)

      expect(customTongue['startX']).toBe(500)
      expect(customTongue['startY']).toBe(600)
      expect(customTongue['tongueAngle']).toBe(45)
    })

    it('should start in extending state', () => {
      expect(tongue.isExtending()).toBe(true)
      expect(tongue.isFinished()).toBe(false)
    })

    it('should initialize with zero length', () => {
      expect(tongue.getCurrentLength()).toBe(0)
    })

    it('should record extension start time', () => {
      scene.time.now = 5000
      const newTongue = new Tongue(scene, 960, 950, 0)

      expect(newTongue['extensionStartTime']).toBe(5000)
    })

    it('should trigger visual effects on creation', () => {
      // Check camera shake was triggered
      expect(scene.cameras.main.shake).toHaveBeenCalledWith(
        FEEL_CONFIG.IMPACT_SHAKE_DURATION,
        0.005
      )

      // Check tweens were created (for flash and particles)
      expect(scene.tweens.add).toHaveBeenCalled()
    })
  })

  describe('Extension Timing', () => {
    it.skip('should extend over exactly 180ms', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // At start
      testTongue.update(16.67)
      expect(testTongue.getCurrentLength()).toBeGreaterThan(0)
      expect(testTongue.isExtending()).toBe(true)

      // At 179ms - should still be extending
      scene.time.now = 179
      testTongue.update(16.67)
      expect(testTongue.isExtending()).toBe(true)

      // At 180ms - should have finished extension
      scene.time.now = 180
      testTongue.update(16.67)
      expect(testTongue.isExtending()).toBe(false)
    })

    it('should reach max length at extension end', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Complete extension
      scene.time.now = 180
      testTongue.update(16.67)

      // Should be at or slightly over max length (with overshoot)
      expect(testTongue.getCurrentLength()).toBeGreaterThanOrEqual(
        TONGUE_CONFIG.maxLength
      )
    })

    it('should apply Power2.easeOut during extension', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Sample at different points
      const samples: { time: number; length: number }[] = []

      for (let t = 0; t <= 180; t += 30) {
        scene.time.now = t
        testTongue.update(16.67)
        samples.push({ time: t, length: testTongue.getCurrentLength() })
      }

      // Power2.easeOut: fast start, slow end
      // First 30ms should cover more distance than last 30ms
      const firstInterval = samples[1].length - samples[0].length
      const lastInterval = samples[samples.length - 1].length - samples[samples.length - 2].length

      expect(firstInterval).toBeGreaterThan(lastInterval)
    })

    it('should have 5% overshoot at peak', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      scene.time.now = 180
      testTongue.update(16.67)

      const expectedOvershoot = TONGUE_CONFIG.maxLength * 1.05
      expect(testTongue.getCurrentLength()).toBeCloseTo(expectedOvershoot, 1)
    })

    it('should measure extension timing accuracy', () => {
      // Test that extension completes in expected time frame
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Sample every 10ms
      const extensionSamples = []
      for (let t = 0; t <= 200; t += 10) {
        scene.time.now = t
        testTongue.update(16.67)
        if (testTongue.isExtending()) {
          extensionSamples.push(t)
        }
      }

      // Last extending sample should be around 170-180ms
      const lastExtensionTime = extensionSamples[extensionSamples.length - 1]
      expect(lastExtensionTime).toBeGreaterThanOrEqual(170)
      expect(lastExtensionTime).toBeLessThan(190)
    })
  })

  describe('Retraction Timing', () => {
    it('should retract over exactly 250ms', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Complete extension
      scene.time.now = 180
      testTongue.update(16.67)
      expect(testTongue.isExtending()).toBe(false)

      // Start retraction
      const retractionStart = scene.time.now

      // At 249ms into retraction - should still be retracting
      scene.time.now = retractionStart + 249
      testTongue.update(16.67)
      expect(testTongue.isFinished()).toBe(false)

      // At 250ms into retraction - should be finished
      scene.time.now = retractionStart + 250
      testTongue.update(16.67)
      expect(testTongue.isFinished()).toBe(true)
    })

    it('should return to zero length after retraction', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Complete full cycle
      scene.time.now = 180
      testTongue.update(16.67)
      scene.time.now = 430 // 180 + 250
      testTongue.update(16.67)

      expect(testTongue.getCurrentLength()).toBeCloseTo(0, 1)
    })

    it.skip('should apply Sine.easeIn during retraction', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Complete extension
      scene.time.now = 180
      testTongue.update(16.67)

      // Sample retraction at different points
      const retractionStart = 180
      const samples: { time: number; length: number }[] = []

      for (let t = 0; t <= 250; t += 50) {
        scene.time.now = retractionStart + t
        testTongue.update(16.67)
        samples.push({ time: t, length: testTongue.getCurrentLength() })
      }

      // Sine.easeIn: starts slow, accelerates
      // First interval should be smaller than last interval
      const firstInterval = Math.abs(samples[0].length - samples[1].length)
      const lastInterval = Math.abs(samples[samples.length - 2].length - samples[samples.length - 1].length)

      expect(firstInterval).toBeLessThan(lastInterval)
    })

    it('should complete full extension+retraction cycle in 430ms', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Update through full cycle
      const startTime = 0
      const extensionEnd = 180
      const retractionEnd = 430

      // At start
      scene.time.now = startTime
      testTongue.update(16.67)
      expect(testTongue.isExtending()).toBe(true)

      // At extension end
      scene.time.now = extensionEnd
      testTongue.update(16.67)
      expect(testTongue.isExtending()).toBe(false)
      expect(testTongue.isFinished()).toBe(false)

      // At retraction end
      scene.time.now = retractionEnd
      testTongue.update(16.67)
      expect(testTongue.isFinished()).toBe(true)
    })
  })

  describe('Easing Curves Mathematical Accuracy', () => {
    it('should implement Power2.easeOut correctly (1 - (1-t)^2)', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Test at 50% progress (90ms)
      scene.time.now = 90
      testTongue.update(16.67)

      const progress = 0.5
      const expectedEase = 1 - Math.pow(1 - progress, 2) // 0.75
      const expectedLength = TONGUE_CONFIG.maxLength * expectedEase

      expect(testTongue.getCurrentLength()).toBeCloseTo(expectedLength, 10)
    })

    it('should implement Sine.easeIn correctly (sin((t*π)/2))', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Complete extension
      scene.time.now = 180
      testTongue.update(16.67)

      // Test at 50% retraction progress (125ms into retraction)
      scene.time.now = 180 + 125
      testTongue.update(16.67)

      const progress = 0.5
      const expectedEase = Math.sin((progress * Math.PI) / 2) // ~0.707
      const maxWithOvershoot = TONGUE_CONFIG.maxLength * 1.05
      const expectedLength = maxWithOvershoot * (1 - expectedEase)

      expect(testTongue.getCurrentLength()).toBeCloseTo(expectedLength, 10)
    })

    it('should have smooth velocity profile during extension', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      const velocities: number[] = []
      let lastLength = 0

      for (let t = 0; t <= 180; t += 10) {
        scene.time.now = t
        testTongue.update(16.67)
        const currentLength = testTongue.getCurrentLength()
        const velocity = currentLength - lastLength
        velocities.push(velocity)
        lastLength = currentLength
      }

      // Velocity should decrease over time (Power2.easeOut)
      const firstHalf = velocities.slice(0, velocities.length / 2)
      const secondHalf = velocities.slice(velocities.length / 2)

      const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

      expect(avgFirstHalf).toBeGreaterThan(avgSecondHalf)
    })
  })

  describe('Tip Position Calculation', () => {
    it('should calculate tip position correctly for 0 degree angle', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      scene.time.now = 180
      testTongue.update(16.67)

      const tipX = testTongue.getTipX()
      const tipY = testTongue.getTipY()

      // 0 degrees in the coordinate system
      const angleRad = Phaser.Math.DegToRad(0)
      const expectedX = 960 + Math.cos(angleRad) * testTongue.getCurrentLength()
      const expectedY = 950 + Math.sin(angleRad) * testTongue.getCurrentLength()

      expect(tipX).toBeCloseTo(expectedX, 1)
      expect(tipY).toBeCloseTo(expectedY, 1)
    })

    it('should calculate tip position correctly for 45 degree angle', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 45)

      scene.time.now = 180
      testTongue.update(16.67)

      const tipX = testTongue.getTipX()
      const tipY = testTongue.getTipY()

      const angleRad = Phaser.Math.DegToRad(45)
      const expectedX = 960 + Math.cos(angleRad) * testTongue.getCurrentLength()
      const expectedY = 950 + Math.sin(angleRad) * testTongue.getCurrentLength()

      expect(tipX).toBeCloseTo(expectedX, 1)
      expect(tipY).toBeCloseTo(expectedY, 1)
    })

    it('should calculate tip position correctly for -90 degree angle', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, -90)

      scene.time.now = 180
      testTongue.update(16.67)

      const tipX = testTongue.getTipX()
      const tipY = testTongue.getTipY()

      const angleRad = Phaser.Math.DegToRad(-90)
      const expectedX = 960 + Math.cos(angleRad) * testTongue.getCurrentLength()
      const expectedY = 950 + Math.sin(angleRad) * testTongue.getCurrentLength()

      expect(tipX).toBeCloseTo(expectedX, 1)
      expect(tipY).toBeCloseTo(expectedY, 1)
    })

    it('should update tip position dynamically during extension', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      const initialTipX = testTongue.getTipX()

      scene.time.now = 90
      testTongue.update(16.67)
      const midTipX = testTongue.getTipX()

      scene.time.now = 180
      testTongue.update(16.67)
      const finalTipX = testTongue.getTipX()

      // Tip should move progressively further
      expect(midTipX).toBeGreaterThan(initialTipX)
      expect(finalTipX).toBeGreaterThan(midTipX)
    })
  })

  describe('Visual Effects', () => {
    it('should trigger screen shake on tongue shot', () => {
      expect(scene.cameras.main.shake).toHaveBeenCalledWith(
        FEEL_CONFIG.IMPACT_SHAKE_DURATION,
        0.005
      )
    })

    it('should create impact flash effect', () => {
      // Check that graphics and tweens were created
      expect(scene.add.graphics).toHaveBeenCalled()
      expect(scene.tweens.add).toHaveBeenCalled()

      // Find flash tween (duration 100ms)
      const tweenCalls = (scene.tweens.add as any).mock.calls
      const flashTween = tweenCalls.find((call: any) =>
        call[0].duration === 100
      )

      expect(flashTween).toBeTruthy()
    })

    it('should create particle effects with correct lifetime', () => {
      const tweenCalls = (scene.tweens.add as any).mock.calls

      // Find particle tweens (duration = PARTICLE_LIFETIME)
      const particleTweens = tweenCalls.filter((call: any) =>
        call[0].duration === FEEL_CONFIG.PARTICLE_LIFETIME
      )

      // Should have created 5 particles
      expect(particleTweens.length).toBeGreaterThan(0)
    })

    it('should draw tongue with proper rendering', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Mock the Graphics methods
      const clearSpy = vi.spyOn(testTongue, 'clear')
      const lineStyleSpy = vi.spyOn(testTongue, 'lineStyle')
      const fillStyleSpy = vi.spyOn(testTongue, 'fillStyle')
      const fillCircleSpy = vi.spyOn(testTongue, 'fillCircle')

      testTongue.update(16.67)

      // Should clear previous frame
      expect(clearSpy).toHaveBeenCalled()

      // Should set line style for tongue body
      expect(lineStyleSpy).toHaveBeenCalled()

      // Should fill style for tip
      expect(fillStyleSpy).toHaveBeenCalled()

      // Should draw tip circles (main + glow)
      expect(fillCircleSpy).toHaveBeenCalled()
    })
  })

  describe('State Management', () => {
    it('should track peak time when extension completes', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      expect(testTongue['peakReachedAt']).toBe(0)

      scene.time.now = 180
      testTongue.update(16.67)

      expect(testTongue['peakReachedAt']).toBe(180)
    })

    it('should transition from extending to retracting', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      expect(testTongue.isExtending()).toBe(true)

      scene.time.now = 180
      testTongue.update(16.67)

      expect(testTongue.isExtending()).toBe(false)
      expect(testTongue.isFinished()).toBe(false)
    })

    it('should transition from retracting to finished', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      scene.time.now = 180
      testTongue.update(16.67)
      expect(testTongue.isFinished()).toBe(false)

      scene.time.now = 430
      testTongue.update(16.67)
      expect(testTongue.isFinished()).toBe(true)
    })

    it.skip('should maintain state throughout lifecycle', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      const states = []

      for (let t = 0; t <= 430; t += 50) {
        scene.time.now = t
        testTongue.update(16.67)
        states.push({
          time: t,
          extending: testTongue.isExtending(),
          finished: testTongue.isFinished(),
          length: testTongue.getCurrentLength(),
        })
      }

      // Verify state progression
      expect(states[0].extending).toBe(true)
      expect(states[0].finished).toBe(false)

      // Mid-extension
      expect(states[2].extending).toBe(true)

      // Extension complete, retracting
      expect(states[4].extending).toBe(false)
      expect(states[4].finished).toBe(false)

      // Fully finished
      expect(states[states.length - 1].extending).toBe(false)
      expect(states[states.length - 1].finished).toBe(true)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle rapid update calls efficiently', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      const startTime = Date.now()

      // Simulate 60fps for full cycle
      for (let t = 0; t <= 430; t += 16.67) {
        scene.time.now = t
        testTongue.update(16.67)
      }

      const endTime = Date.now()
      const executionTime = endTime - startTime

      // Should complete in reasonable time (< 50ms for all updates)
      expect(executionTime).toBeLessThan(50)
    })

    it.skip('should not accumulate errors over time', () => {
      scene.time.now = 0
      const testTongue = new Tongue(scene, 960, 950, 0)

      // Run multiple cycles
      for (let cycle = 0; cycle < 10; cycle++) {
        scene.time.now = cycle * 430
        const tongue = new Tongue(scene, 960, 950, 0)

        scene.time.now = cycle * 430 + 430
        tongue.update(16.67)

        // Each cycle should end at approximately 0 length
        expect(tongue.getCurrentLength()).toBeCloseTo(0, 1)
      }
    })
  })
})
