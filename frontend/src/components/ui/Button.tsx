import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to fill the parent width. */
  fullWidth?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-semibold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:pointer-events-none disabled:opacity-50'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-electric text-white shadow-lg shadow-teal-electric/25 hover:bg-teal-electric/90 active:bg-teal-electric/80',
  outline:
    'border border-teal-electric/40 text-teal-electric hover:bg-teal-electric/10 active:bg-teal-electric/[0.16]',
  ghost: 'text-frost/70 hover:bg-steel hover:text-frost active:bg-steel/80',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

/**
 * Custom button — the single interactive primitive across the app.
 * Supports `primary | outline | ghost` variants and `sm | md | lg` sizes.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }
