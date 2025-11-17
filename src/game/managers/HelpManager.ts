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
