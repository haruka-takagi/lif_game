import { useVillagerStore } from '../store/villagerStore'
import { JOB_EMOJI } from '../entities/Villager'

function NeedsBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-xs w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="text-gray-300 text-xs w-7 text-right shrink-0">{Math.floor(value)}</span>
    </div>
  )
}

const STATE_COLORS: Record<string, string> = {
  idle: 'bg-gray-500', moving: 'bg-blue-500', working: 'bg-green-500',
  eating: 'bg-orange-500', sleeping: 'bg-purple-600',
}
const STATE_LABELS: Record<string, string> = {
  idle: '💤 待機', moving: '🚶 移動中', working: '⚒️ 仕事中',
  eating: '🍴 食事中', sleeping: '😴 就寝中',
}

export function VillagerCard() {
  const { villagers, selectedVillagerId, selectVillager } = useVillagerStore()
  const villager = villagers.find(v => v.id === selectedVillagerId)

  if (!villager) return null

  return (
    /* bottom-center on mobile, bottom-right on sm+ */
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-3
                    w-56 bg-gray-900/95 text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700"
           style={{ backgroundColor: villager.color + '33' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{JOB_EMOJI[villager.job]}</span>
          <div>
            <div className="font-bold text-xs">{villager.name}</div>
            <div className="text-[10px] text-gray-400 capitalize">{villager.job}</div>
          </div>
        </div>
        <button
          onClick={() => selectVillager(null)}
          className="text-gray-500 hover:text-gray-300 text-xl leading-none touch-manipulation px-1"
        >
          ×
        </button>
      </div>

      {/* State badge */}
      <div className="px-3 py-1.5 flex items-center gap-2">
        <span className="text-[10px] text-gray-400">状態:</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${STATE_COLORS[villager.state]}`}>
          {STATE_LABELS[villager.state]}
        </span>
      </div>

      {/* Needs */}
      <div className="px-3 pb-3 space-y-1.5">
        <NeedsBar label="🍖 空腹" value={villager.needs.hunger}
          color={villager.needs.hunger < 30 ? 'bg-red-500' : 'bg-green-500'} />
        <NeedsBar label="⚡ 体力" value={villager.needs.energy}
          color={villager.needs.energy < 20 ? 'bg-red-500' : 'bg-blue-500'} />
        <NeedsBar label="😊 幸福" value={villager.needs.happiness}
          color={villager.needs.happiness >= 70 ? 'bg-yellow-400' :
                 villager.needs.happiness >= 40 ? 'bg-orange-400' : 'bg-red-500'} />
      </div>
    </div>
  )
}
