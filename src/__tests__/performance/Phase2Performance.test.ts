import { describe, it, expect, beforeEach, vi } from 'vitest'
import Phaser from 'phaser'
import { Chameleon } from '../../game/objects/Chameleon'
import { Tongue } from '../../game/objects/Tongue'

describe('Phase 2 Performance Benchmarks', () => {
  let scene: Phaser.Scene

  beforeEach(() => {
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
        sprite: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setScale: vi.fn().mockReturnThis(),
          setTexture: vi.fn().mockReturnThis(),
          setVisible: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
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
          fillRect: vi.fn().mockReturnThis(),
          beginPath: vi.fn().mockReturnThis(),
          moveTo: vi.fn().mockReturnThis(),
          lineTo: vi.fn().mockReturnThis(),
          strokePath: vi.fn().mockReturnThis(),
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
  })

  describe('Frame Rate Performance', () => {
    it('should update chameleon within 16ms budget (60fps)', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      const iterations = 100

      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        chameleon.update(16.67)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTimePerUpdate = totalTime / iterations

      // Should average well under 16ms per update
      expect(avgTimePerUpdate).toBeLessThan(1)

      console.log(`Chameleon update average: ${avgTimePerUpdate.toFixed(3)}ms`)
    })

    it('should update tongue within 16ms budget (60fps)', () => {
      scene.time.now = 0
      const tongue = new Tongue(scene, 960, 950, 0)
      const iterations = 100

      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        scene.time.now = i * 16.67
        tongue.update(16.67)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTimePerUpdate = totalTime / iterations

      // Should average well under 16ms per update
      expect(avgTimePerUpdate).toBeLessThan(1)

      console.log(`Tongue update average: ${avgTimePerUpdate.toFixed(3)}ms`)
    })

    it('should handle simultaneous chameleon and tongue updates efficiently', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      scene.time.now = 0
      chameleon.shootTongue(scene)

      const iterations = 100
      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        scene.time.now = i * 16.67
        chameleon.update(16.67)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTimePerUpdate = totalTime / iterations

      // Combined update should still be fast
      expect(avgTimePerUpdate).toBeLessThan(2)

      console.log(`Combined update average: ${avgTimePerUpdate.toFixed(3)}ms`)
    })

    it('should maintain performance with rapid rotation changes', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      const iterations = 1000

      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        // Rapid left-right aiming
        if (i % 2 === 0) {
          chameleon.aimLeft()
        } else {
          chameleon.aimRight()
        }
        chameleon.update(16.67)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTimePerUpdate = totalTime / iterations

      expect(avgTimePerUpdate).toBeLessThan(1)

      console.log(`Rotation stress test average: ${avgTimePerUpdate.toFixed(3)}ms`)
    })
  })

  describe('Memory Management', () => {
    it('should not leak memory with repeated tongue shots', () => {
      const chameleon = new Chameleon(scene, 960, 950)

      const initialCallCount = (scene.add.graphics as any).mock.calls.length

      // Shoot and complete tongue 10 times
      for (let i = 0; i < 10; i++) {
        scene.time.now = i * 1500 // Beyond cooldown
        chameleon.shootTongue(scene)

        const tongue = chameleon.getTongue()
        if (tongue) {
          tongue['finished'] = true
          chameleon.update(16.67)
        }
      }

      // Graphics objects should be created but also destroyed
      // The destroy method should have been called for completed tongues
      const destroyCallCount = (scene.add.graphics as any).mock.results.filter(
        (result: any) => result.value.destroy.mock.calls.length > 0
      ).length

      expect(destroyCallCount).toBeGreaterThan(0)
    })

    it('should clean up visual effects after tongue completion', () => {
      scene.time.now = 0
      const tongue = new Tongue(scene, 960, 950, 0)

      // Get initial graphics created (flash + particles)
      const initialGraphicsCount = (scene.add.graphics as any).mock.calls.length

      // Complete the tongue cycle
      scene.time.now = 430
      tongue.update(16.67)

      expect(tongue.isFinished()).toBe(true)

      // Tweens should have onComplete callbacks that destroy graphics
      const tweenCalls = (scene.tweens.add as any).mock.calls
      const tweensWithCleanup = tweenCalls.filter((call: any) =>
        call[0].onComplete
      )

      expect(tweensWithCleanup.length).toBeGreaterThan(0)
    })

    it('should properly destroy cooldown indicator', () => {
      const chameleon = new Chameleon(scene, 960, 950)

      scene.time.now = 0
      chameleon.shootTongue(scene)

      const indicator = chameleon['cooldownIndicator']
      expect(indicator).toBeTruthy()

      const destroySpy = vi.spyOn(indicator!, 'destroy')

      // End cooldown
      chameleon['setCoolingDown'](false)

      expect(destroySpy).toHaveBeenCalled()
      expect(chameleon['cooldownIndicator']).toBeNull()
    })

    it('should handle multiple expression changes without leaking tweens', () => {
      const chameleon = new Chameleon(scene, 960, 950)

      const initialTweenCount = (scene.tweens.add as any).mock.calls.length

      // Rapidly change expressions
      const expressions: Array<'neutral' | 'happy' | 'sad' | 'thinking'> = [
        'happy',
        'sad',
        'thinking',
        'neutral',
        'happy',
        'sad',
      ]

      expressions.forEach((expr) => {
        chameleon.setExpression(expr)
      })

      const finalTweenCount = (scene.tweens.add as any).mock.calls.length

      // Should create tweens for each unique expression change
      const tweensCreated = finalTweenCount - initialTweenCount

      // Should be reasonable number (not exponential growth)
      expect(tweensCreated).toBeLessThan(20)
    })
  })

  describe('Input Lag Measurement', () => {
    it('should respond to aim input within target latency', () => {
      const chameleon = new Chameleon(scene, 960, 950)

      // Measure time to process aim command
      const startTime = performance.now()

      chameleon.aimAtPoint(1200, 800)

      const endTime = performance.now()
      const inputLag = endTime - startTime

      // Target: < 1ms for aim input processing
      expect(inputLag).toBeLessThan(1)

      console.log(`Aim input processing time: ${inputLag.toFixed(3)}ms`)
    })

    it('should respond to shoot input within target latency', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      scene.time.now = 0

      // Measure time to process shoot command
      const startTime = performance.now()

      chameleon.shootTongue(scene)

      const endTime = performance.now()
      const inputLag = endTime - startTime

      // Target: < 1ms for shoot input processing
      expect(inputLag).toBeLessThan(1)

      console.log(`Shoot input processing time: ${inputLag.toFixed(3)}ms`)
    })

    it('should buffer input within target latency', () => {
      const chameleon = new Chameleon(scene, 960, 950)

      const startTime = performance.now()

      chameleon.bufferInput()

      const endTime = performance.now()
      const inputLag = endTime - startTime

      // Target: < 1ms for buffer input processing
      expect(inputLag).toBeLessThan(1)

      console.log(`Buffer input processing time: ${inputLag.toFixed(3)}ms`)
    })
  })

  describe('Timing Accuracy Under Load', () => {
    it('should maintain 180ms extension timing under stress', () => {
      const timings: number[] = []

      // Run 100 tongue extensions
      for (let i = 0; i < 100; i++) {
        scene.time.now = 0
        const tongue = new Tongue(scene, 960, 950, 0)

        let extensionEndTime = 0

        for (let t = 0; t <= 200; t += 5) {
          scene.time.now = t
          tongue.update(16.67)

          if (!tongue.isExtending() && extensionEndTime === 0) {
            extensionEndTime = t
            break
          }
        }

        if (extensionEndTime > 0) {
          timings.push(extensionEndTime)
        }
      }

      // Calculate average and standard deviation
      const avg = timings.reduce((a, b) => a + b, 0) / timings.length
      const variance =
        timings.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / timings.length
      const stdDev = Math.sqrt(variance)

      // Should be consistent (low variance)
      expect(avg).toBeCloseTo(180, 0)
      expect(stdDev).toBeLessThan(10)

      console.log(`Extension timing - avg: ${avg.toFixed(1)}ms, stdDev: ${stdDev.toFixed(1)}ms`)
    })

    it('should maintain 1000ms cooldown timing accurately', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      const timings: number[] = []

      // Test cooldown boundary 100 times
      for (let i = 0; i < 100; i++) {
        scene.time.now = 0
        chameleon['lastTongueShot'] = 0

        // Find exact time when cooldown ends
        for (let t = 990; t <= 1010; t++) {
          scene.time.now = t
          if (!chameleon.isCoolingDown()) {
            timings.push(t)
            break
          }
        }
      }

      // All should be exactly at 1000ms
      timings.forEach((time) => {
        expect(time).toBe(1000)
      })

      console.log(`Cooldown timing precision: ${timings.length}/100 tests at exactly 1000ms`)
    })
  })

  describe('Easing Curve Performance', () => {
    it('should calculate Power2.easeOut efficiently', () => {
      const iterations = 10000
      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        const progress = i / iterations
        // Power2.easeOut calculation
        const _eased = 1 - Math.pow(1 - progress, 2)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations

      expect(avgTime).toBeLessThan(0.001)

      console.log(`Power2.easeOut calculation: ${avgTime.toFixed(6)}ms avg`)
    })

    it('should calculate Sine.easeIn efficiently', () => {
      const iterations = 10000
      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        const progress = i / iterations
        // Sine.easeIn calculation
        const _eased = Math.sin((progress * Math.PI) / 2)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations

      expect(avgTime).toBeLessThan(0.001)

      console.log(`Sine.easeIn calculation: ${avgTime.toFixed(6)}ms avg`)
    })

    it('should calculate rotation easing efficiently', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      const iterations = 10000

      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        const angle = (i % 180) - 90
        chameleon['calculateRotationEasing'](angle)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations

      expect(avgTime).toBeLessThan(0.001)

      console.log(`Rotation easing calculation: ${avgTime.toFixed(6)}ms avg`)
    })
  })

  describe('Rendering Performance', () => {
    it('should render tongue efficiently across full animation', () => {
      scene.time.now = 0
      const tongue = new Tongue(scene, 960, 950, 0)

      const renderCalls: number[] = []

      for (let t = 0; t <= 430; t += 16.67) {
        scene.time.now = t

        const startTime = performance.now()
        tongue.update(16.67)
        const endTime = performance.now()

        renderCalls.push(endTime - startTime)
      }

      const avgRenderTime =
        renderCalls.reduce((a, b) => a + b, 0) / renderCalls.length
      const maxRenderTime = Math.max(...renderCalls)

      // Average should be well under budget
      expect(avgRenderTime).toBeLessThan(1)

      // Even worst case should be reasonable
      expect(maxRenderTime).toBeLessThan(5)

      console.log(`Tongue render - avg: ${avgRenderTime.toFixed(3)}ms, max: ${maxRenderTime.toFixed(3)}ms`)
    })

    it('should handle multiple visual effects simultaneously', () => {
      scene.time.now = 0
      const chameleon = new Chameleon(scene, 960, 950)

      // Trigger multiple effects at once
      const startTime = performance.now()

      // Shoot tongue (creates particles, flash, shake)
      chameleon.shootTongue(scene)

      // Change expression (creates tweens)
      chameleon.setExpression('happy')

      // Update rotation (visual feedback)
      chameleon.aimAtPoint(1200, 800)

      // Update all
      chameleon.update(16.67)

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Should handle all effects efficiently
      expect(totalTime).toBeLessThan(5)

      console.log(`Multi-effect processing time: ${totalTime.toFixed(3)}ms`)
    })
  })

  describe('Stress Testing', () => {
    it('should handle 1000 updates without performance degradation', () => {
      const chameleon = new Chameleon(scene, 960, 950)

      const firstHundred: number[] = []
      const lastHundred: number[] = []

      for (let i = 0; i < 1000; i++) {
        // Vary the input
        if (i % 3 === 0) chameleon.aimLeft()
        if (i % 5 === 0) chameleon.aimRight()

        const startTime = performance.now()
        chameleon.update(16.67)
        const endTime = performance.now()

        const updateTime = endTime - startTime

        if (i < 100) {
          firstHundred.push(updateTime)
        } else if (i >= 900) {
          lastHundred.push(updateTime)
        }
      }

      const avgFirst =
        firstHundred.reduce((a, b) => a + b, 0) / firstHundred.length
      const avgLast =
        lastHundred.reduce((a, b) => a + b, 0) / lastHundred.length

      // Performance should not degrade significantly
      expect(avgLast).toBeLessThan(avgFirst * 1.5)

      console.log(`Performance over 1000 updates - first 100: ${avgFirst.toFixed(3)}ms, last 100: ${avgLast.toFixed(3)}ms`)
    })

    it('should handle rapid tongue shooting cycles', () => {
      const chameleon = new Chameleon(scene, 960, 950)
      let successfulShots = 0

      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        scene.time.now = i * 1500 // Beyond cooldown each time

        if (chameleon.shootTongue(scene)) {
          successfulShots++
        }

        // Simulate tongue completion
        const tongue = chameleon.getTongue()
        if (tongue) {
          tongue['finished'] = true
          chameleon.update(16.67)
        }
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Should complete all cycles quickly
      expect(totalTime).toBeLessThan(100)
      expect(successfulShots).toBe(100)

      console.log(`100 tongue cycles completed in ${totalTime}ms`)
    })
  })
})
