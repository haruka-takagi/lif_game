import { TimeBar } from './TimeBar'
import { ResourcePanel } from './ResourcePanel'
import { BuildMenu } from './BuildMenu'
import { VillagerCard } from './VillagerCard'

export function HUD() {
  return (
    <>
      {/* Top bar — stacks on narrow screens */}
      <div className="absolute top-2 left-0 right-0 flex flex-wrap justify-between items-start gap-2 px-2 pointer-events-none">
        <div className="pointer-events-auto">
          <ResourcePanel />
        </div>
        <div className="pointer-events-auto">
          <TimeBar />
        </div>
      </div>

      {/* Bottom: build menu */}
      <BuildMenu />

      {/* Villager card */}
      <VillagerCard />
    </>
  )
}
