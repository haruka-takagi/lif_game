export type TileType = 'grass' | 'forest' | 'water' | 'mountain'

export interface Tile {
  type: TileType
  x: number
  y: number
  building?: string
}

export const TILE_COLORS: Record<TileType, string> = {
  grass: '#7ec850',
  forest: '#2d6a4f',
  water: '#48cae4',
  mountain: '#8B7355',
}

export const TILE_SIZE = 32
export const MAP_WIDTH = 30
export const MAP_HEIGHT = 30
