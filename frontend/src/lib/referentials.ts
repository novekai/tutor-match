import type { Meta } from '../api/types'

/**
 * Référentiels du contrat d'API (docs/API.md §Référentiels).
 * Servent de données initiales le temps que /api/meta réponde : le formulaire
 * s'affiche immédiatement, jamais d'écran blanc.
 */
export const FALLBACK_META: Meta = {
  levels: [
    { slug: 'cp', name: 'CP', cycle: 'primaire', cycleLabel: 'Primaire', rank: 1 },
    { slug: 'ce1', name: 'CE1', cycle: 'primaire', cycleLabel: 'Primaire', rank: 2 },
    { slug: 'ce2', name: 'CE2', cycle: 'primaire', cycleLabel: 'Primaire', rank: 3 },
    { slug: 'cm1', name: 'CM1', cycle: 'primaire', cycleLabel: 'Primaire', rank: 4 },
    { slug: 'cm2', name: 'CM2', cycle: 'primaire', cycleLabel: 'Primaire', rank: 5 },
    { slug: '6e', name: '6e', cycle: 'college', cycleLabel: 'Collège', rank: 6 },
    { slug: '5e', name: '5e', cycle: 'college', cycleLabel: 'Collège', rank: 7 },
    { slug: '4e', name: '4e', cycle: 'college', cycleLabel: 'Collège', rank: 8 },
    { slug: '3e', name: '3e', cycle: 'college', cycleLabel: 'Collège', rank: 9 },
    { slug: '2nde', name: '2nde', cycle: 'lycee', cycleLabel: 'Lycée', rank: 10 },
    { slug: '1re', name: '1re', cycle: 'lycee', cycleLabel: 'Lycée', rank: 11 },
    { slug: 'terminale', name: 'Terminale', cycle: 'lycee', cycleLabel: 'Lycée', rank: 12 },
  ],
  subjects: [
    { slug: 'mathematiques', name: 'Mathématiques', hint: 'Algèbre & Géométrie', icon: 'calculator' },
    { slug: 'francais', name: 'Français', hint: 'Orthographe, Méthode', icon: 'book-open' },
    { slug: 'anglais', name: 'Anglais', hint: 'Grammaire, Oral', icon: 'languages' },
    { slug: 'physique-chimie', name: 'Physique-Chimie', hint: 'Formules & Démarche', icon: 'flask-conical' },
    { slug: 'svt', name: 'SVT', hint: 'Biologie & Terre', icon: 'leaf' },
    { slug: 'histoire-geo', name: 'Histoire-Géo', hint: 'Chronologie & Cartes', icon: 'compass' },
  ],
  periods: [
    { slug: 'matin', name: 'Matin', range: '9h–12h' },
    { slug: 'apres-midi', name: 'Après-midi', range: '14h–18h' },
    { slug: 'soir', name: 'Soir', range: '18h–20h' },
  ],
  days: [
    { value: 1, short: 'Lun', name: 'lundi' },
    { value: 2, short: 'Mar', name: 'mardi' },
    { value: 3, short: 'Mer', name: 'mercredi' },
    { value: 4, short: 'Jeu', name: 'jeudi' },
    { value: 5, short: 'Ven', name: 'vendredi' },
    { value: 6, short: 'Sam', name: 'samedi' },
    { value: 7, short: 'Dim', name: 'dimanche' },
  ],
  tutorsCount: 0,
}

export const CYCLES = [
  { cycle: 'primaire', label: 'Primaire' },
  { cycle: 'college', label: 'Collège' },
  { cycle: 'lycee', label: 'Lycée' },
] as const

const DAY_SHORT = ['', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']
const PERIOD_SHORT: Record<string, string> = { matin: 'matin', 'apres-midi': 'après-midi', soir: 'soir' }

/** "Mer. après-midi" — libellé court d'une disponibilité (chips de filtres). */
export const availabilityLabel = (day: number, period: string) => `${DAY_SHORT[day] ?? ''} ${PERIOD_SHORT[period] ?? period}`
