const STORAGE_KEY = 'chameleon-quest-encyclopedia'

export class EncyclopediaManager {
  private unlockedInsects: Set<string> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  unlockInsect(insectId: string) {
    this.unlockedInsects.add(insectId)
    this.saveToStorage()
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
    this.saveToStorage()
  }

  // Persistence methods
  private saveToStorage() {
    try {
      const data = {
        unlockedInsects: Array.from(this.unlockedInsects),
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save encyclopedia data:', error)
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        this.unlockedInsects = new Set(data.unlockedInsects || [])
      }
    } catch (error) {
      console.error('Failed to load encyclopedia data:', error)
      this.unlockedInsects = new Set()
    }
  }

  // Debug helper to unlock all insects for testing
  unlockAll() {
    // This will be populated with all insect IDs from the insects data
    const allInsectIds = [
      'hercules-beetle', 'glass-wing-butterfly', 'titan-beetle', 'blue-morpho-butterfly', 'rainbow-scarab',
      'leafcutter-ant', 'bullet-ant', 'army-ant', 'orchid-bee', 'tarantula-hawk-wasp',
      'walking-stick', 'leaf-katydid', 'moss-mimic-katydid', 'bark-mantis', 'thorn-bug',
      'railroad-worm', 'lantern-fly', 'click-beetle', 'firefly-beetle', 'luna-moth',
      'peanut-head-bug', 'assassin-bug', 'goliath-birdeater', 'glasswing-butterfly-migrant', 'jewel-beetle'
    ]
    allInsectIds.forEach(id => this.unlockInsect(id))
  }
}
