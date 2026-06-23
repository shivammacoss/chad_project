/**
 * Operational status of a grid node.
 */
export type NodeStatus = 'online' | 'degraded' | 'offline' | 'standby'

/**
 * A single node in the global grid topology.
 *
 * Coordinates are expressed in the GridCanvas viewBox space
 * (0–1280 on x, 0–600 on y) so they can be rendered directly as SVG.
 */
export interface GridNode {
  id: string
  /** Human-readable region/site label, e.g. "EU-WEST-3". */
  label: string
  /** X coordinate within the 1280-wide canvas. */
  x: number
  /** Y coordinate within the 600-tall canvas. */
  y: number
  status: NodeStatus
}

/**
 * A directed/undirected connection between two grid nodes.
 */
export interface GridEdge {
  id: string
  /** Source node id. */
  from: string
  /** Target node id. */
  to: string
  /** Relative throughput weight, 0–1, used for visual emphasis. */
  weight?: number
}

/**
 * Live telemetry sample for a single node.
 */
export interface NodeTelemetry {
  nodeId: string
  /** Epoch milliseconds for the sample. */
  timestamp: number
  /** Load as a fraction 0–1. */
  load: number
  /** Throughput in watts (or abstract power units). */
  throughput: number
  /** Round-trip latency in milliseconds. */
  latencyMs: number
}

/**
 * A platform feature surfaced on the marketing site.
 */
export interface Feature {
  /** Stable id, e.g. "F-01". */
  id: string
  title: string
  description: string
}

/**
 * A headline metric rendered in a MetricCard.
 */
export interface Metric {
  value: string
  label: string
  sublabel: string
}
