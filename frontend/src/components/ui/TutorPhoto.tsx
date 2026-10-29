import clsx from 'clsx'
import { Check } from 'lucide-react'
import { useState } from 'react'

const initialsOf = (name: string) =>
  name
    .replace(/\./g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

type Props = {
  src: string
  name: string
  size: number
  verified?: boolean
  className?: string
}

/** Photo ronde du tuteur avec pastille verte « vérifié » ; repli sur les initiales si l'image échoue. */
export function TutorPhoto({ src, name, size, verified = true, className }: Props) {
  const [failed, setFailed] = useState(false)
  const badge = Math.max(16, Math.round(size * 0.27))
  return (
    <div className={clsx('relative shrink-0', className)} style={{ width: size, height: size }}>
      {failed || !src ? (
        <div
          className="flex size-full items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700"
          style={{ fontSize: size * 0.34 }}
          aria-hidden="true"
        >
          {initialsOf(name)}
        </div>
      ) : (
        <img
          src={src}
          alt={`Photo de ${name}`}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full rounded-full bg-neutral-100 object-cover ring-1 ring-neutral-200"
        />
      )}
      {verified && (
        <span
          className="absolute right-0 bottom-0 flex items-center justify-center rounded-full border-2 border-white bg-success text-white"
          style={{ width: badge, height: badge }}
          title="Profil vérifié"
        >
          <Check strokeWidth={3.5} style={{ width: badge * 0.55, height: badge * 0.55 }} aria-hidden="true" />
          <span className="sr-only">Profil vérifié</span>
        </span>
      )}
    </div>
  )
}
