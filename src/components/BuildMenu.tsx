import { useGameStore } from '../store/gameStore'
import { BuildingType, BUILDING_COSTS, BUILDING_EMOJI } from '../entities/Building'
import { RESOURCE_EMOJI } from '../entities/Resource'

const BUILDING_LIST: { type: BuildingType; label: string }[] = [
  { type: 'house',       label: '家'     },
  { type: 'farm',        label: '農場'   },
  { type: 'dining_hall', label: '食堂'   },
  { type: 'woodcutter',  label: '木こり' },
  { type: 'quarry',      label: '採石場' },
  { type: 'market',      label: '市場'   },
]

const RESOURCE_KEYS = ['wood', 'stone', 'gold', 'food']

export function BuildMenu() {
  const { selectedBuildingType, buildMode, selectBuildingType, setBuildMode, canAfford } = useGameStore()

  function handleSelect(type: BuildingType) {
    if (selectedBuildingType === type && buildMode) {
      selectBuildingType(null); setBuildMode(false)
    } else {
      selectBuildingType(type); setBuildMode(true)
    }
  }

  function handleClose() {
    selectBuildingType(null); setBuildMode(false)
  }

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-16px)] max-w-lg pointer-events-auto">
      <div className="bg-gray-900/90 rounded-xl px-3 pt-2 pb-3 border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-xs font-bold tracking-wide uppercase">🏗 Build</span>
          {buildMode && (
            <button onClick={handleClose} className="text-gray-400 hover:text-white text-xs touch-manipulation">
              ✕ キャンセル
            </button>
          )}
        </div>

        {/* Buttons — horizontally scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide snap-x">
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
                  flex-shrink-0 snap-start flex flex-col items-center gap-0.5
                  w-[72px] px-1 py-2 rounded-lg border transition-all touch-manipulation
                  ${selected
                    ? 'border-blue-400 bg-blue-600/40 text-white'
                    : affordable
                    ? 'border-gray-600 bg-gray-800 active:bg-gray-700 text-white'
                    : 'border-gray-700 bg-gray-800 opacity-50 text-gray-500 cursor-not-allowed'}
                `}
              >
                <span className="text-2xl leading-none">{BUILDING_EMOJI[type]}</span>
                <span className="text-[10px] font-semibold leading-tight">{label}</span>
                <div className="flex flex-wrap gap-x-1 justify-center mt-0.5">
                  {RESOURCE_KEYS.map(rk => {
                    const cost = costs[rk]
                    if (!cost) return null
                    return (
                      <span key={rk} className="text-[10px] text-gray-300 leading-tight">
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
          <div className="mt-1.5 text-center text-[10px] text-blue-300">
            マップをタップして配置
          </div>
        )}
      </div>
    </div>
  )
}
