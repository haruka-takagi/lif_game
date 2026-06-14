import { useTimeStore } from '../store/timeStore'

const SEASON_EMOJI: Record<string, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
}

const SEASON_COLORS: Record<string, string> = {
  spring: 'text-green-400',
  summer: 'text-yellow-400',
  autumn: 'text-orange-400',
  winter: 'text-blue-300',
}

function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24
  const m = Math.floor((hour % 1) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function TimeBar() {
  const { hour, day, season, speed, paused, setSpeed, togglePause } = useTimeStore()

  const isDay = hour >= 6 && hour < 22
  const timeIcon = isDay ? '☀️' : '🌙'

  return (
    <div className="flex items-center gap-3 bg-gray-900 bg-opacity-80 px-4 py-2 rounded-lg text-white text-sm">
      {/* Time */}
      <span className="text-yellow-300 font-mono font-bold text-base">
        {timeIcon} {formatHour(hour)}
      </span>

      {/* Day */}
      <span className="text-gray-300">
        Day {day}
      </span>

      {/* Season */}
      <span className={`font-semibold ${SEASON_COLORS[season]}`}>
        {SEASON_EMOJI[season]} {season.charAt(0).toUpperCase() + season.slice(1)}
      </span>

      {/* Divider */}
      <span className="text-gray-600">|</span>

      {/* Pause button */}
      <button
        onClick={togglePause}
        className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors font-bold"
        title={paused ? 'Resume' : 'Pause'}
      >
        {paused ? '▶' : '⏸'}
      </button>

      {/* Speed buttons */}
      <div className="flex gap-1">
        {([1, 2, 4] as const).map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
              speed === s && !paused
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
