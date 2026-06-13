import { create } from 'zustand'
import { Building, BuildingType, BUILDING_PRODUCTION, BUILDING_SIZES, BUILDING_COSTS } from '../entities/Building'
import { Tile, MAP_WIDTH, MAP_HEIGHT } from '../entities/Tile'
import { randomId } from '../utils/random'
import { generateMap } from '../engine/MapGenerator'

export interface Camera {
  x: number
  y: number
  zoom: number
}

interface GameStore {
  resources: Record<string, number>
  buildings: Building[]
  tiles: Tile[][]
  camera: Camera
  population: number
  happiness: number
  selectedBuildingType: BuildingType | null
  buildMode: boolean
  initialized: boolean

  // Actions
  initialize: () => void
  setCamera: (camera: Partial<Camera>) => void
  selectBuildingType: (type: BuildingType | null) => void
  setBuildMode: (enabled: boolean) => void
  placeBuilding: (x: number, y: number) => boolean
  addResources: (resource: string, amount: number) => void
  spendResources: (costs: Partial<Record<string, number>>) => boolean
  updateBuilding: (id: string, updates: Partial<Building>) => void
  setHappiness: (value: number) => void
  canAfford: (type: BuildingType) => boolean
}

export const useGameStore = create<GameStore>((set, get) => ({
  resources: { food: 100, wood: 50, stone: 30, gold: 10 },
  buildings: [],
  tiles: [],
  camera: { x: 0, y: 0, zoom: 1 },
  population: 0,
  happiness: 75,
  selectedBuildingType: null,
  buildMode: false,
  initialized: false,

  initialize: () => {
    const { initialized } = get()
    if (initialized) return

    const tiles = generateMap(MAP_WIDTH, MAP_HEIGHT)

    // Place initial buildings
    const buildings: Building[] = []

    const placeInitialBuilding = (type: BuildingType, x: number, y: number): Building => {
      const size = BUILDING_SIZES[type]
      const building: Building = {
        id: randomId(),
        type,
        position: { x, y },
        size,
        status: 'active',
        workers: [],
        production: BUILDING_PRODUCTION[type],
      }

      // Mark tiles as occupied
      for (let dy = 0; dy < size.h; dy++) {
        for (let dx = 0; dx < size.w; dx++) {
          const tx = x + dx
          const ty = y + dy
          if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
            tiles[ty][tx].building = building.id
          }
        }
      }

      buildings.push(building)
      return building
    }

    // Place 3 houses, 1 farm, 1 woodcutter
    placeInitialBuilding('house', 12, 12)
    placeInitialBuilding('house', 16, 12)
    placeInitialBuilding('house', 14, 15)
    placeInitialBuilding('farm', 8, 12)
    placeInitialBuilding('woodcutter', 20, 12)
    placeInitialBuilding('dining_hall', 13, 9)

    set({
      tiles,
      buildings,
      initialized: true,
    })
  },

  setCamera: (camera) => set((state) => ({
    camera: { ...state.camera, ...camera },
  })),

  selectBuildingType: (type) => set({ selectedBuildingType: type }),
  setBuildMode: (enabled) => set({ buildMode: enabled }),

  placeBuilding: (x, y) => {
    const state = get()
    if (!state.selectedBuildingType) return false

    const type = state.selectedBuildingType
    const size = BUILDING_SIZES[type]

    // Check if can afford
    if (!state.canAfford(type)) return false

    // Check if tiles are free
    for (let dy = 0; dy < size.h; dy++) {
      for (let dx = 0; dx < size.w; dx++) {
        const tx = x + dx
        const ty = y + dy
        if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) return false
        const tile = state.tiles[ty]?.[tx]
        if (!tile) return false
        if (tile.type === 'water' || tile.type === 'mountain') return false
        if (tile.building) return false
      }
    }

    const building: Building = {
      id: randomId(),
      type,
      position: { x, y },
      size,
      status: 'active',
      workers: [],
      production: BUILDING_PRODUCTION[type],
    }

    const newTiles = state.tiles.map(row => row.map(t => ({ ...t })))
    for (let dy = 0; dy < size.h; dy++) {
      for (let dx = 0; dx < size.w; dx++) {
        newTiles[y + dy][x + dx].building = building.id
      }
    }

    // Spend resources
    const costs = BUILDING_COSTS[type]
    const newResources = { ...state.resources }
    for (const [resource, cost] of Object.entries(costs)) {
      newResources[resource] = (newResources[resource] || 0) - (cost || 0)
    }

    set((s) => ({
      buildings: [...s.buildings, building],
      tiles: newTiles,
      resources: newResources,
    }))

    return true
  },

  addResources: (resource, amount) => set((state) => ({
    resources: {
      ...state.resources,
      [resource]: (state.resources[resource] || 0) + amount,
    },
  })),

  spendResources: (costs) => {
    const state = get()
    for (const [resource, cost] of Object.entries(costs)) {
      if ((state.resources[resource] || 0) < (cost || 0)) return false
    }

    const newResources = { ...state.resources }
    for (const [resource, cost] of Object.entries(costs)) {
      newResources[resource] -= cost || 0
    }

    set({ resources: newResources })
    return true
  },

  updateBuilding: (id, updates) => set((state) => ({
    buildings: state.buildings.map(b => b.id === id ? { ...b, ...updates } : b),
  })),

  setHappiness: (value) => set({ happiness: value }),

  canAfford: (type) => {
    const state = get()
    const costs = BUILDING_COSTS[type]
    for (const [resource, cost] of Object.entries(costs)) {
      if ((state.resources[resource] || 0) < (cost || 0)) return false
    }
    return true
  },
}))
