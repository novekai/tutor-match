import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('animate-pulse rounded-sm bg-neutral-100', className)} />
}
