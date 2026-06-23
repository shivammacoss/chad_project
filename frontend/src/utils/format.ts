/**
 * Format a number using SI (metric) suffixes.
 *
 * @example
 * formatSI(2_400_000_000) // "2.4B"
 * formatSI(61)            // "61"
 * formatSI(0.061, 2)     // "61.00m" (milli)
 *
 * @param value   The raw numeric value.
 * @param digits  Significant fractional digits to keep (default 1).
 */
export function formatSI(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)

  const units: Array<{ threshold: number; suffix: string }> = [
    { threshold: 1e12, suffix: 'T' },
    { threshold: 1e9, suffix: 'B' },
    { threshold: 1e6, suffix: 'M' },
    { threshold: 1e3, suffix: 'K' },
  ]

  for (const { threshold, suffix } of units) {
    if (abs >= threshold) {
      return `${sign}${trimZeros((abs / threshold).toFixed(digits))}${suffix}`
    }
  }

  // Sub-unit values get a milli suffix to stay compact.
  if (abs < 1) {
    return `${sign}${trimZeros((abs * 1000).toFixed(digits))}m`
  }

  return `${sign}${trimZeros(abs.toFixed(digits))}`
}

/**
 * Format an epoch-millisecond timestamp as a compact, locale-aware string.
 *
 * @example
 * formatTimestamp(1718000000000) // "Jun 10, 2024, 06:13:20"
 *
 * @param timestamp  Epoch milliseconds.
 * @param withSeconds  Include seconds in the output (default true).
 */
export function formatTimestamp(timestamp: number, withSeconds = true): string {
  if (!Number.isFinite(timestamp)) return '—'

  const date = new Date(timestamp)

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(date)
}

/** Strip trailing ".0" / superfluous zeros from a fixed-point string. */
function trimZeros(fixed: string): string {
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}
