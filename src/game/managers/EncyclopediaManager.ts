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
