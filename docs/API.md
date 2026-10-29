# Contrat d’API — Tutor Match (source de vérité front ↔ back)

Base : `/api` (même origine que le front). JSON, clés en **camelCase**. Dates ISO 8601 avec décalage, fuseau **Europe/Paris**. Erreurs : 422 `{message, errors:{champ:[...]}}` (messages en français), 404 `{message}`, 409 voir réservation.

## Référentiels
- Niveaux (rank) : CP 1, CE1 2, CE2 3, CM1 4, CM2 5 (cycle `primaire`) · 6e 6, 5e 7, 4e 8, 3e 9 (`college`) · 2nde 10, 1re 11, Terminale 12 (`lycee`).
- Matières (slug) : `mathematiques` (Algèbre & Géométrie, icon `calculator`), `francais` (Orthographe, Méthode, `book-open`), `anglais` (Grammaire, Oral, `languages`), `physique-chimie` (Formules & Démarche, `flask-conical`), `svt` (Biologie & Terre, `leaf`), `histoire-geo` (Chronologie & Cartes, `compass`).
- Jours : 1 = lundi … 7 = dimanche. Moments (`period`) : `matin` 9h–12h, `apres-midi` 14h–18h, `soir` 18h–20h. Un créneau appartient au moment qui contient son heure de début.
- Cours : durée 90 min (`lessonMinutes`), créneaux proposés toutes les 30 min dans les disponibilités hebdomadaires du tuteur, sur un horizon de 28 jours à partir de maintenant + 2 h, hors réservations confirmées (aucun chevauchement).

## Types
```ts
type Level   = { slug: string; name: string; cycle: "primaire"|"college"|"lycee"; cycleLabel: string; rank: number }
type Subject = { slug: string; name: string; hint: string; icon: string }
type Availability = { day: 1|2|3|4|5|6|7; period: "matin"|"apres-midi"|"soir" }
type Slot = {
  startsAt: string; endsAt: string;          // "2026-11-04T14:00:00+01:00"
  day: number; period: string;
  label: string;                             // "Mer. 4 nov · 14h00"
  timeLabel: string;                         // "14h00 – 15h30"
  matchesAvailability: boolean               // dans les créneaux cochés par le parent (point bleu)
}
type TutorSummary = {
  id: number; displayName: string;          // "Camille B."
  firstName: string; photoUrl: string;
  credential: string;                        // "Enseignante certifiée" (badge vert)
  school: string;                            // "ENS Lyon"
  headline: string;                          // 1 phrase pour la carte
  rating: number; reviewsCount: number; yearsExperience: number; lessonsCount: number;
  responseRate: number;                      // 100
  hourlyRate: number;                        // 38 (€ / h)
  lessonMinutes: number;                     // 90
  levelsLabel: string;                       // "Collège · Lycée"
  subjects: { slug: string; name: string; isMajor: boolean }[];
}
type TutorMatch = TutorSummary & {
  score: number;                             // 0–100 entier, affiché "96%"
  isBestMatch: boolean;                      // true pour le 1er
  scoreBreakdown: { key: string; label: string; points: number; max: number }[];
  matchReasons: string[];                    // ["3 créneaux communs", "Spécialiste 4e"]
  compatibleSlotsCount: number;
  compatibleSlots: Slot[];                   // 3 premiers créneaux compatibles, triés par date
}
type TutorDetail = TutorSummary & {
  bio: string; tags: { emoji: string; label: string }[];
  score?: number; matchReasons?: string[]
}
type Booking = {
  reference: string;                         // "STU-2481"
  status: "confirmed";
  startsAt: string; endsAt: string;
  dateLabel: string;                         // "Mercredi 5 novembre · 14h00 – 15h30"
  shortDateLabel: string;                    // "Mer. 5 nov. · 14h00 – 15h30"
  timezone: "Europe/Paris"; durationLabel: string;  // "1h30"
  tutor: { id: number; displayName: string; firstName: string; photoUrl: string; credential: string; school: string; rating: number };
  subject: Subject; level: Level;
  childFirstName: string; parentName: string; parentEmail: string;
  smsReminder: boolean; objective: string | null; createdAt: string
}
type Suggestion = { day: number; period: string; label: string;  // "mercredi matin"
  tutorsCount: number; initials: string[] }                      // ["CL","MR","SD"]
```

## Endpoints
| Méthode | Route | Entrée | Sortie |
|---|---|---|---|
| GET | `/api/meta` | — | `{ levels: Level[], subjects: Subject[], periods: {slug,name,range}[], days: {value,short,name}[], tutorsCount: number }` |
| POST | `/api/match` | `{ level: slug, subject: slug, availability: Availability[] (1..21), objective?: string ≤ 500 }` | `{ query: {level: Level, subject: Subject, availability: Availability[]}, total: number, tutors: TutorMatch[], suggestions: Suggestion[] }` |
| GET | `/api/tutors/{id}` | query optionnelle `level, subject, availability=3:apres-midi,6:matin` | `TutorDetail` |
| GET | `/api/tutors/{id}/slots` | `week=YYYY-MM-DD` (lundi ; défaut semaine courante), `availability=...` | `{ weekStart, weekEnd, label: "Semaine du 3 au 9 novembre 2026", previousWeek: string|null, nextWeek: string|null, days: { date, label: "Mardi 4 novembre", slots: Slot[] }[] }` (7 jours, `slots` vide si rien) |
| POST | `/api/bookings` | `{ tutorId, level, subject, startsAt, childFirstName, parentName, parentEmail, smsReminder?: bool, objective?: string }` | **201** `Booking` · **409** `{ message: "Ce créneau vient d’être réservé.", code: "slot_taken", alternatives: Slot[] (≤3) }` · 422 |
| GET | `/api/bookings/{reference}` | — | `Booking` |
| GET | `/api/bookings/{reference}/ics` | — | `text/calendar` (bouton « Ajouter à mon agenda ») |

`suggestions` : rempli quand `total < 3`. Pour chaque couple (jour, moment) **non** sélectionné, nombre de tuteurs qui deviendraient compatibles en l’ajoutant ; trié décroissant, 4 maximum, `tutorsCount > 0`.

Règles de matching : voir `docs/ARCHITECTURE.md §5` (filtres obligatoires matière + niveau dans l’intervalle enseigné + ≥ 1 créneau libre compatible, puis score pondéré configurable dans `config/matching.php`).
