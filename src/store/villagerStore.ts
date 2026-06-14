import { create } from 'zustand'
import { Villager, VillagerJob, JOB_COLORS, VILLAGER_NAMES } from '../entities/Villager'
import { randomId, randomChoice, randomInt } from '../utils/random'

interface VillagerStore {
  villagers: Villager[]
  selectedVillagerId: string | null
  selectVillager: (id: string | null) => void
  updateVillager: (id: string, updates: Partial<Villager>) => void
  updateVillagers: (updater: (villagers: Villager[]) => Villager[]) => void
  addVillager: (villager: Villager) => void
  spawnVillagers: (count: number, homeId: string, spawnArea: { x: number; y: number }) => void
}

const JOBS: VillagerJob[] = ['farmer', 'woodcutter', 'miner', 'builder', 'merchant']

export function createVillager(
  name: string,
  job: VillagerJob,
  position: { x: number; y: number },
  homeId: string
): Villager {
  return {
    id: randomId(),
    name,
    position: { ...position },
    state: 'idle',
    needs: {
      hunger: randomInt(60, 100),
      energy: randomInt(60, 100),
      happiness: randomInt(50, 100),
    },
    job,
    homeId,
    targetId: null,
    path: [],
    color: JOB_COLORS[job],
  }
}

export const useVillagerStore = create<VillagerStore>((set) => ({
  villagers: [],
  selectedVillagerId: null,

  selectVillager: (id) => set({ selectedVillagerId: id }),

  updateVillager: (id, updates) => set((state) => ({
    villagers: state.villagers.map(v => v.id === id ? { ...v, ...updates } : v),
  })),

  updateVillagers: (updater) => set((state) => ({
    villagers: updater(state.villagers),
  })),

  addVillager: (villager) => set((state) => ({
    villagers: [...state.villagers, villager],
  })),

  spawnVillagers: (count, homeId, spawnArea) => set((state) => {
    const usedNames = new Set(state.villagers.map(v => v.name))
    const availableNames = VILLAGER_NAMES.filter(n => !usedNames.has(n))

    const newVillagers: Villager[] = []
    for (let i = 0; i < count; i++) {
      const name = availableNames[i] || `Villager ${state.villagers.length + i + 1}`
      const job = randomChoice(JOBS)
      const position = {
        x: spawnArea.x + randomInt(-2, 2),
        y: spawnArea.y + randomInt(-2, 2),
      }
      newVillagers.push(createVillager(name, job, position, homeId))
    }

    return { villagers: [...state.villagers, ...newVillagers] }
  }),
}))
