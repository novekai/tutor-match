# Architecture — Tutor Match (prototype)

Prototype de matching élève ↔ tuteur avec réservation automatique, conforme au cahier des charges « Test technique de recrutement » (React + Vite, Laravel 10+, PostgreSQL, REST/JSON, Tailwind).

## 1. Exigences qui structurent l'architecture

| # | Exigence (source : cahier des charges) | Conséquence d'architecture |
|---|---|---|
| E1 | Matching **côté serveur** sur données persistantes (§4.E) | Algorithme dans Laravel, jamais dans le front |
| E2 | Critères obligatoires appliqués **avant** le classement (§4.B) | Pipeline en 2 temps : filtres SQL stricts → scoring |
| E3 | Scoring « cohérent, compréhensible, facilement évolutif » (§4.B) | Un critère = une classe, poids dans `config/matching.php` |
| E4 | Un créneau réservé n'est plus proposé (§4.D) | Contrainte d'exclusion PostgreSQL anti-chevauchement + 409 côté API |
| E5 | Aucune intervention admin (§1, §4.D) | Réservation confirmée dans la même transaction |
| E6 | UI/UX = 40 % de la note, responsive, fluide (§5, §8) | SPA React, design tokens Tailwind, parcours en 1 page / 3 étapes |
| E7 | Prototype en 2 h (§6) | Monolithe simple, pas d'auth, pas de file de messages |

## 2. Vue d'ensemble (déploiement sur le VPS Hostinger)

```
Navigateur (mobile / desktop)
        │ HTTPS
        ▼
┌──────────────────────── VPS ────────────────────────┐
│ Nginx                                                │
│  ├─ /        → frontend/dist (build statique Vite)   │
│  └─ /api/*   → PHP-FPM → Laravel (backend/public)    │
│                         │                            │
│                         ▼                            │
│                   PostgreSQL 16                      │
└──────────────────────────────────────────────────────┘
```

Même origine pour le front et l'API : pas de CORS en production, une seule configuration TLS.

## 3. Dépôt (monorepo)

```
tutor-match/
├── backend/                 Laravel (API REST uniquement)
│   ├── app/
│   │   ├── Http/Controllers/Api/   MetaController, MatchController,
│   │   │                           TutorController, BookingController
│   │   ├── Http/Requests/          MatchRequest, StoreBookingRequest
│   │   ├── Http/Resources/         TutorMatchResource, BookingResource…
│   │   ├── Models/                 Tutor, Subject, Level, Availability, Booking
│   │   └── Matching/
│   │       ├── MatchingService.php      filtres stricts + agrégation
│   │       ├── SlotGenerator.php        dispo hebdo → créneaux datés libres
│   │       └── Criteria/                un fichier par critère de score
│   ├── config/matching.php          poids des critères, horizon, durée cours
│   ├── database/migrations, seeders (≥ 10 tuteurs, photos, avis)
│   └── tests/Feature                matching + réservation + concurrence
├── frontend/                React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── api/                client fetch typé + hooks TanStack Query
│       ├── features/search/    formulaire (niveau, matière, créneaux)
│       ├── features/results/   cartes tuteurs, score, créneaux
│       ├── features/booking/   panneau de réservation + confirmation
│       └── ui/                 composants de base (Button, Chip, Card…)
├── deploy/                  config Nginx, script de déploiement
└── docs/                    ce document, PLAN.md, décisions
```

## 4. Modèle de données

```
levels (id, slug, name, cycle, rank)          ex. 6e…Tle, cycle = college|lycee
subjects (id, slug, name, icon)
tutors (id, first_name, photo_url, headline, bio,
        years_experience, rating_avg, reviews_count, lessons_count)
tutor_teachings (tutor_id, subject_id, level_min_rank, level_max_rank)
        → « maths de la 6e à la 1re » en une ligne ; compatibilité = rank dans l'intervalle
availabilities (tutor_id, weekday 1-7, start_time, end_time)   récurrent hebdomadaire
bookings (id, reference, tutor_id, subject_id, level_id,
          child_first_name, parent_name, parent_email, notes,
          starts_at, ends_at, status, created_at)
        EXCLUDE USING gist (tutor_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
        WHERE status = 'confirmed'
```

Les créneaux réservables sont **calculés** (disponibilités hebdo × 14 jours, découpées en cours d'1 h, moins les réservations confirmées) : pas de table de créneaux à maintenir, et la contrainte d'exclusion garantit qu'aucune double réservation n'est possible même avec deux requêtes simultanées.

## 5. Algorithme de matching

**Étape 1 — filtres obligatoires (SQL)**
1. Le tuteur enseigne la matière demandée.
2. Le niveau de l'élève est dans l'intervalle enseigné pour cette matière.
3. Le tuteur a au moins un créneau **libre** dans les plages choisies par le parent (jour × moment : matin / après-midi / soir) sur les 14 prochains jours.

**Étape 2 — score sur 100 (pondération additive)**

| Critère | Calcul (0 → 1) | Poids par défaut |
|---|---|---|
| Disponibilité | créneaux libres compatibles, plafonné à 6 | 30 |
| Évaluations | moyenne bayésienne (évite qu'un 5/5 sur 1 avis passe devant 4,8/5 sur 80) | 30 |
| Expérience | années, plafonné à 10 | 20 |
| Cours réalisés | `log(1+n)/log(1+500)` | 10 |
| Spécialisation niveau | 1 si le niveau est au cœur de l'intervalle enseigné, dégressif aux bords | 10 |

Chaque critère implémente `Criterion::score(Tutor, MatchQuery): float`. Ajouter ou repondérer un critère = une classe + une ligne de config. L'API renvoie le détail du score : le front affiche « Pourquoi ce tuteur ? » (initiative UX : le classement devient explicable). Égalités départagées par la note puis le nombre de cours.

## 6. API REST (JSON)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/meta` | niveaux, matières, moments de la journée (alimente le formulaire) |
| POST | `/api/match` | `{level, subject, availability:[{day, period}]}` → tuteurs classés + score + créneaux compatibles |
| GET | `/api/tutors/{id}` | profil complet |
| GET | `/api/tutors/{id}/slots` | créneaux libres (14 j) |
| POST | `/api/bookings` | crée la réservation ; **409** si le créneau vient d'être pris |
| GET | `/api/bookings/{reference}` | récapitulatif de confirmation |

Validation via FormRequest (422 avec messages en français). Throttle sur `POST /api/bookings`.

## 7. Front-end — parcours

Une seule page, trois temps, sans rechargement :

1. **Besoin** — niveau (chips groupées collège / lycée), matière (chips avec icônes), créneaux (grille 7 jours × 3 moments, sélection au doigt). Bouton actif dès que les 3 champs obligatoires sont remplis.
2. **Tuteurs** — cartes classées, badge « Meilleur choix » sur le premier, pourcentage de pertinence + détail, prochains créneaux compatibles cliquables directement sur la carte (réservation en 2 clics).
3. **Réservation** — panneau latéral (bottom sheet sur mobile) : récap du créneau, prénom de l'enfant, nom + email du parent → confirmation animée avec référence.

Choix techniques : TanStack Query (cache, états de chargement, retry), squelettes de chargement, Framer Motion pour les transitions, état du formulaire dans l'URL (partage / retour arrière), accessibilité clavier. **La maquette graphique fournie sera appliquée via les design tokens Tailwind** (couleurs, typo, rayons, ombres) et les composants `ui/`.

## 8. Décisions et alternatives rejetées

| Décision | Alternatives rejetées et raison |
|---|---|
| Créneaux calculés + contrainte d'exclusion | Table de slots pré-générés : à régénérer, risques d'incohérence |
| Moments de la journée (matin/aprem/soir) côté parent | Saisie d'heures précises : formulaire plus long, contraire à §5 |
| Pondération additive configurable | ML / embeddings : non explicable, hors délai |
| Pas d'authentification | Hors périmètre (§6) ; identité parent saisie au moment de réserver |
| Monolithe Laravel + SPA même domaine | Front sur Vercel : 2 origines (CORS), contrainte d'auteur git Vercel |
