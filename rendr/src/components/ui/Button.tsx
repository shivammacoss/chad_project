import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'brand' | 'dark' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-semibold leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  brand: 'bg-brand text-ink shadow-pill hover:bg-brand-600 hover:-translate-y-0.5',
  dark: 'bg-ink text-white hover:bg-ink-soft hover:-translate-y-0.5',
  outline: 'border border-line bg-white text-ink hover:border-ink/30 hover:bg-cloud',
  ghost: 'text-ink/70 hover:bg-cloud hover:text-ink',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
}

/** Pill button — the primary interactive element across the site. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'brand', size = 'md', fullWidth, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
