import { useRef, useEffect, useCallback } from 'react'

type DrawFn = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void

export function useCanvas(draw: DrawFn, deps: unknown[]): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    draw(ctx, canvas)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return canvasRef
}

export function useResizeCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
  }, [canvasRef])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])
}
