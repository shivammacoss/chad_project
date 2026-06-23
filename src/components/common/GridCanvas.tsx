import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Point {
  x: number
  y: number
}

/** 18 nodes spread across the 1280×600 canvas. */
const NODES: Point[] = [
  { x: 90, y: 110 },
  { x: 215, y: 230 },
  { x: 140, y: 400 },
  { x: 300, y: 510 },
  { x: 360, y: 150 },
  { x: 470, y: 330 },
  { x: 420, y: 470 },
  { x: 580, y: 90 },
  { x: 620, y: 250 },
  { x: 700, y: 420 },
  { x: 770, y: 180 },
  { x: 840, y: 330 },
  { x: 910, y: 500 },
  { x: 960, y: 130 },
  { x: 1010, y: 290 },
  { x: 1100, y: 410 },
  { x: 1150, y: 200 },
  { x: 1210, y: 340 },
]

/**
 * Edges connecting nodes by index. Hand-tuned so the topology reads as a
 * connected mesh without overcrowding.
 */
const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [1, 4],
  [2, 3],
  [3, 6],
  [4, 5],
  [4, 7],
  [5, 6],
  [5, 8],
  [7, 8],
  [8, 9],
  [8, 10],
  [9, 12],
  [10, 11],
  [10, 13],
  [11, 12],
  [11, 14],
  [13, 14],
  [14, 15],
  [14, 16],
  [15, 17],
  [16, 17],
  [6, 9],
  [12, 15],
]

const BASE_RADIUS = 3.4
const RADIUS_AMPLITUDE = 1.8

/**
 * Animated SVG grid: pulsing nodes connected by faint teal edges.
 *
 * The radius and opacity of each node oscillate on a sine wave offset by
 * index, producing a slow travelling pulse across the mesh. Honors
 * `prefers-reduced-motion` by rendering a static frame.
 *
 * Decorative only — non-interactive and hidden from assistive tech.
 */
export function GridCanvas({ className }: { className?: string }) {
  const circleRefs = useRef<Array<SVGCircleElement | null>>([])

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    let frameId = 0
    const start = performance.now()

    const tick = (now: number): void => {
      const elapsed = (now - start) / 1000

      for (let i = 0; i < circleRefs.current.length; i++) {
        const circle = circleRefs.current[i]
        if (!circle) continue

        // Offset each node's phase by its index for a travelling-pulse effect.
        const phase = Math.sin(elapsed * 1.4 + i * 0.6)
        const normalized = (phase + 1) / 2 // 0 → 1

        const radius = BASE_RADIUS + normalized * RADIUS_AMPLITUDE
        const opacity = 0.35 + normalized * 0.55

        circle.setAttribute('r', radius.toFixed(2))
        circle.setAttribute('opacity', opacity.toFixed(3))
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      viewBox="0 0 1280 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full select-none',
        className,
      )}
    >
      {/* Edges */}
      <g>
        {EDGES.map(([from, to], i) => {
          const a = NODES[from]
          const b = NODES[to]
          return (
            <line
              key={`edge-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#1ED760"
              strokeWidth={1}
              opacity={0.16}
            />
          )
        })}
      </g>

      {/* Nodes */}
      <g>
        {NODES.map((node, i) => (
          <circle
            key={`node-${i}`}
            ref={(el) => {
              circleRefs.current[i] = el
            }}
            className="node"
            cx={node.x}
            cy={node.y}
            r={BASE_RADIUS}
            fill="#1ED760"
            opacity={0.6}
          />
        ))}
      </g>
    </svg>
  )
}
