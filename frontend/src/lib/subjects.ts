/** Icône (nom Lucide de l'API) d'une matière d'après son slug — utile quand seul le slug est connu. */
const SLUG_ICON: Record<string, string> = {
  mathematiques: 'calculator',
  francais: 'book-open',
  anglais: 'languages',
  'physique-chimie': 'flask-conical',
  svt: 'leaf',
  'histoire-geo': 'compass',
}

export const iconForSubjectSlug = (slug: string) => SLUG_ICON[slug] ?? 'graduation-cap'
