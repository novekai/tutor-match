import clsx from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg' | 'sm'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none',
  secondary:
    'bg-white text-neutral-900 border border-neutral-200 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 disabled:text-neutral-400',
  ghost: 'bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:text-neutral-400 disabled:bg-neutral-100',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-label rounded-md gap-1.5',
  md: 'h-12 px-5 text-label rounded-md gap-2',
  lg: 'h-14 px-6 text-body font-semibold rounded-md gap-2',
}

export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) =>
  clsx(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100',
    variants[variant],
    sizes[size],
    extra,
  )
