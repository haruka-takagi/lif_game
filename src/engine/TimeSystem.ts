import { useTimeStore } from '../store/timeStore'

// 1 real second = 10 game minutes at speed x1
const GAME_MINUTES_PER_REAL_SECOND = 10

export class TimeSystem {
  private lastTick: number = 0

  update(timestamp: number): number {
    if (this.lastTick === 0) {
      this.lastTick = timestamp
      return 0
    }

    const { paused, speed, advanceTime } = useTimeStore.getState()
    if (paused) {
      this.lastTick = timestamp
      return 0
    }

    const deltaMs = timestamp - this.lastTick
    this.lastTick = timestamp

    const deltaSeconds = deltaMs / 1000
    const gameMinutes = deltaSeconds * GAME_MINUTES_PER_REAL_SECOND * speed

    advanceTime(gameMinutes)
    return gameMinutes
  }

  reset(): void {
    this.lastTick = 0
  }
}

export function getNightOverlayOpacity(hour: number): number {
  // Night: 22:00 - 6:00
  // Darkest at midnight (hour 0/24)
  if (hour >= 6 && hour <= 20) return 0
  if (hour > 20 && hour <= 22) {
    return (hour - 20) / 2 * 0.4
  }
  if (hour > 22 || hour < 4) {
    const h = hour > 22 ? hour - 22 : hour + 2
    return 0.4 + Math.min(h / 4, 1) * 0.2
  }
  if (hour >= 4 && hour < 6) {
    return (6 - hour) / 2 * 0.4
  }
  return 0
}

export function getSeasonTint(season: string): { r: number; g: number; b: number; a: number } {
  switch (season) {
    case 'spring': return { r: 200, g: 255, b: 200, a: 0.05 }
    case 'summer': return { r: 255, g: 255, b: 200, a: 0.08 }
    case 'autumn': return { r: 255, g: 180, b: 100, a: 0.1 }
    case 'winter': return { r: 200, g: 220, b: 255, a: 0.15 }
    default: return { r: 0, g: 0, b: 0, a: 0 }
  }
}
