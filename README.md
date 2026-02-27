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
- **Auth**: JWT via `jose` (Edge-compatible), HttpOnly cookie; optional OIDC/SSO (Keycloak-compatible)
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

# 3. Start development server
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
| `OIDC_ISSUER` | OIDC provider issuer URL (realm base URL for Keycloak) | — |
| `OIDC_CLIENT_ID` | Client ID registered in the OIDC provider | — |
| `OIDC_CLIENT_SECRET` | Client secret (use a confidential client) | — |
| `OIDC_REDIRECT_URI` | Absolute URL of the callback endpoint | — |
| `OIDC_ADMIN_GROUP` | Group name that grants admin access (optional — omit to allow any authenticated OIDC user) | — |
| `OIDC_SCOPES` | Space-separated scopes to request | `openid profile email groups` |

Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

## OIDC / SSO Authentication (Keycloak)

Palantir supports single sign-on via any standard OIDC provider, including Keycloak. When the four required `OIDC_*` variables are set, a **Sign in with SSO** button appears on the login page alongside the local credentials form.

### How it works

1. The user clicks **Sign in with SSO** on the login page.
2. Palantir redirects to `/api/auth/oidc/login`, which builds an authorization URL with a CSRF `state` parameter and redirects to the provider.
3. After the user authenticates, the provider redirects back to `/api/auth/oidc/callback`.
4. Palantir validates the `state`, exchanges the authorization code for tokens, verifies the ID token signature against the provider's JWKS, and extracts the user's `groups` claim.
5. A `palantir_token` session cookie (JWT, 8-hour TTL, HttpOnly) is issued and the user is redirected to the page they came from.

### Keycloak setup

#### 1. Create a realm

In the Keycloak Admin Console, create a dedicated realm (e.g. `my-realm`) or reuse an existing one.

#### 2. Create a client

1. Navigate to **Clients → Create client**.
2. Set **Client ID** to `palantir` (or any name — this becomes `OIDC_CLIENT_ID`).
3. Set **Client type** to **OpenID Connect**.
4. Enable **Client authentication** (confidential client).
5. Under **Valid redirect URIs**, add your callback URL:
   ```
   https://palantir.example.com/api/auth/oidc/callback
   ```
6. Save the client and copy the **Client secret** from the **Credentials** tab.

#### 3. Expose the `groups` claim

To support group-based admin access (`OIDC_ADMIN_GROUP`) or team visibility:

1. Go to **Client scopes → Create client scope**.
2. Name it `groups`, set type to **Default**, and save.
3. Inside the new scope, go to **Mappers → Add mapper → By configuration → Group Membership**.
4. Set **Token Claim Name** to `groups` and enable **Add to ID token**.
5. Back on your `palantir` client, go to **Client scopes** and add the `groups` scope.

#### 4. Configure environment variables

Add the following to your `.env`:

```dotenv
OIDC_ISSUER=https://keycloak.example.com/realms/my-realm
OIDC_CLIENT_ID=palantir
OIDC_CLIENT_SECRET=<client-secret-from-credentials-tab>
OIDC_REDIRECT_URI=https://palantir.example.com/api/auth/oidc/callback

# Optional — restrict admin access to a specific Keycloak group.
# Keycloak prefixes group names with a slash (e.g. /palantir-admins).
# Both "/palantir-admins" and "palantir-admins" are accepted.
OIDC_ADMIN_GROUP=palantir-admins

# Optional — defaults to "openid profile email groups"
OIDC_SCOPES=openid profile email groups
```

#### 5. Verify

Restart the application. The login page at `/login` (or `/admin/login`) should now show a **Sign in with SSO** button. Clicking it will redirect you through Keycloak and back.

> **Note:** The discovery document at `<OIDC_ISSUER>/.well-known/openid-configuration` is fetched at runtime and cached for 1 hour. New signing keys are picked up automatically after the cache expires. During a key rotation, there may be a short window (up to 1 hour) where tokens signed with the new key are rejected until the cache refreshes — plan maintenance windows accordingly.

### Team / group-based app visibility

Apps can be restricted to specific groups. Set the `teams` field on an app (via the admin UI or `apps.json`) to an array of group names returned by your OIDC provider:

```json
{
  "name": "Internal Metrics",
  "teams": ["platform-team", "sre"]
}
```

- Apps with an **empty** `teams` array are visible to everyone (including unauthenticated users).
- Leading slashes are stripped automatically, so `/platform-team` and `platform-team` are treated as the same group.
- Local users (created via the admin panel) can also be assigned to groups, which are matched against the `teams` field in the same way.

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
  "teams": [],
  "order": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Categories**: `CI/CD`, `Monitoring`, `Databases`, `Security`, `Messaging`, `Storage`, `Tracing`, `Code Quality`, `Registry`

**Icon slugs**: Find valid slugs at [simpleicons.org](https://simpleicons.org). The slug is used in `https://cdn.simpleicons.org/<slug>`.

**`teams`**: Array of group/team names. Apps with an empty array are visible to all users. When using OIDC, these names are matched against the `groups` claim from your identity provider (leading slashes stripped). When using local accounts, they are matched against the groups assigned to each user.

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
| `POST` | `/api/auth` | — | Login with email/password, set cookie |
| `DELETE` | `/api/auth` | — | Logout, clear cookie |
| `GET` | `/api/auth/oidc/login` | — | Initiate OIDC authorization flow |
| `GET` | `/api/auth/oidc/callback` | — | OIDC callback — exchange code, set cookie |
| `GET` | `/api/apps` | — | List all apps |
| `POST` | `/api/apps` | ✓ | Create app |
| `GET` | `/api/apps/:id` | — | Get app |
| `PUT` | `/api/apps/:id` | ✓ | Update app |
| `DELETE` | `/api/apps/:id` | ✓ | Delete app |
| `PATCH` | `/api/apps/reorder` | ✓ | Bulk reorder by `{ ids: string[] }` |
| `POST` | `/api/apps/import` | ✓ | Bulk import `{ data, format }` |
| `GET` | `/api/users` | ✓ | List local users |
| `POST` | `/api/users` | ✓ | Create local user |
| `PUT` | `/api/users/:id` | ✓ | Update local user |
| `DELETE` | `/api/users/:id` | ✓ | Delete local user |
| `GET` | `/api/groups` | ✓ | List groups |
| `POST` | `/api/groups` | ✓ | Create group |
| `PUT` | `/api/groups/:id` | ✓ | Update group |
| `DELETE` | `/api/groups/:id` | ✓ | Delete group |

## Status Ping Notes

The green/red dot on each card uses a `HEAD` request with `mode: no-cors` to check reachability. Due to browser CORS restrictions, this is a best-effort indicator. For accurate health checks, configure a `healthCheckUrl` that returns a CORS-friendly response.
