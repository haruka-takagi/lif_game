import { TimeSystem } from './TimeSystem'
import { useTimeStore } from '../store/timeStore'
import { useGameStore } from '../store/gameStore'
import { useVillagerStore } from '../store/villagerStore'
import { updateVillager } from './AISystem'

class GameLoopClass {
  private animFrameId: number | null = null
  private timeSystem = new TimeSystem()
  private lastAIUpdate = 0
  private AI_UPDATE_INTERVAL = 500 // ms - throttle AI to every 500ms
  private isRunning = false
  private lastProductionTick = 0
  private PRODUCTION_INTERVAL = 1000 // ms - production every 1 second

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.timeSystem.reset()
    this.lastAIUpdate = 0
    this.lastProductionTick = 0
    this.animFrameId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
    this.isRunning = false
  }

  private tick = (timestamp: number): void => {
    if (!this.isRunning) return

    const gameMinutes = this.timeSystem.update(timestamp)

    // AI updates throttled to every 500ms real time
    if (timestamp - this.lastAIUpdate >= this.AI_UPDATE_INTERVAL) {
      this.runAI(gameMinutes > 0 ? gameMinutes : 0.5)
      this.lastAIUpdate = timestamp
    }

    // Resource production
    if (timestamp - this.lastProductionTick >= this.PRODUCTION_INTERVAL) {
      this.runProduction(gameMinutes > 0 ? gameMinutes : 1)
      this.lastProductionTick = timestamp
    }

    this.animFrameId = requestAnimationFrame(this.tick)
  }

  private runAI(gameMinutes: number): void {
    const { updateVillagers } = useVillagerStore.getState()
    const { buildings, tiles } = useGameStore.getState()
    const { hour } = useTimeStore.getState()

    if (!tiles || tiles.length === 0) return

    updateVillagers((currentVillagers) =>
      currentVillagers.map(v => {
        const updates = updateVillager(v, buildings, tiles, hour, gameMinutes)
        return { ...v, ...updates }
      })
    )

    // Update overall happiness
    const updatedVillagers = useVillagerStore.getState().villagers
    if (updatedVillagers.length > 0) {
      const avgHappiness =
        updatedVillagers.reduce((sum, v) => sum + v.needs.happiness, 0) /
        updatedVillagers.length
      useGameStore.getState().setHappiness(Math.round(avgHappiness))
    }
  }

  private runProduction(gameMinutes: number): void {
    const { buildings, addResources } = useGameStore.getState()
    const { villagers } = useVillagerStore.getState()

    for (const building of buildings) {
      if (building.status !== 'active' || !building.production) continue

      // Count workers in this building
      const workersHere = villagers.filter(
        v => v.targetId === building.id && v.state === 'working'
      ).length

      if (workersHere > 0) {
        const amount = building.production.rate * gameMinutes * workersHere
        addResources(building.production.resource, amount)
      }
    }
  }
}

// Singleton
export const GameLoop = new GameLoopClass()
