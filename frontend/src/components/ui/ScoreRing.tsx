import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'

type Props = { score: number; size?: number; stroke?: number }

/** Anneau de compatibilité animé (primary-500 sur neutral-100). */
export function ScoreRing({ score, size = 76, stroke = 6 }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const value = Math.max(0, Math.min(100, score))
  const progress = useMotionValue(0)
  const offset = useTransform(progress, (v) => c * (1 - v / 100))
  const text = useTransform(progress, (v) => `${Math.round(v)}%`)

  useEffect(() => {
    const controls = animate(progress, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 })
    return () => controls.stop()
  }, [progress, value])

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Compatibilité ${value} %`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-neutral-100)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <motion.span className="tabular absolute inset-0 flex items-center justify-center text-h3 font-bold text-neutral-900" aria-hidden="true">
        {text}
      </motion.span>
    </div>
  )
}
