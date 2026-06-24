import { useSyncExternalStore } from 'react'
import type { GridNode } from '@/types'

/**
 * Minimal in-memory grid store.
 *
 * Intentionally framework-light: a tiny observable backed by
 * `useSyncExternalStore`, with no external state dependency. Holds the
 * known grid nodes and the currently selected node id.
 */

interface GridState {
  nodes: GridNode[]
  selectedNodeId: string | null
}

/** Seed topology — a representative slice of our Chad presence. */
const SEED_NODES: GridNode[] = [
  { id: 'n-ndjamena', label: "N'DJAMENA", x: 196, y: 188, status: 'online' },
  { id: 'n-moundou', label: 'MOUNDOU', x: 96, y: 320, status: 'online' },
  { id: 'n-sarh', label: 'SARH', x: 320, y: 470, status: 'degraded' },
  { id: 'n-abeche', label: 'ABÉCHÉ', x: 612, y: 168, status: 'online' },
  { id: 'n-kelo', label: 'KÉLO', x: 700, y: 92, status: 'standby' },
  { id: 'n-koumra', label: 'KOUMRA', x: 690, y: 470, status: 'online' },
  { id: 'n-pala', label: 'PALA', x: 820, y: 300, status: 'online' },
  { id: 'n-am-timan', label: 'AM TIMAN', x: 940, y: 340, status: 'degraded' },
  { id: 'n-bongor', label: 'BONGOR', x: 1120, y: 460, status: 'online' },
  { id: 'n-mongo', label: 'MONGO', x: 1140, y: 230, status: 'online' },
  { id: 'n-doba', label: 'DOBA', x: 1040, y: 280, status: 'online' },
  { id: 'n-ati', label: 'ATI', x: 260, y: 110, status: 'standby' },
]

let state: GridState = {
  nodes: SEED_NODES,
  selectedNodeId: null,
}

const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): GridState {
  return state
}

/** Replace the selected node id (or clear it with `null`). */
export function selectNode(id: string | null): void {
  if (state.selectedNodeId === id) return
  state = { ...state, selectedNodeId: id }
  emit()
}

/** Patch a node's status in place, returning a fresh state object. */
export function setNodeStatus(id: string, status: GridNode['status']): void {
  const next = state.nodes.map((node) => (node.id === id ? { ...node, status } : node))
  state = { ...state, nodes: next }
  emit()
}

/** Read-only access to the current node list (non-reactive). */
export function getNodes(): readonly GridNode[] {
  return state.nodes
}

/** React hook returning the live grid state. */
export function useGridStore(): GridState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Convenience hook: the currently selected node, or `null`. */
export function useSelectedNode(): GridNode | null {
  const { nodes, selectedNodeId } = useGridStore()
  if (!selectedNodeId) return null
  return nodes.find((node) => node.id === selectedNodeId) ?? null
}
