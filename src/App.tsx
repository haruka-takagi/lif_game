import { useEffect } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { HUD } from './components/HUD'
import { useGameStore } from './store/gameStore'
import { useVillagerStore, createVillager } from './store/villagerStore'
import { useGameLoop } from './hooks/useGameLoop'
import { TILE_SIZE } from './entities/Tile'
import { VillagerJob, JOB_COLORS, VILLAGER_NAMES } from './entities/Villager'

const INITIAL_JOBS: VillagerJob[] = ['farmer', 'woodcutter', 'miner', 'builder', 'merchant']

function GameInitializer() {
  const { initialize, initialized, buildings } = useGameStore()
  const { villagers, addVillager } = useVillagerStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!initialized || villagers.length > 0) return

    // Wait for buildings to be placed
    const houses = buildings.filter(b => b.type === 'house')
    if (houses.length === 0) return

    // Spawn 5 villagers
    for (let i = 0; i < 5; i++) {
      const house = houses[i % houses.length]
      const homePos = {
        x: (house.position.x + 1) * TILE_SIZE + TILE_SIZE / 2,
        y: (house.position.y + 1) * TILE_SIZE + TILE_SIZE / 2,
      }
      const job = INITIAL_JOBS[i]
      const villager = createVillager(VILLAGER_NAMES[i], job, homePos, house.id)
      villager.color = JOB_COLORS[job]
      addVillager(villager)
    }
  }, [initialized, buildings, villagers.length, addVillager])

  // Update population
  const { population } = useGameStore()
  const { setHappiness } = useGameStore()
  useEffect(() => {
    // Update population count whenever villagers change
    if (villagers.length !== population) {
      useGameStore.setState({ population: villagers.length })
    }
  }, [villagers.length, population, setHappiness])

  return null
}

export default function App() {
  useGameLoop()

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 relative select-none">
      <GameInitializer />
      <GameCanvas />
      <HUD />
    </div>
  )
}
