import { RefreshCw, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

type Props = { title?: string; message: string; onRetry?: () => void; action?: ReactNode }

/** État d'erreur propre (réseau, 404, 5xx) : jamais d'écran blanc. */
export function ErrorState({ title = 'Oups, un souci de connexion', message, onRetry, action }: Props) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-error-bg text-error">
        <WifiOff className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-h3 text-neutral-900">{title}</h2>
      <p className="mt-1 max-w-md text-body text-neutral-500">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" /> Réessayer
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}
