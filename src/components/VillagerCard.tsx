import { useVillagerStore } from '../store/villagerStore'
import { JOB_EMOJI } from '../entities/Villager'

function NeedsBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-xs w-16">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="text-gray-300 text-xs w-8 text-right">{Math.floor(value)}</span>
    </div>
  )
}

const STATE_COLORS: Record<string, string> = {
  idle: 'bg-gray-500',
  moving: 'bg-blue-500',
  working: 'bg-green-500',
  eating: 'bg-orange-500',
  sleeping: 'bg-purple-600',
}

const STATE_LABELS: Record<string, string> = {
  idle: '💤 Idle',
  moving: '🚶 Moving',
  working: '⚒️ Working',
  eating: '🍴 Eating',
  sleeping: '😴 Sleeping',
}

export function VillagerCard() {
  const { villagers, selectedVillagerId, selectVillager } = useVillagerStore()
  const villager = villagers.find(v => v.id === selectedVillagerId)

  if (!villager) return null

  return (
    <div className="absolute bottom-20 right-4 w-64 bg-gray-900 bg-opacity-95 text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700"
           style={{ backgroundColor: villager.color + '33' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{JOB_EMOJI[villager.job]}</span>
          <div>
            <div className="font-bold text-sm">{villager.name}</div>
            <div className="text-xs text-gray-400 capitalize">{villager.job}</div>
          </div>
        </div>
        <button
          onClick={() => selectVillager(null)}
          className="text-gray-500 hover:text-gray-300 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* State badge */}
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">Status:</span>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATE_COLORS[villager.state]}`}>
          {STATE_LABELS[villager.state]}
        </span>
      </div>

      {/* Needs */}
      <div className="px-4 pb-4 space-y-2">
        <NeedsBar
          label="🍖 Hunger"
          value={villager.needs.hunger}
          color={villager.needs.hunger < 30 ? 'bg-red-500' : 'bg-green-500'}
        />
        <NeedsBar
          label="⚡ Energy"
          value={villager.needs.energy}
          color={villager.needs.energy < 20 ? 'bg-red-500' : 'bg-blue-500'}
        />
        <NeedsBar
          label="😊 Happy"
          value={villager.needs.happiness}
          color={
            villager.needs.happiness >= 70 ? 'bg-yellow-400' :
            villager.needs.happiness >= 40 ? 'bg-orange-400' :
            'bg-red-500'
          }
        />
      </div>
    </div>
  )
}
