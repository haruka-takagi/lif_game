import { useEffect } from 'react'
import { GameLoop } from '../engine/GameLoop'

export function useGameLoop(): void {
  useEffect(() => {
    GameLoop.start()
    return () => {
      GameLoop.stop()
    }
  }, [])
}
