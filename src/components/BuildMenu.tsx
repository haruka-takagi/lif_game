import { useGameStore } from '../store/gameStore'
import { BuildingType, BUILDING_COSTS, BUILDING_EMOJI } from '../entities/Building'
import { RESOURCE_EMOJI } from '../entities/Resource'

const BUILDING_LIST: { type: BuildingType; label: string }[] = [
  { type: 'house', label: 'House' },
  { type: 'farm', label: 'Farm' },
  { type: 'dining_hall', label: 'Dining Hall' },
  { type: 'woodcutter', label: 'Woodcutter' },
  { type: 'quarry', label: 'Quarry' },
  { type: 'market', label: 'Market' },
]

const RESOURCE_KEYS = ['wood', 'stone', 'gold', 'food']

export function BuildMenu() {
  const { selectedBuildingType, buildMode, selectBuildingType, setBuildMode, canAfford } = useGameStore()

  function handleSelect(type: BuildingType) {
    if (selectedBuildingType === type && buildMode) {
      selectBuildingType(null)
      setBuildMode(false)
    } else {
      selectBuildingType(type)
      setBuildMode(true)
    }
  }

  function handleClose() {
    selectBuildingType(null)
    setBuildMode(false)
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2">
      {/* Build button / toggle */}
      <div className="bg-gray-900 bg-opacity-90 rounded-xl p-3 border border-gray-700 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-xs font-bold tracking-wide uppercase">Build</span>
          {buildMode && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white text-xs ml-auto"
            >
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {BUILDING_LIST.map(({ type, label }) => {
            const costs = BUILDING_COSTS[type]
            const affordable = canAfford(type)
            const selected = selectedBuildingType === type && buildMode

            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                disabled={!affordable}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all
                  ${selected
                    ? 'border-blue-400 bg-blue-600 bg-opacity-40 text-white'
                    : affordable
                    ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-white cursor-pointer'
                    : 'border-gray-700 bg-gray-800 opacity-50 text-gray-500 cursor-not-allowed'}
                `}
                title={label}
              >
                <span className="text-xl">{BUILDING_EMOJI[type]}</span>
                <span className="text-xs font-semibold">{label}</span>
                <div className="flex flex-wrap gap-x-1 justify-center">
                  {RESOURCE_KEYS.map(rk => {
                    const cost = costs[rk]
                    if (!cost) return null
                    return (
                      <span key={rk} className="text-xs text-gray-300">
                        {RESOURCE_EMOJI[rk as keyof typeof RESOURCE_EMOJI]}{cost}
                      </span>
                    )
                  })}
                </div>
              </button>
            )
          })}
        </div>

        {buildMode && selectedBuildingType && (
          <div className="mt-2 text-center text-xs text-blue-300">
            Click on the map to place {selectedBuildingType.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  )
}
