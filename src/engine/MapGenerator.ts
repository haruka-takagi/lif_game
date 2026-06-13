import { Tile, TileType, MAP_WIDTH, MAP_HEIGHT } from '../entities/Tile'
import { randomInt } from '../utils/random'

function createEmptyMap(): Tile[][] {
  const tiles: Tile[][] = []
  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles[y][x] = { type: 'grass', x, y }
    }
  }
  return tiles
}

function addForestClusters(tiles: Tile[][], targetCount: number): void {
  let placed = 0
  const maxAttempts = 1000
  let attempts = 0

  while (placed < targetCount && attempts < maxAttempts) {
    attempts++
    const cx = randomInt(2, MAP_WIDTH - 3)
    const cy = randomInt(2, MAP_HEIGHT - 3)
    const radius = randomInt(1, 3)

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue
        const nx = cx + dx
        const ny = cy + dy
        if (nx < 1 || nx >= MAP_WIDTH - 1 || ny < 1 || ny >= MAP_HEIGHT - 1) continue
        if (tiles[ny][nx].type === 'grass') {
          tiles[ny][nx].type = 'forest'
          placed++
        }
      }
    }
  }
}

function addWater(tiles: Tile[][], targetCount: number): void {
  // Add a river
  let x = randomInt(2, MAP_WIDTH - 3)
  let placed = 0

  for (let y = 0; y < MAP_HEIGHT && placed < targetCount; y++) {
    tiles[y][x].type = 'water'
    placed++
    if (x > 1 && x < MAP_WIDTH - 2) {
      const rand = Math.random()
      if (rand < 0.3) x = Math.max(1, Math.min(MAP_WIDTH - 2, x + 1))
      else if (rand < 0.6) x = Math.max(1, Math.min(MAP_WIDTH - 2, x - 1))
    }
  }

  // Add a lake
  const lx = randomInt(5, MAP_WIDTH - 8)
  const ly = randomInt(5, MAP_HEIGHT - 8)
  const lRadius = randomInt(2, 3)

  for (let dy = -lRadius; dy <= lRadius; dy++) {
    for (let dx = -lRadius; dx <= lRadius; dx++) {
      if (dx * dx + dy * dy > lRadius * lRadius) continue
      const nx = lx + dx
      const ny = ly + dy
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        tiles[ny][nx].type = 'water'
      }
    }
  }
}

function addMountains(tiles: Tile[][]): void {
  // Mountains on edges
  for (let i = 0; i < MAP_WIDTH; i++) {
    if (Math.random() < 0.6) tiles[0][i].type = 'mountain'
    if (Math.random() < 0.6) tiles[MAP_HEIGHT - 1][i].type = 'mountain'
  }
  for (let i = 0; i < MAP_HEIGHT; i++) {
    if (Math.random() < 0.6) tiles[i][0].type = 'mountain'
    if (Math.random() < 0.6) tiles[i][MAP_WIDTH - 1].type = 'mountain'
  }

  // Small mountain cluster
  const mx = randomInt(0, MAP_WIDTH - 1)
  const my = randomInt(0, MAP_HEIGHT - 1)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = mx + dx
      const ny = my + dy
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        if (Math.random() < 0.5) tiles[ny][nx].type = 'mountain'
      }
    }
  }
}

export function generateMap(width: number, height: number): Tile[][] {
  const totalTiles = width * height
  const tiles = createEmptyMap()

  const forestTarget = Math.floor(totalTiles * 0.2)
  const waterTarget = Math.floor(totalTiles * 0.1)

  addForestClusters(tiles, forestTarget)
  addWater(tiles, waterTarget)
  addMountains(tiles)

  // Ensure center area is clear for initial buildings
  for (let y = 8; y <= 20; y++) {
    for (let x = 7; x <= 22; x++) {
      const t = tiles[y][x]
      if (t.type !== 'grass') {
        // Keep some trees but clear water/mountain
        if (t.type === 'water' || t.type === 'mountain') {
          tiles[y][x].type = 'grass'
        }
      }
    }
  }

  return tiles
}

export function getTileType(_x: number, _y: number, tiles: Tile[][]): TileType {
  if (_y < 0 || _y >= tiles.length || _x < 0 || _x >= tiles[0].length) return 'grass'
  return tiles[_y][_x].type
}
