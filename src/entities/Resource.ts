export type ResourceType = 'food' | 'wood' | 'stone' | 'gold'

export const RESOURCE_EMOJI: Record<ResourceType, string> = {
  food: '🌽',
  wood: '🪵',
  stone: '🪨',
  gold: '💰',
}

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  food: '#4CAF50',
  wood: '#8D6E63',
  stone: '#9E9E9E',
  gold: '#FFD700',
}
