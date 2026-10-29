import { BookOpen, Calculator, Compass, FlaskConical, GraduationCap, Languages, Leaf, type LucideProps } from 'lucide-react'

const ICONS = {
  calculator: Calculator,
  'book-open': BookOpen,
  languages: Languages,
  'flask-conical': FlaskConical,
  leaf: Leaf,
  compass: Compass,
} as const

/** Icône Lucide d'une matière, d'après le champ `icon` de l'API (repli : chapeau de diplômé). */
export function SubjectIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? GraduationCap
  return <Icon aria-hidden="true" {...props} />
}
