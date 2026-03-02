# GitHub Copilot Instructions — Palantir

## Project Overview

Palantir is a dark, terminal-inspired internal developer platform (IDP) dashboard built with **Next.js 14 App Router**. It serves as a central hub for discovering and accessing internal tools and services. Think of it as an app catalog with admin management, authentication, and team-based visibility.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI**: React 18, Tailwind CSS v3, Framer Motion (animations)
- **State Management**: Zustand with `persist` middleware
- **Auth**: `jose` (Edge-compatible JWT, HttpOnly cookies); optional OIDC/SSO via any standard provider (Keycloak-compatible)
- **Data Store**: JSON file (`data/apps.json`) with atomic writes; users in `data/users.json`
- **Icons**: Simple Icons CDN (`https://cdn.simpleicons.org/<slug>`)
- **Fonts**: JetBrains Mono + Inter via `next/font/google`
- **Drag-and-Drop**: `@dnd-kit` for admin reordering
- **Utilities**: `papaparse` (CSV), `uuid`, `clsx` + `tailwind-merge` (via `cn()`)

## Repository Structure

```
src/
  app/                  # Next.js App Router pages and API routes
    api/                # REST API routes (apps, auth, groups, icons, users)
    admin/              # Admin panel pages (/admin, /admin/login)
    login/              # Catalog login page
    page.tsx            # Main catalog page
  components/
    admin/              # Admin UI components (AppForm, BulkImport, etc.)
    catalog/            # Catalog UI (AppCard, AppGrid, CategoryFilter, SearchBar)
    providers/          # ThemeProvider, ToastProvider
    ui/                 # Shared UI (Header, Modal, Logo, GlassCard, etc.)
  hooks/                # Custom React hooks
  lib/                  # Core utilities: auth.ts, db.ts, csv.ts, oidc.ts, password.ts
  store/                # Zustand stores: useAppStore, useFavoritesStore, useStatusStore
  types/                # TypeScript types: app.ts, user.ts, api.ts
  middleware.ts         # Edge middleware for auth on / and /admin/*
data/
  apps.json             # App catalog data (source of truth)
  icons/                # Locally cached/custom icons
helm/palantir/          # Helm chart for Kubernetes deployment
```

## Core Data Model

```typescript
// App — defined in src/types/app.ts
interface App {
  id: string           // UUID
  name: string
  url: string
  description: string
  category: Category   // one of CATEGORIES constant
  iconSlug: string     // Simple Icons slug
  customLogoUrl: string | null
  accentColor: string  // hex color, default '#00e5ff'
  healthCheckUrl: string | null
  teams: string[]      // empty = visible to all; non-empty = restrict to these groups
  order: number        // display order
  createdAt: string    // ISO date string
}

type Category = 'CI/CD' | 'Monitoring' | 'Databases' | 'Security' | 'Messaging' | 'Storage' | 'Tracing' | 'Code Quality' | 'Registry'
```

## Authentication & Authorization

- The main cookie is `palantir_token` — an HS256 JWT signed with `JWT_SECRET`, 8-hour TTL.
- **Local auth**: email/password via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars (for admin) or per-user records in `data/users.json`.
- **OIDC/SSO**: Enabled when `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and `OIDC_REDIRECT_URI` are set. Groups claim is used for `OIDC_ADMIN_GROUP` matching and team-based app visibility.
- **Middleware** (`src/middleware.ts`): Protects `/` and `/admin/*`. Admin paths redirect to `/admin/login`; catalog paths redirect to `/login`.
- JWT helpers live in `src/lib/auth.ts` (`signToken`, `verifyToken`); OIDC logic in `src/lib/oidc.ts`.

## API Routes

All write endpoints require a valid `palantir_token` cookie. Auth is checked server-side in each route handler.

| Route | Methods |
|---|---|
| `/api/auth` | POST (login), DELETE (logout) |
| `/api/auth/oidc/login` | GET (initiate OIDC flow) |
| `/api/auth/oidc/callback` | GET (exchange code, set cookie) |
| `/api/apps` | GET (list), POST (create) |
| `/api/apps/[id]` | GET, PUT, DELETE |
| `/api/apps/reorder` | PATCH (`{ ids: string[] }`) |
| `/api/apps/import` | POST (`{ data, format: 'json' \| 'csv' }`) |
| `/api/users` | GET, POST |
| `/api/users/[id]` | PUT, DELETE |
| `/api/groups` | GET, POST |
| `/api/groups/[id]` | PUT, DELETE |
| `/api/icons/[slug]` | GET (proxy/serve icon) |

## Data Persistence

- `src/lib/db.ts` handles all reads and writes.
- Writes are **atomic**: write to `<file>.tmp` then `rename()` to prevent corruption.
- `readApps()` returns apps sorted by `order` field.
- The data file path is controlled by `DATA_FILE_PATH` env var (default: `./data/apps.json`).
- Users data path: `USERS_FILE_PATH` (default: `./data/users.json`).

## Coding Conventions

- **TypeScript** throughout — avoid `any`; use types from `src/types/`.
- **Path alias**: `@/` maps to `src/` (configured in `tsconfig.json`).
- **CSS**: Tailwind utility classes only; use `cn()` from `src/lib/cn.ts` (wraps `clsx` + `tailwind-merge`) for conditional class merging.
- **`'use client'`** directive: Add to components that use browser APIs, hooks, or event handlers. Keep API route handlers and data-fetching logic server-side.
- **Server Components** are the default in App Router — avoid unnecessary client boundaries.
- **Framer Motion**: Used for card entrance animations and UI transitions. Prefer `motion` variants with `AnimatePresence` for mount/unmount transitions.
- **Error handling in API routes**: Return `NextResponse.json({ error: '...' }, { status: NNN })` with appropriate HTTP status codes.
- **No ORM / no database**: All persistence is via JSON file I/O in `src/lib/db.ts`. Do not introduce a database layer without explicit instruction.

## State Management (Zustand)

- `useAppStore`: Catalog apps, search query, active category filter, loading state, derived `filteredApps()`.
- `useFavoritesStore`: Starred app IDs, persisted to localStorage.
- `useStatusStore`: Service reachability status from HEAD pings.
- Stores use Zustand's `persist` middleware for localStorage-backed stores.

## Environment Variables

| Variable | Purpose |
|---|---|
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `DATA_FILE_PATH` | Path to apps JSON (default `./data/apps.json`) |
| `OIDC_ISSUER` | OIDC provider issuer URL |
| `OIDC_CLIENT_ID` | OIDC client ID |
| `OIDC_CLIENT_SECRET` | OIDC client secret |
| `OIDC_REDIRECT_URI` | Absolute callback URL |
| `OIDC_ADMIN_GROUP` | Group name granting admin access |
| `OIDC_SCOPES` | Space-separated scopes (default: `openid profile email groups`) |

## Team-Based App Visibility

- An app's `teams` array lists the group names that can see it.
- Empty `teams` = visible to everyone (including unauthenticated users if catalog login is not enforced).
- Leading slashes in group names are stripped automatically (e.g. `/platform-team` → `platform-team`).
- OIDC groups come from the `groups` claim in the ID token; local users have groups assigned in `data/users.json`.

## Status Ping

- Each app card pings its URL (or `healthCheckUrl` if set) with a `HEAD` / `no-cors` fetch.
- This is best-effort; CORS restrictions may cause false negatives. Advise users to set `healthCheckUrl` pointing to a CORS-friendly endpoint for accurate results.

## Deployment

- **Docker**: `Dockerfile` + `docker-compose.yml` present; `data/` is mounted as a volume.
- **Kubernetes / Helm**: Chart at `helm/palantir/`. Key values: `image.repository`, `env.adminEmail`, `env.adminPassword`, `env.jwtSecret`, `persistence.enabled`, `ingress.enabled`.

## Common Patterns

### Adding a new API route

1. Create `src/app/api/<resource>/route.ts` (and `[id]/route.ts` for item-level ops).
2. For protected routes, verify the JWT cookie at the top of each handler:
   ```typescript
   import { verifyToken } from '@/lib/auth'
   import { cookies } from 'next/headers'

   const token = cookies().get('palantir_token')?.value
   if (!token || !(await verifyToken(token))) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```
3. Return `NextResponse.json(...)` with appropriate status codes.

### Adding a new App field

1. Add the field to `App` / `AppCreateInput` in `src/types/app.ts`.
2. Update `AppForm.tsx` in `src/components/admin/` to include the field in the form.
3. Update `AppCard.tsx` if it affects display.
4. Update CSV import/export logic in `src/lib/csv.ts` and `src/lib/export.ts` if applicable.

### Adding a new category

Add the string to the `CATEGORIES` array in `src/types/app.ts`. It will automatically appear in the category filter and app form dropdowns.
