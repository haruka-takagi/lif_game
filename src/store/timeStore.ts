import { create } from 'zustand'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type GameSpeed = 1 | 2 | 4

export interface TimeState {
  hour: number
  day: number
  season: Season
  speed: GameSpeed
  paused: boolean
  // Actions
  setSpeed: (speed: GameSpeed) => void
  togglePause: () => void
  advanceTime: (minutes: number) => void
}

const DAYS_PER_SEASON = 30

function getSeason(day: number): Season {
  const seasonDay = ((day - 1) % (DAYS_PER_SEASON * 4))
  if (seasonDay < DAYS_PER_SEASON) return 'spring'
  if (seasonDay < DAYS_PER_SEASON * 2) return 'summer'
  if (seasonDay < DAYS_PER_SEASON * 3) return 'autumn'
  return 'winter'
}

export const useTimeStore = create<TimeState>((set) => ({
  hour: 8,
  day: 1,
  season: 'spring',
  speed: 1,
  paused: false,

  setSpeed: (speed) => set({ speed }),
  togglePause: () => set((state) => ({ paused: !state.paused })),

  advanceTime: (minutes) => set((state) => {
    let newHour = state.hour + minutes / 60
    let newDay = state.day

    while (newHour >= 24) {
      newHour -= 24
      newDay++
    }

    return {
      hour: newHour,
      day: newDay,
      season: getSeason(newDay),
    }
  }),
}))
