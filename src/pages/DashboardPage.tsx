import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MetricCard } from '@/components/ui/MetricCard'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useGridStore, useSelectedNode, selectNode } from '@/store/gridStore'
import { formatSI } from '@/utils/format'
import { cn } from '@/lib/utils'
import type { GridNode, NodeStatus, NodeTelemetry } from '@/types'

const STATUS_STYLES: Record<NodeStatus, { dot: string; text: string; label: string }> = {
  online: { dot: 'bg-teal-electric', text: 'text-teal-electric', label: 'Online' },
  degraded: { dot: 'bg-indigo-pulse', text: 'text-indigo-pulse', label: 'Degraded' },
  standby: { dot: 'bg-frost/50', text: 'text-frost/60', label: 'Standby' },
  offline: { dot: 'bg-frost/30', text: 'text-frost/40', label: 'Offline' },
}

/** Deterministic pseudo-telemetry derived from a node id (no randomness). */
function deriveTelemetry(node: GridNode): NodeTelemetry {
  let hash = 0
  for (let i = 0; i < node.id.length; i++) {
    hash = (hash * 31 + node.id.charCodeAt(i)) % 100000
  }
  const load = node.status === 'degraded' ? 0.82 + (hash % 12) / 100 : 0.3 + (hash % 45) / 100
  const throughput = 1.2e6 + (hash % 800) * 1e3
  const latencyMs = 38 + (hash % 60)

  return {
    nodeId: node.id,
    timestamp: 0,
    load: Math.min(load, 0.99),
    throughput,
    latencyMs,
  }
}

function NodeRow({ node, selected }: { node: GridNode; selected: boolean }) {
  const style = STATUS_STYLES[node.status]
  return (
    <button
      type="button"
      onClick={() => selectNode(selected ? null : node.id)}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
        selected
          ? 'border-teal-electric/40 bg-teal-electric/[0.06]'
          : 'border-frost/10 bg-steel/20 hover:border-frost/20 hover:bg-steel/40',
      )}
    >
      <span className="flex items-center gap-3">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', style.dot)} />
        <span className="font-mono text-sm text-frost">{node.label}</span>
      </span>
      <span className={cn('font-mono text-xs uppercase tracking-wider', style.text)}>
        {style.label}
      </span>
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { nodes } = useGridStore()
  const selected = useSelectedNode()

  const summary = useMemo(() => {
    const online = nodes.filter((n) => n.status === 'online').length
    const degraded = nodes.filter((n) => n.status === 'degraded').length
    const avgLatency = Math.round(
      nodes.reduce((sum, n) => sum + deriveTelemetry(n).latencyMs, 0) / Math.max(nodes.length, 1),
    )
    const totalThroughput = nodes.reduce((sum, n) => sum + deriveTelemetry(n).throughput, 0)
    return { online, degraded, avgLatency, totalThroughput }
  }, [nodes])

  const telemetry = selected ? deriveTelemetry(selected) : null

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 border-b border-frost/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <SectionLabel index="—">Operations Console</SectionLabel>
            <h1 className="text-display-md font-semibold text-frost">Global Grid Overview</h1>
            <p className="font-body text-sm text-frost/55">
              Live status across {nodes.length} monitored regions. This is a preview environment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="live">Live feed</Badge>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Exit console
            </Button>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 lg:grid-cols-4">
          <MetricCard value={String(summary.online)} label="Nodes Online" sublabel="Healthy" />
          <MetricCard value={String(summary.degraded)} label="Degraded" sublabel="Needs Attention" />
          <MetricCard value={`${summary.avgLatency}ms`} label="Avg Latency" sublabel="All Regions" />
          <MetricCard
            value={formatSI(summary.totalThroughput)}
            label="Throughput"
            sublabel="Watts / sec"
          />
        </div>

        {/* Map + node list */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Topology map */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl border border-frost/10 bg-steel/20">
              <div className="flex items-center justify-between border-b border-frost/10 px-5 py-3">
                <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                  Topology · live
                </span>
                <span className="font-mono text-xs text-frost/40">1280 × 600</span>
              </div>
              <svg
                viewBox="0 0 1280 600"
                className="h-auto w-full bg-grid-pattern bg-grid"
                role="img"
                aria-label="Global grid node topology map"
              >
                {nodes.map((node) => {
                  const isSelected = selected?.id === node.id
                  const fill =
                    node.status === 'degraded'
                      ? '#F59E0B'
                      : node.status === 'online'
                        ? '#1ED760'
                        : '#9AA3AF'
                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onClick={() => selectNode(isSelected ? null : node.id)}
                    >
                      {isSelected && (
                        <circle cx={node.x} cy={node.y} r={22} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.5} />
                      )}
                      <circle cx={node.x} cy={node.y} r={isSelected ? 9 : 6} fill={fill} opacity={0.9} />
                      <text
                        x={node.x + 14}
                        y={node.y + 4}
                        className="font-mono"
                        fontSize={13}
                        fill="#0E1116"
                        opacity={isSelected ? 0.95 : 0.5}
                      >
                        {node.label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Node list / detail */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-frost/70">
                Regions
              </h2>
              <span className="font-mono text-xs text-frost/40">{nodes.length} total</span>
            </div>

            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
              {nodes.map((node) => (
                <NodeRow key={node.id} node={node} selected={selected?.id === node.id} />
              ))}
            </div>

            {/* Selected detail */}
            {selected && telemetry ? (
              <div className="flex flex-col gap-4 rounded-xl border border-teal-electric/25 bg-steel/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-frost">{selected.label}</span>
                  <span className={cn('font-mono text-xs uppercase', STATUS_STYLES[selected.status].text)}>
                    {STATUS_STYLES[selected.status].label}
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-frost/40">Load</dt>
                    <dd className="font-mono text-lg text-frost">{Math.round(telemetry.load * 100)}%</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-frost/40">Flow</dt>
                    <dd className="font-mono text-lg text-frost">{formatSI(telemetry.throughput)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-frost/40">Ping</dt>
                    <dd className="font-mono text-lg text-frost">{telemetry.latencyMs}ms</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-frost/15 bg-steel/10 p-5 text-center">
                <p className="font-body text-sm text-frost/45">
                  Select a region to inspect live telemetry.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
