# Palantir — Developer Platform Dashboard

A dark, terminal-inspired internal developer platform dashboard. A central hub for discovering and accessing all internal tools and services without memorizing URLs.

## Features

- **App Catalog** — Card-based grid of all registered services with search, category filters, and staggered entrance animations
- **Favorites** — Star/pin apps to float them to the top (persisted in localStorage)
- **Recently Visited** — Last 5 opened services shown at the top
- **Status Indicators** — Green/red ping dots showing service reachability
- **Copy URL** — One-click clipboard copy for any service URL
- **Dark/Light Mode** — Toggle persisted in localStorage
- **Keyboard Navigation** — Press `/` to focus search, `Escape` to clear
- **Admin Panel** — Create, edit, delete and reorder apps at `/admin`
- **Bulk Import** — Paste JSON or CSV to import many apps at once
- **Export** — Download the full app catalog as JSON

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS v3, Framer Motion
- **State**: Zustand with `persist` middleware
- **Auth**: JWT via `jose` (Edge-compatible), HttpOnly cookie
- **Data**: JSON file store (`data/apps.json`) with atomic writes
- **Icons**: [Simple Icons CDN](https://cdn.simpleicons.org)
- **Fonts**: JetBrains Mono + Inter (via `next/font/google`)
- **DnD**: `@dnd-kit` for admin drag-and-drop reorder

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set ADMIN_EMAIL, ADMIN_PASSWORD, and a strong JWT_SECRET

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the catalog.

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)
Login: use the credentials from your `.env`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin login password | `changeme` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | dev-only default |
| `DATA_FILE_PATH` | Path to apps JSON file | `./data/apps.json` |

Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

## Deploying with Docker

```bash
# Build and run with Docker Compose
cp .env.example .env
# Edit .env with production values

docker-compose up -d
```

The `data/` directory is mounted as a volume so your app catalog persists across container restarts.

For standalone Docker builds, set `DOCKER_OUTPUT=1` during `npm run build`.

## Data Model

```json
{
  "id": "uuid",
  "name": "GitLab",
  "url": "https://gitlab.internal.company.com",
  "description": "Source code management and CI/CD pipelines",
  "category": "CI/CD",
  "iconSlug": "gitlab",
  "customLogoUrl": null,
  "accentColor": "#e24329",
  "healthCheckUrl": null,
  "order": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Categories**: `CI/CD`, `Monitoring`, `Databases`, `Security`, `Messaging`, `Storage`, `Tracing`, `Code Quality`, `Registry`

**Icon slugs**: Find valid slugs at [simpleicons.org](https://simpleicons.org). The slug is used in `https://cdn.simpleicons.org/<slug>`.

## Bulk Import

In the admin panel under the **Bulk Import** tab, paste JSON or CSV.

**JSON format:**
```json
[
  {
    "name": "My Service",
    "url": "https://service.internal.company.com",
    "description": "What it does",
    "category": "CI/CD",
    "iconSlug": "github",
    "accentColor": "#24292e"
  }
]
```

**CSV format:**
```csv
name,url,description,category,iconSlug,accentColor
My Service,https://service.internal.com,What it does,CI/CD,github,#24292e
```

## API Reference

All write endpoints require admin authentication (cookie set on login).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth` | — | Login, set cookie |
| `DELETE` | `/api/auth` | — | Logout, clear cookie |
| `GET` | `/api/apps` | — | List all apps |
| `POST` | `/api/apps` | ✓ | Create app |
| `GET` | `/api/apps/:id` | — | Get app |
| `PUT` | `/api/apps/:id` | ✓ | Update app |
| `DELETE` | `/api/apps/:id` | ✓ | Delete app |
| `PATCH` | `/api/apps/reorder` | ✓ | Bulk reorder by `{ ids: string[] }` |
| `POST` | `/api/apps/import` | ✓ | Bulk import `{ data, format }` |

## Status Ping Notes

The green/red dot on each card uses a `HEAD` request with `mode: no-cors` to check reachability. Due to browser CORS restrictions, this is a best-effort indicator. For accurate health checks, configure a `healthCheckUrl` that returns a CORS-friendly response.
