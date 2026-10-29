import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonClass'
import { Spinner } from './Spinner'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingLabel?: ReactNode
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, loadingLabel, block, className, children, disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, clsx(block && 'w-full', loading && 'disabled:bg-primary-500 disabled:text-white', className))}
    >
      {loading ? (
        <>
          <Spinner className="size-5" />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
