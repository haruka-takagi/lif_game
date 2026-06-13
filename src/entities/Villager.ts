export type VillagerState = 'idle' | 'moving' | 'working' | 'eating' | 'sleeping'
export type VillagerJob = 'farmer' | 'woodcutter' | 'miner' | 'builder' | 'merchant'

export interface Villager {
  id: string
  name: string
  position: { x: number; y: number }
  state: VillagerState
  needs: {
    hunger: number    // 0-100
    energy: number    // 0-100
    happiness: number // 0-100
  }
  job: VillagerJob
  homeId: string
  targetId: string | null
  path: { x: number; y: number }[]
  color: string
}

export const JOB_EMOJI: Record<VillagerJob, string> = {
  farmer: '👨‍🌾',
  woodcutter: '🪓',
  miner: '⛏️',
  builder: '🔨',
  merchant: '🧑‍💼',
}

export const JOB_COLORS: Record<VillagerJob, string> = {
  farmer: '#4CAF50',
  woodcutter: '#8D6E63',
  miner: '#9E9E9E',
  builder: '#FF9800',
  merchant: '#9C27B0',
}

export const JOB_BUILDING: Record<VillagerJob, string> = {
  farmer: 'farm',
  woodcutter: 'woodcutter',
  miner: 'quarry',
  builder: 'house',
  merchant: 'market',
}

export const VILLAGER_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
  'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
  'Kate', 'Liam', 'Mia', 'Noah', 'Olivia',
]
