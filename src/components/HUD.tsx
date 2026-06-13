import { TimeBar } from './TimeBar'
import { ResourcePanel } from './ResourcePanel'
import { BuildMenu } from './BuildMenu'
import { VillagerCard } from './VillagerCard'

export function HUD() {
  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <ResourcePanel />
        </div>
        <div className="pointer-events-auto">
          <TimeBar />
        </div>
      </div>

      {/* Bottom center: Build menu */}
      <BuildMenu />

      {/* Villager card */}
      <VillagerCard />

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <h1 className="text-white text-lg font-bold drop-shadow-lg opacity-60 tracking-widest uppercase">
          Village of Yours
        </h1>
      </div>
    </>
  )
}
