export type BuildingType = 'house' | 'farm' | 'dining_hall' | 'woodcutter' | 'quarry' | 'market'
export type BuildingStatus = 'constructing' | 'active' | 'inactive'

export interface Building {
  id: string
  type: BuildingType
  position: { x: number; y: number }
  size: { w: number; h: number }
  status: BuildingStatus
  workers: string[]
  production: {
    resource: string
    rate: number
  } | null
}

export const BUILDING_COSTS: Record<BuildingType, Partial<Record<string, number>>> = {
  house: { wood: 10, stone: 5 },
  farm: { wood: 8, stone: 2 },
  dining_hall: { wood: 15, stone: 10 },
  woodcutter: { wood: 5, stone: 5 },
  quarry: { stone: 10 },
  market: { wood: 20, stone: 15, gold: 5 },
}

export const BUILDING_PRODUCTION: Record<BuildingType, { resource: string; rate: number } | null> = {
  house: null,
  farm: { resource: 'food', rate: 0.5 },
  dining_hall: null,
  woodcutter: { resource: 'wood', rate: 0.3 },
  quarry: { resource: 'stone', rate: 0.2 },
  market: { resource: 'gold', rate: 0.1 },
}

export const BUILDING_EMOJI: Record<BuildingType, string> = {
  house: '🏠',
  farm: '🌾',
  dining_hall: '🍽️',
  woodcutter: '🪓',
  quarry: '⛏️',
  market: '🏪',
}

export const BUILDING_COLORS: Record<BuildingType, string> = {
  house: '#8B5E3C',
  farm: '#A8C23F',
  dining_hall: '#E87A20',
  woodcutter: '#3A7D44',
  quarry: '#888888',
  market: '#D4AF37',
}

export const BUILDING_SIZES: Record<BuildingType, { w: number; h: number }> = {
  house: { w: 2, h: 2 },
  farm: { w: 3, h: 2 },
  dining_hall: { w: 3, h: 3 },
  woodcutter: { w: 2, h: 2 },
  quarry: { w: 2, h: 2 },
  market: { w: 3, h: 2 },
}
