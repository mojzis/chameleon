import { vi } from 'vitest'

// Mock phaser3spectorjs before Phaser is loaded
vi.mock('phaser3spectorjs', () => ({}))

// Mock HTMLCanvasElement and CanvasRenderingContext2D
class MockCanvasRenderingContext2D {
  fillStyle: any = ''
  strokeStyle: any = ''
  lineWidth: number = 1
  globalAlpha: number = 1

  fillRect() {}
  strokeRect() {}
  clearRect() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  fill() {}
  stroke() {}
  save() {}
  restore() {}
  scale() {}
  rotate() {}
  translate() {}
  transform() {}
  setTransform() {}
  drawImage() {}
  createImageData() {
    return { data: new Uint8ClampedArray(4) }
  }
  getImageData() {
    return { data: new Uint8ClampedArray(4) }
  }
  putImageData() {}
  measureText() {
    return { width: 0 }
  }
  fillText() {}
  strokeText() {}
}

class MockHTMLCanvasElement {
  width: number = 800
  height: number = 600

  getContext() {
    return new MockCanvasRenderingContext2D()
  }

  toDataURL() {
    return 'data:image/png;base64,'
  }

  toBlob() {}
}

// Mock document.createElement for canvas
const originalCreateElement = document.createElement.bind(document)
document.createElement = ((tagName: string, ...args: any[]) => {
  if (tagName.toLowerCase() === 'canvas') {
    return new MockHTMLCanvasElement() as any
  }
  return originalCreateElement(tagName, ...args)
}) as any

// Mock window properties
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1,
})

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Mock performance if needed
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as any
}

// Mock AudioContext
global.AudioContext = vi.fn(() => ({
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440 },
  })),
  destination: {},
})) as any

// Suppress Phaser warnings in tests
const originalConsoleWarn = console.warn
console.warn = (...args: any[]) => {
  // Filter out Phaser-specific warnings
  const message = args[0]?.toString() || ''
  if (
    message.includes('Phaser') ||
    message.includes('WebGL') ||
    message.includes('canvas')
  ) {
    return
  }
  originalConsoleWarn(...args)
}
