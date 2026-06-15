import { useGameStore } from '../store/gameStore'
import { RESOURCE_EMOJI } from '../entities/Resource'

export function ResourcePanel() {
  const { resources, population, happiness } = useGameStore()

  const resourceList = [
    { key: 'food',  emoji: RESOURCE_EMOJI.food,  color: 'text-green-400' },
    { key: 'wood',  emoji: RESOURCE_EMOJI.wood,  color: 'text-amber-500' },
    { key: 'stone', emoji: RESOURCE_EMOJI.stone, color: 'text-gray-400'  },
    { key: 'gold',  emoji: RESOURCE_EMOJI.gold,  color: 'text-yellow-400'},
  ]

  const happinessColor =
    happiness >= 70 ? 'text-green-400' :
    happiness >= 40 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 bg-gray-900/80 px-3 py-1.5 rounded-lg text-white text-xs">
      {resourceList.map(({ key, emoji, color }) => (
        <div key={key} className="flex items-center gap-0.5">
          <span>{emoji}</span>
          <span className={`font-mono font-bold ${color}`}>
            {Math.floor(resources[key] || 0)}
          </span>
        </div>
      ))}

      <span className="text-gray-600 hidden sm:inline">|</span>

      <div className="flex items-center gap-0.5">
        <span>👥</span>
        <span className="font-mono font-bold text-blue-300">{population}</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span>😊</span>
        <span className={`font-mono font-bold ${happinessColor}`}>{happiness}%</span>
      </div>
    </div>
  )
}
