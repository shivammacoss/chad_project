import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 *
 * Combines `clsx` (conditional/array/object class syntax) with
 * `tailwind-merge` (last-wins conflict resolution for Tailwind utilities).
 *
 * @example
 * cn('px-2', condition && 'px-4', 'text-frost')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
