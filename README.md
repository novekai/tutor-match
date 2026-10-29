# Tutor Match

Prototype de matching intelligent entre élèves et tuteurs, avec réservation automatique d'un créneau (test technique Studena).

- **Démo** : https://tutor-match.187-124-218-227.sslip.io
- **Maquette** : [Figma](https://www.figma.com/design/CSYOqDBRGGyxVEBau1uDBR/Studena?node-id=3-2&t=dM7pvyuLZibVd71j-1) · sources dans [docs/maquette/](docs/maquette/)

## Stack

| Couche | Technologie |
|---|---|
| Interface | React 19, Vite, TypeScript, Tailwind CSS 4, TanStack Query, Framer Motion (`frontend/`) |
| API | Laravel 13, PHP 8.4, REST/JSON (`backend/`) |
| Base | PostgreSQL 16 |
| Exécution | Docker Compose, FrankenPHP |

## Installation

Seuls Docker et Git sont nécessaires.

```bash
git clone https://github.com/novekai/tutor-match.git && cd tutor-match
docker compose up -d --build
cp backend/.env.example backend/.env
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
docker run --rm -v "$PWD":/w -w /w/frontend node:22-alpine sh -c "npm ci && npm run build"
```

L'application est servie sur http://localhost:8090 (port réglable via `APP_PORT`). L'interface est compilée dans `backend/public` : une seule adresse sert l'interface et l'API (`/api`).

Tests de l'API : `docker compose exec app php artisan test`

## Documentation

- [Architecture et algorithme de matching](docs/ARCHITECTURE.md)
- [Plan de développement](docs/PLAN.md)
- [Contrat d'API](docs/API.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- Réglage des poids du score : `backend/config/matching.php`
- HTTPS derrière le Caddy d'un VPS : `docker-compose.caddy.yml`, `deploy/Caddyfile.snippet`
