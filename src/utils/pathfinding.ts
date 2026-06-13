import { Tile, MAP_WIDTH, MAP_HEIGHT } from '../entities/Tile'

interface Node {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent: Node | null
}

function heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function getNeighbors(node: Node, tiles: Tile[][]): Node[] {
  const neighbors: Node[] = []
  const dirs = [
    { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: 0 }, { x: 1, y: 0 },
  ]

  for (const dir of dirs) {
    const nx = node.x + dir.x
    const ny = node.y + dir.y

    if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue
    const tile = tiles[ny][nx]
    if (tile.type === 'water' || tile.type === 'mountain') continue

    neighbors.push({
      x: nx, y: ny, g: 0, h: 0, f: 0, parent: null,
    })
  }

  return neighbors
}

export function findPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  tiles: Tile[][]
): { x: number; y: number }[] {
  const startNode: Node = { x: Math.floor(start.x), y: Math.floor(start.y), g: 0, h: 0, f: 0, parent: null }
  const endNode: Node = { x: Math.floor(end.x), y: Math.floor(end.y), g: 0, h: 0, f: 0, parent: null }

  if (startNode.x === endNode.x && startNode.y === endNode.y) return []

  const openList: Node[] = []
  const closedSet = new Set<string>()

  startNode.h = heuristic(startNode, endNode)
  startNode.f = startNode.h
  openList.push(startNode)

  let iterations = 0
  const MAX_ITERATIONS = 500

  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++
    // Find node with lowest f
    let lowestIdx = 0
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIdx].f) lowestIdx = i
    }

    const current = openList[lowestIdx]
    const key = `${current.x},${current.y}`

    if (current.x === endNode.x && current.y === endNode.y) {
      // Reconstruct path
      const path: { x: number; y: number }[] = []
      let node: Node | null = current
      while (node) {
        path.unshift({ x: node.x, y: node.y })
        node = node.parent
      }
      return path
    }

    openList.splice(lowestIdx, 1)
    closedSet.add(key)

    const neighbors = getNeighbors(current, tiles)
    for (const neighbor of neighbors) {
      const nKey = `${neighbor.x},${neighbor.y}`
      if (closedSet.has(nKey)) continue

      const g = current.g + 1
      const existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y)

      if (!existing) {
        neighbor.g = g
        neighbor.h = heuristic(neighbor, endNode)
        neighbor.f = neighbor.g + neighbor.h
        neighbor.parent = current
        openList.push(neighbor)
      } else if (g < existing.g) {
        existing.g = g
        existing.f = existing.g + existing.h
        existing.parent = current
      }
    }
  }

  // Fallback: direct line path
  return [{ x: endNode.x, y: endNode.y }]
}

export function getWalkableTile(
  x: number,
  y: number,
  tiles: Tile[][]
): { x: number; y: number } | null {
  const radius = 3
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue
      const tile = tiles[ny][nx]
      if (tile.type !== 'water' && tile.type !== 'mountain' && !tile.building) {
        return { x: nx, y: ny }
      }
    }
  }
  return null
}
