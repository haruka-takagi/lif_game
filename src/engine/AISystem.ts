import { Villager, JOB_BUILDING } from '../entities/Villager'
import { Building } from '../entities/Building'
import { Tile } from '../entities/Tile'
import { findPath, getWalkableTile } from '../utils/pathfinding'
import { clamp } from '../utils/random'

const TILE_SIZE = 32
const MOVE_SPEED = 1.5 // tiles per game minute

function getTileCoords(pixelX: number, pixelY: number): { x: number; y: number } {
  return {
    x: Math.floor(pixelX / TILE_SIZE),
    y: Math.floor(pixelY / TILE_SIZE),
  }
}

function getPixelCenter(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
  }
}

function getBuildingEntrance(building: Building): { x: number; y: number } {
  return {
    x: building.position.x + Math.floor(building.size.w / 2),
    y: building.position.y + building.size.h,
  }
}

export function updateVillager(
  villager: Villager,
  buildings: Building[],
  tiles: Tile[][],
  hour: number,
  gameMinutes: number
): Partial<Villager> {
  const updates: Partial<Villager> = {}

  // Update needs over time
  let { hunger, energy, happiness } = villager.needs

  // Determine state
  const isNightTime = hour >= 22 || hour < 6

  // State machine logic
  let newState = villager.state
  let newPath = villager.path
  let newTargetId = villager.targetId

  if (isNightTime && villager.state !== 'sleeping') {
    newState = 'sleeping'
    newTargetId = villager.homeId
    newPath = []
  } else if (!isNightTime && villager.state === 'sleeping' && hour >= 6) {
    newState = 'idle'
    newPath = []
    newTargetId = null
  } else if (!isNightTime && hunger < 30 && villager.state !== 'eating') {
    // Find dining hall
    const diningHall = buildings.find(b => b.type === 'dining_hall' && b.status === 'active')
    if (diningHall) {
      newState = 'eating'
      newTargetId = diningHall.id
      newPath = []
    }
  } else if (!isNightTime && energy < 20 && villager.state !== 'sleeping') {
    newState = 'sleeping'
    newTargetId = villager.homeId
    newPath = []
  }

  // Process current state
  switch (newState) {
    case 'sleeping': {
      energy = clamp(energy + 2 * gameMinutes, 0, 100)
      hunger = clamp(hunger - 0.02 * gameMinutes, 0, 100)
      // Move to home
      if (newPath.length === 0 && newTargetId) {
        const home = buildings.find(b => b.id === newTargetId)
        if (home) {
          const entrance = getBuildingEntrance(home)
          const walkable = getWalkableTile(entrance.x, entrance.y, tiles)
          if (walkable) {
            const startTile = getTileCoords(villager.position.x, villager.position.y)
            newPath = findPath(startTile, walkable, tiles).map(
              p => getPixelCenter(p.x, p.y)
            )
          }
        }
      }
      break
    }

    case 'eating': {
      hunger = clamp(hunger + 5 * gameMinutes, 0, 100)
      energy = clamp(energy - 0.05 * gameMinutes, 0, 100)
      // Move to dining hall
      if (newPath.length === 0 && newTargetId) {
        const diningHall = buildings.find(b => b.id === newTargetId)
        if (diningHall) {
          const entrance = getBuildingEntrance(diningHall)
          const walkable = getWalkableTile(entrance.x, entrance.y, tiles)
          if (walkable) {
            const startTile = getTileCoords(villager.position.x, villager.position.y)
            newPath = findPath(startTile, walkable, tiles).map(
              p => getPixelCenter(p.x, p.y)
            )
          }
        }
      }
      // Once full, go back to work
      if (hunger >= 80) {
        newState = 'idle'
        newTargetId = null
        newPath = []
      }
      break
    }

    case 'working': {
      energy = clamp(energy - 0.1 * gameMinutes, 0, 100)
      hunger = clamp(hunger - 0.05 * gameMinutes, 0, 100)
      break
    }

    case 'idle': {
      // Find work building based on job
      const jobBuildingType = JOB_BUILDING[villager.job]
      const workBuilding = buildings.find(
        b => b.type === jobBuildingType && b.status === 'active'
      )
      if (workBuilding) {
        newState = 'moving'
        newTargetId = workBuilding.id
        const entrance = getBuildingEntrance(workBuilding)
        const walkable = getWalkableTile(entrance.x, entrance.y, tiles)
        if (walkable) {
          const startTile = getTileCoords(villager.position.x, villager.position.y)
          newPath = findPath(startTile, walkable, tiles).map(
            p => getPixelCenter(p.x, p.y)
          )
        }
      }
      hunger = clamp(hunger - 0.02 * gameMinutes, 0, 100)
      break
    }

    case 'moving': {
      hunger = clamp(hunger - 0.02 * gameMinutes, 0, 100)
      break
    }
  }

  // Move along path
  let { x, y } = villager.position
  if (newPath.length > 0) {
    const target = newPath[0]
    const dx = target.x - x
    const dy = target.y - y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const moveDistance = MOVE_SPEED * TILE_SIZE * gameMinutes

    if (dist <= moveDistance || dist < 2) {
      x = target.x
      y = target.y
      newPath = newPath.slice(1)

      // Arrived at destination
      if (newPath.length === 0) {
        if (newState === 'moving') {
          newState = 'working'
        }
      }
    } else {
      x += (dx / dist) * moveDistance
      y += (dy / dist) * moveDistance
    }
  }

  // Update happiness
  happiness = clamp((hunger * 0.5 + energy * 0.5) * 0.8 + happiness * 0.2, 0, 100)

  updates.position = { x, y }
  updates.state = newState
  updates.path = newPath
  updates.targetId = newTargetId
  updates.needs = { hunger, energy, happiness }

  return updates
}
