# Plan de développement — Tutor Match

Méthode : procédure NovekAI (dépôt `methode-de-developpement-novekai`, v1.1), **adaptée au prototype** (principe 8 : formalisme proportionné à l'enjeu). Cycle de vie **incrémental court** : un incrément = une tranche verticale testable. Budget cible : 2 h de développement effectif.

| Partie de la procédure | Ce qui est retenu pour ce prototype |
|---|---|
| 1. Concept | Énoncé du problème = cahier des charges §1-2 |
| 3. Exigences | Récits utilisateurs + critères d'acceptation ci-dessous |
| 4. Architecture | `docs/ARCHITECTURE.md` (décisions + alternatives rejetées) |
| 6. Construction | Tests de fonctionnalité Laravel sur matching et réservation, revue du code généré par IA |
| 7. Livraison | Déploiement VPS, README, vidéo de démo |

## Récits utilisateurs et critères d'acceptation

- **US1 — Décrire le besoin.** En tant que parent, je renseigne niveau, matière et créneaux en moins de 30 s.
  *Étant donné* le formulaire, *quand* les 3 champs sont remplis, *alors* le bouton « Voir les tuteurs » s'active.
- **US2 — Voir les tuteurs compatibles.** *Étant donné* une demande, *alors* seuls les tuteurs qui enseignent la matière, au niveau, et ont un créneau libre dans mes plages sont affichés, du plus au moins pertinent ; un état vide utile s'affiche sinon (suggestion d'élargir les créneaux).
- **US3 — Réserver.** *Quand* je choisis un créneau et confirme, *alors* la réservation est enregistrée, une confirmation avec référence s'affiche, et ce créneau n'est plus proposé.
- **US4 — Conflit.** *Étant donné* deux parents sur le même créneau, *alors* le second reçoit un message clair et d'autres créneaux lui sont proposés (HTTP 409).

## Étapes

| # | Étape | Livrable vérifiable | Dépend de |
|---|---|---|---|
| 0 | Cadrage : analyse CdC + méthode, architecture, plan, dépôt GitHub privé | ce document, `ARCHITECTURE.md`, `novekai/tutor-match` | — |
| 1 | Préparer le VPS : PHP 8.4 + extensions, Composer, PostgreSQL 16, Nginx, Node 20, clé de déploiement GitHub | `php -v`, `psql` OK, Nginx répond | accès SSH |
| 2 | Squelette backend Laravel + connexion PostgreSQL + pipeline CI (GitHub Actions : tests sur Postgres) | `php artisan test` vert en CI | 1 |
| 3 | Modèle de données : migrations (dont contrainte d'exclusion), modèles Eloquent, seeders (12 tuteurs variés, photos, notes) | `migrate:fresh --seed` OK | 2 |
| 4 | Matching : `SlotGenerator`, filtres stricts, critères de score, `POST /api/match` + tests | tests matching verts | 3 |
| 5 | Réservation : `POST /api/bookings` transactionnel, 409 sur conflit, `GET /api/tutors/{id}/slots` + tests | tests réservation/concurrence verts | 4 |
| 6 | Squelette frontend React + Vite + TS + Tailwind, client API, design tokens (provisoires en attendant la maquette) | page servie, `/api/meta` affiché | 2 |
| 7 | Écran Besoin (US1) | formulaire responsive | 6 |
| 8 | Écran Tuteurs (US2) : cartes, score expliqué, squelettes, état vide | parcours jusqu'aux résultats | 4, 7 |
| 9 | Réservation + confirmation (US3, US4) | parcours complet de bout en bout | 5, 8 |
| 10 | **Application de la maquette** : tokens, typo, composants, passe responsive mobile | rendu conforme maquette sur 375 px et 1440 px | maquette, 9 |
| 11 | Déploiement VPS : Nginx (front statique + `/api`), HTTPS (certbot si domaine), script `deploy/deploy.sh` | URL de démo fonctionnelle | 1, 9 |
| 12 | Recette : test de fumée du parcours, Lighthouse mobile, README (installation, lancement, choix techniques) | README + checklist cochée | 11 |
| 13 | Vidéo de démonstration 2-3 min (réalisée par vous) | vidéo | 12 |

Ordre retenu : backend d'abord (25 % de la note et non négociable : « un design esthétique ne compensera pas l'absence de matching réel »), puis front, puis maquette dès réception, sans bloquer les étapes 2 à 9.

## Risques

| Risque | Parade |
|---|---|
| Maquette reçue tard | Tokens Tailwind centralisés ; composants `ui/` isolés → repasse visuelle rapide |
| Dépassement des 2 h | Périmètre minimal d'abord (US1-US3), US4 et explication du score ensuite |
| VPS : versions PHP/Postgres incompatibles | Dépôt ondrej/php et dépôt officiel PostgreSQL (PGDG) |
| Double réservation concurrente | Contrainte d'exclusion PostgreSQL, pas seulement un contrôle applicatif |
