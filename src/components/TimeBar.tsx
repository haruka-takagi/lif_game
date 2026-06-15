import { useTimeStore } from '../store/timeStore'

const SEASON_EMOJI: Record<string, string> = {
  spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️',
}
const SEASON_COLORS: Record<string, string> = {
  spring: 'text-green-400', summer: 'text-yellow-400',
  autumn: 'text-orange-400', winter: 'text-blue-300',
}

function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24
  const m = Math.floor((hour % 1) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function TimeBar() {
  const { hour, day, season, speed, paused, setSpeed, togglePause } = useTimeStore()
  const isDay = hour >= 6 && hour < 22

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 bg-gray-900/80 px-3 py-1.5 rounded-lg text-white text-xs">
      {/* Time */}
      <span className="text-yellow-300 font-mono font-bold">
        {isDay ? '☀️' : '🌙'} {formatHour(hour)}
      </span>

      {/* Day + Season */}
      <span className="text-gray-300">Day {day}</span>
      <span className={`font-semibold ${SEASON_COLORS[season]}`}>
        {SEASON_EMOJI[season]} <span className="hidden sm:inline">{season.charAt(0).toUpperCase() + season.slice(1)}</span>
      </span>

      {/* Controls */}
      <button
        onClick={togglePause}
        className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-colors font-bold touch-manipulation"
      >
        {paused ? '▶' : '⏸'}
      </button>

      <div className="flex gap-1">
        {([1, 2, 4] as const).map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`w-8 h-7 flex items-center justify-center rounded font-bold transition-colors touch-manipulation ${
              speed === s && !paused ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
