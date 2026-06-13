import { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { useVillagerStore } from '../store/villagerStore'
import { useTimeStore } from '../store/timeStore'
import { TILE_COLORS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../entities/Tile'
import { BUILDING_COLORS, BUILDING_EMOJI, BUILDING_SIZES, BuildingType } from '../entities/Building'
import { JOB_EMOJI } from '../entities/Villager'
import { getNightOverlayOpacity, getSeasonTint } from '../engine/TimeSystem'

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  const { tiles, buildings, camera, setCamera, buildMode, placeBuilding, selectedBuildingType } = useGameStore()
  const { villagers, selectVillager } = useVillagerStore()
  const { hour, season } = useTimeStore()

  // Render everything
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !tiles.length) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { x: camX, y: camY, zoom } = camera

    ctx.save()
    ctx.translate(camX, camY)
    ctx.scale(zoom, zoom)

    // Draw tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = tiles[y]?.[x]
        if (!tile) continue

        const px = x * TILE_SIZE
        const py = y * TILE_SIZE

        ctx.fillStyle = TILE_COLORS[tile.type]
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)

        // Tile border
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
      }
    }

    // Draw buildings
    for (const building of buildings) {
      const { x: bx, y: by } = building.position
      const size = BUILDING_SIZES[building.type as BuildingType]
      const px = bx * TILE_SIZE
      const py = by * TILE_SIZE
      const pw = size.w * TILE_SIZE
      const ph = size.h * TILE_SIZE

      ctx.fillStyle = BUILDING_COLORS[building.type as BuildingType]
      ctx.fillRect(px, py, pw, ph)
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(px, py, pw, ph)

      // Status indicator
      if (building.status === 'constructing') {
        ctx.fillStyle = 'rgba(255,200,0,0.5)'
        ctx.fillRect(px, py, pw, ph)
      }

      // Emoji label
      ctx.font = `${TILE_SIZE * 0.7 * Math.min(size.w, size.h) * 0.5}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(BUILDING_EMOJI[building.type as BuildingType], px + pw / 2, py + ph / 2)
    }

    // Draw villagers
    for (const villager of villagers) {
      const { x: vx, y: vy } = villager.position

      // Circle shadow
      ctx.beginPath()
      ctx.arc(vx + 2, vy + 2, 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fill()

      // Circle body
      ctx.beginPath()
      ctx.arc(vx, vy, 8, 0, Math.PI * 2)
      ctx.fillStyle = villager.color
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Job emoji
      ctx.font = '12px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(JOB_EMOJI[villager.job], vx, vy - 8)
    }

    ctx.restore()

    // Night overlay
    const nightOpacity = getNightOverlayOpacity(hour)
    if (nightOpacity > 0) {
      ctx.fillStyle = `rgba(0, 10, 40, ${nightOpacity})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Season tint
    const tint = getSeasonTint(season)
    if (tint.a > 0) {
      ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [tiles, buildings, villagers, camera, hour, season])

  // Render loop
  useEffect(() => {
    let frameId: number

    const loop = () => {
      render()
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [render])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Mouse/touch handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (buildMode && selectedBuildingType) {
      // Place building
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const { x: camX, y: camY, zoom } = camera
      const worldX = (mx - camX) / zoom
      const worldY = (my - camY) / zoom
      const tileX = Math.floor(worldX / TILE_SIZE)
      const tileY = Math.floor(worldY / TILE_SIZE)
      placeBuilding(tileX, tileY)
      return
    }

    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [buildMode, selectedBuildingType, camera, placeBuilding])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    setCamera({ x: camera.x + dx, y: camera.y + dy })
  }, [camera, setCamera])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      isDragging.current = false
      return
    }

    // Click to select villager
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { x: camX, y: camY, zoom } = camera
    const worldX = (mx - camX) / zoom
    const worldY = (my - camY) / zoom

    const clicked = villagers.find(v => {
      const dx = v.position.x - worldX
      const dy = v.position.y - worldY
      return Math.sqrt(dx * dx + dy * dy) < 10
    })

    selectVillager(clicked?.id || null)
  }, [camera, villagers, selectVillager])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.3, Math.min(3, camera.zoom * zoomFactor))

    // Zoom towards mouse position
    const newCamX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom)
    const newCamY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom)

    setCamera({ zoom: newZoom, x: newCamX, y: newCamY })
  }, [camera, setCamera])

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{ cursor: buildMode ? 'crosshair' : isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    />
  )
}
