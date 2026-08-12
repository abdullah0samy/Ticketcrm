# ABC Hospital — Systems Monorepo

> Maintained by **Khaled Ahmed — NuzulTech**.
> Four related systems for ABC Hospital: the production ticketing platform, the
> patient-relations (PR) service extracted out of it, a next-generation
> ticketing CRM, and a standalone patient-satisfaction application.

---

## Contents

1. [Systems at a glance](#1-systems-at-a-glance)
2. [Architecture and how the pieces connect](#2-architecture-and-how-the-pieces-connect)
3. [Shared infrastructure](#3-shared-infrastructure-postgresql--redis)
4. [Running locally](#4-running-locally)
5. [Running on a server](#5-running-on-a-server)
6. [Database wiring, per system](#6-database-wiring-per-system)
7. [What changed — engineering log](#7-what-changed--engineering-log)
8. [Security notes](#8-security-notes)
9. [Local demo accounts](#9-local-demo-accounts)

---

## 1. Systems at a glance

| # | System | Folder | Stack | Web | API | Database |
|---|--------|--------|-------|-----|-----|----------|
| 1 | **Production ticketing** | `abc-production/` | Django 5 + DRF + Channels · React 18 (CRA) | `:3001` | `:8000` | `abc` |
| 2 | **Patient Relations (PR)** | `pr-system/` | Django 5 + DRF · React 18 (CRA) | `:3002` | `:8001` | `abc` (shared) |
| 3 | **Ticketing CRM (next-gen)** | `ticket-crm/` | NestJS 10 + Prisma 6 · React 19 (Vite) | `:5173` | `:4000` | `abch_db` |
| 4 | **Patient satisfaction** | `abc-pr/` | Express 4 + TypeScript · React 19 (Vite) | `:3000` | `:3000` | `abcpr` |

`abc-production/ticket-front/` is the **original vendor frontend**, kept
unmodified as a baseline for diffing. The frontend actually in use is
`abc-production/ticket-front-current/`.

---

## 2. Architecture and how the pieces connect

```
                    ┌──────────────────────────────────────────┐
                    │  PostgreSQL :5445      Redis :9396       │
                    │  abc · abch_db · abcpr                   │
                    └────────┬─────────────────────┬───────────┘
                             │                     │
        ┌────────────────────┼─────────────┐       │
        │                    │             │       │
┌───────▼────────┐  ┌────────▼───────┐  ┌──▼───────▼──────┐  ┌──────────────┐
│ ticket-back    │  │ pr-system      │  │ ticket-crm      │  │ abc-pr       │
│ Django :8000   │  │ Django :8001   │  │ NestJS :4000    │  │ Express :3000│
│ db: abc        │  │ db: abc        │  │ db: abch_db     │  │ db: abcpr    │
└───────┬────────┘  └────────┬───────┘  └────────┬────────┘  └──────┬───────┘
        │ REST + WS          │ REST              │ REST + cookies   │ REST
┌───────▼────────┐  ┌────────▼───────┐  ┌────────▼────────┐         │
│ ticket-front   │  │ pr frontend    │  │ crm frontend    │   SPA served by
│ CRA :3001      │  │ CRA :3002      │  │ Vite :5173      │   the same process
└────────────────┘  └────────────────┘  └─────────────────┘
```

**Two things worth knowing about the topology:**

- **Systems 1 and 2 share the `abc` database.** The PR module was extracted from
  the ticketing monolith into its own Django service but still reads the same
  tables — `pr-system` must never import from `abc-production`, and it doesn't.
  The ticket frontend links into the PR app via `REACT_APP_PR_APP_URL`.
- **System 4 serves its own SPA.** Express hosts both the API and the built
  React bundle on one port, which is why the frontend's API base defaults to
  `window.location.origin`.

---

## 3. Shared infrastructure (PostgreSQL + Redis)

Both run as portable binaries under `.local-dev/`, on non-default ports so they
never collide with a system-wide install.

> **`.local-dev/` holds the actual PostgreSQL data directory.** It is excluded
> from git but must never be deleted from disk.

```bash
# PostgreSQL -> :5445
"E:/Ticket System/.local-dev/pg/bin/pg_ctl.exe" \
  -D "E:/Ticket System/.local-dev/data" -o "-p 5445" \
  -l "E:/Ticket System/.local-dev/pg.log" start

# Redis -> :9396
"E:/Ticket System/.local-dev/redis/Redis-8.8.1-Windows-x64-msys2/redis-server.exe" \
  --port 9396 --save "" --appendonly no --loglevel warning
```

Start these **before** any application.

---

## 4. Running locally

Every project reads its configuration from a `.env` file that is **not** in git.
Copy the matching `.env.example` and fill it in.

### 4.1 Production ticketing (`abc-production`)

```bash
# API -> :8000
cd "abc-production/ticket-back"
./.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000 \
    --settings=ABCHospital.settings_local

# Web -> :3001
cd "abc-production/ticket-front-current"
npm start
```

`ABCHospital/settings_local.py` is the local override — **`settings.py` is left
alone**. It redirects the database and Redis to the portable instances, swaps
`InMemoryChannelLayer` for Redis so WebSocket group sends actually cross
processes, and drops two abandoned packages that no longer import on Django 5.

Frontend configuration lives in `ticket-front-current/.env.local`:

```ini
PORT=3001
REACT_APP_API_BASE=http://localhost:8000/api
REACT_APP_WS_BASE=ws://localhost:8000
REACT_APP_PR_API_BASE=http://localhost:8001/api
REACT_APP_PR_APP_URL=http://localhost:3002
```

> Run the Django dev server **with** autoreload. Using `--noreload` serves stale
> bytecode after an edit and produces misleading test results.

### 4.2 Patient Relations (`pr-system`)

```bash
# API -> :8001
cd "pr-system/backend"
./.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8001

# Web -> :3002
cd "pr-system/frontend"
npm start
```

### 4.3 Ticketing CRM (`ticket-crm`)

```bash
# API -> :4000
cd "ticket-crm/backend"
npm run start:dev

# Web -> :5173
cd "ticket-crm/frontend"
npx vite --port 5173 --strictPort
```

Configuration is the **root** `ticket-crm/.env`, loaded by `src/load-env.ts`
before any other import. Loading it in code rather than sourcing it from the
shell matters: the file contains `&` characters that break shell sourcing.

```bash
npx prisma db push      # apply the schema
npm run db:seed         # seed demo data
```

### 4.4 Patient satisfaction (`abc-pr`)

```bash
cd "abc-pr"
npm run dev             # API + SPA together -> :3000
```

Schema and seed data are applied automatically on boot.

Tests run against an isolated database — **never point them at a real one**:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5445/abcpr_test" \
JWT_SECRET="test_secret_at_least_32_characters_long" npx vitest run
```

---

## 5. Running on a server

The four systems deploy the same way in principle: build the frontend, serve it
from a real web server, and run the API behind a reverse proxy with TLS.

### 5.1 Environment

Set real values as environment variables — never commit them.

**Django (`abc-production`, `pr-system`)**

```bash
DJANGO_SECRET_KEY=<64+ random chars>
DJANGO_DB_NAME=abc
DJANGO_DB_USER=abc
DJANGO_DB_PASSWORD=<strong password>
DJANGO_DB_HOST=<db host>
DJANGO_DB_PORT=5432
FIREBASE_CREDENTIALS=/etc/abch/firebase-service-account.json
```

Then, before going live:

```python
DEBUG = False
ALLOWED_HOSTS = ['support.abchospitaleg.com']   # not ['*']
```

**NestJS (`ticket-crm`)** — see `ticket-crm/.env.example`. `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET` and `CSRF_SECRET` are mandatory; the app refuses to boot
without them.

**Express (`abc-pr`)** — see `abc-pr/.env.example`.

### 5.2 Build and serve

```bash
# Django: ASGI, because the ticket system uses Channels for live chat
cd abc-production/ticket-back
python manage.py collectstatic --noinput
python manage.py migrate
daphne -b 0.0.0.0 -p 8000 ABCHospital.asgi:application

# CRA frontends
npm run build            # -> build/   (serve with nginx)

# NestJS
cd ticket-crm/backend && npm run build && node dist/main.js

# Express + SPA
cd abc-pr && npm run build && npm start
```

### 5.3 Reverse proxy

Give each service a hostname and terminate TLS at nginx. The ticket API needs
WebSocket upgrade headers or live chat and notifications silently stop working:

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host       $host;
}
```

`ticket-crm` authenticates with **httpOnly cookies plus a CSRF token**, so the
proxy must preserve `Origin` and cookie headers, and `FRONTEND_URL` must match
the real frontend origin exactly or CORS and CSRF both reject every request.

---

## 6. Database wiring, per system

| System | Driver | Where configured | Migrations |
|--------|--------|------------------|------------|
| `abc-production` | `psycopg2` | `ABCHospital/settings.py` (env) · `settings_local.py` (local) | `python manage.py migrate` |
| `pr-system` | `psycopg2` | `prcore/settings.py`, all via `env()` | `python manage.py migrate` |
| `ticket-crm` | Prisma 6 | `DATABASE_URL` in root `.env` | `npx prisma db push` |
| `abc-pr` | `pg` (raw SQL) | `DATABASE_URL` in `.env` | auto-applied on boot |

**Connection strings**

```ini
# ticket-crm
DATABASE_URL=postgresql://USER:PASS@HOST:5445/abch_db?schema=public&connection_limit=20&pool_timeout=30&connect_timeout=10

# abc-pr
DATABASE_URL=postgresql://USER:PASS@HOST:5445/abcpr
```

`abc-production` and `pr-system` both point at the **`abc`** database. Changing
a shared model in one requires checking the other.

---

## 7. What changed — engineering log

### 7.1 Production ticketing — backend

| Area | Change | Why |
|------|--------|-----|
| **Audit trail** | New `catalog/audit.py`: `AuditContextMiddleware`, `register_audit()`, snapshot/diff helpers. `catalog/apps.py` registers 14 models. | Audit rows recorded *what* changed but not *who from where* — `ip` and `user_agent` were always NULL. Now stamped across all 34 call sites without editing any of them. |
| **Permission leak** | `IsAdminRoleStrict` in `catalog/apis/permissions_api.py`. | `IsAdminRole` allowed **GET for any authenticated user**, so an agent could read the entire organisation permission matrix. |
| **Buildings / floors** | Removed `choices=` from `Ticket.building` / `floor`; validate against the `catalog` tables instead. Added `useLocationOptions` on the frontend. | The admin screens for Buildings and Floors were **entirely disconnected** from ticket creation — the values were hardcoded in three separate layers (a JS array, a `BUILD` dict, and model `choices`). Adding a building did nothing. |
| **Team feed** | `Note.pinned`, new `NoteReaction` model, `NoteInteractionPermission`. | Agents could not react to a colleague's note: the object permission returned `obj.poster == request.user`, which is right for editing but makes a feed nobody can use. |
| **Chat attachments** | `TicketComment` gained `kind`, `attachment`, `attachment_name`, `attachment_size`, `duration`, `reply_to`, `edited_at` (migration `0015`). | Chat was text-only. Now carries photos, files and voice notes, with replies and edit history. |
| **Chat 404 bug** | `TicketCommentModelViewSet.get_queryset()` only filters by ticket for the `list` action. | `?id=` names the *ticket*, and detail routes never send it — so **every edit and delete returned 404**. This had silently broken `DELETE` since before the chat work. |
| **Chat permissions** | New `TicketCommentPermission`. | The viewset fell back to bare `IsAuthenticated`, which was acceptable while messages were immutable text but would let any participant rewrite another's message once editing existed. |

Verified end-to-end: text, image, audio (with duration and reply preview) and
file messages all return `201`; empty messages `400`; a second user editing or
deleting someone else's message `403`.

### 7.2 Production ticketing — frontend

- **Mobile responsiveness across every page.** `MyTable` now stamps `data-label`
  on each cell from its column headers so CSS can collapse rows into cards below
  `1024px`; `index.css` rewritten around that, plus a scrollable sidebar and
  backdrop.
- **New Roles & permissions admin page** with permission sets and per-user
  tri-state overrides (allow / deny / inherit).
- **Missing chrome fixed.** `/settings` was a top-level route with its own header
  and **no sidebar**; it now lives inside the layout like every other page.
- **Ticket modal rebuilt** — a real header (ticket number, status, department,
  copy-id), icon tabs with an attachment count, a card-based Details tab, an
  attachment gallery with a keyboard-navigable lightbox, and a History timeline
  that shows *what changed* between entries instead of five near-identical
  columns.
- **Rich chat** — voice recording with a live level meter, image and file
  attachments with previews, a dependency-free emoji picker, replies, edit and
  delete, day separators, and message grouping.
- **Crash fixes.** `getFullName` destructured a `null` user — a single history
  row written by a since-deleted account took down the **entire History tab**.
- Access-denied and empty states redesigned (they previously rendered the string
  `"NotAllowed"` and a 404 illustration).

### 7.3 Patient Relations (`pr-system`)

| Change | Why |
|--------|-----|
| Ported `pr/apis/dashboard.py` (+ `pandas`) | The Statistics screen called an endpoint that **did not exist** in the extracted service — a flat 404. |
| Rewrote `pr/permissions.py` | An inverted condition (`if not role == ADMIN: return True`) let **any non-admin read patient surveys** regardless of department — a PHI leak — while locking admins out. Also settled authentication first, since `AnonymousUser` triggered 500s. |
| Added `role` to the login serializer | Its absence made every client-side `CanView` fail closed, so the home page rendered blank. |
| Statistics default range | No date selected meant "the last 24 hours", silently hiding all 40 surveys (dated 27/07) and showing **0.00%** on a populated database. Now defaults to all time — verified at `72.5%`. |
| Survey links | `SurveyCard` linked to `/pr/view/:id`, but only `/pr/view` had a redirect, so the `:id` form fell through to the catch-all and **bounced the user back home**. |

### 7.4 Ticketing CRM (`ticket-crm`)

- **Refresh-token rotation with replay detection** — Redis-backed `jti` registry;
  reusing a rotated token revokes every session for that user.
- **Request context via `AsyncLocalStorage`**, so audit rows capture IP and user
  agent. Prisma 6 removed `$use`, so the `auditLog` delegate's `create` is
  wrapped instead.
- **Deep links and refresh were broken** — `currentPath` was state seeded to
  `/dashboard`, there was no session restore on boot, refresh sent no CSRF
  header, and a CSRF failure surfaced as a 500. All four fixed; pages went from
  163 characters of shell to 400–2060 of real content.
- **Test suite recovered from 0.** A botched search-and-replace had written the
  regex character class `['"]` literally into **51 imports across 20 files**.
  Repaired → 70 tests passing (59/59 unit).
- Zod validation schemas, CI workflow, and a subscription data model
  (`Plan` / `Subscription` / `Invoice`) — **schema only, not yet migrated.**

### 7.5 Patient satisfaction (`abc-pr`)

- `server.ts` was missing `import "dotenv/config"`, so the app connected to port
  5432 instead of 5445 and **refused to start**.
- `new URL(path, "")` throws `Invalid base URL` when `VITE_API_BASE` is unset —
  which broke the archive and WhatsApp log screens with a raw error on screen.
  The SPA and API share an origin, so it now falls back to
  `window.location.origin`.
- Four silent `catch {}` blocks left the analytics page spinning forever; replaced
  with a real error state and a retry button.
- `cleanCredential()` strips Unicode bidi control characters (`U+200E`, `U+200F`,
  `U+202A`–`U+202E`, `U+2066`–`U+2069`). Copying a password out of
  right-to-left text carries invisible marks that made a correct password
  return 401.

---

## 8. Security notes

Fixed and verified in this repository:

- **PHI exposure in PR** — the inverted permission check described above.
  Confirmed after the fix: a user in a department without the PR module gets
  `403` on every PR endpoint; an admin gets `200`.
- **Permission-matrix leak** — read access narrowed to admins.
- **Credentials removed from source** — `settings.py` previously hardcoded the
  Django `SECRET_KEY` (which signs sessions and reset tokens) and the database
  password. Both now come from the environment.
- **Firebase service-account key** (`ticketingcrm.json`) is git-ignored. It
  contains an RSA private key granting full project access.

Outstanding, and **not** addressed here:

- `DEBUG = True` and `ALLOWED_HOSTS = ['*']` remain the defaults in
  `abc-production/ABCHospital/settings.py`. Both must be changed before any
  public deployment.
- The previously committed `SECRET_KEY`, database password and Firebase key
  should be treated as **compromised and rotated**, since they existed in
  plaintext in the source tree.

---

## 9. Local demo accounts

> **Local development data only.** These accounts exist in the local seed and
> are not valid anywhere else.

| System | URL | Username | Password |
|--------|-----|----------|----------|
| Production ticketing | `http://localhost:3001` | `1` admin · `2` manager · `3` agent · `4` reception | `Admin@123` |
| Patient Relations | `http://localhost:3002` | same accounts as above | `Admin@123` |
| Ticketing CRM | `http://localhost:5173` | `admin` · `supervisor` · `agent` · `user` | `Admin@123` |
| Patient satisfaction | `http://localhost:3000` | `admin` · `manager` · `agent` | `change-me-admin` · `change-me-manager` · `change-me-agent` |

The two Django systems authenticate by **fingerprint ID** (an integer), not a
username.

All 15 accounts were verified against their running APIs.

---

## Repository layout

```
.
├── abc-production/          Production ticketing (Django + CRA)
│   ├── ticket-back/           API, Channels, DRF
│   ├── ticket-front/          original vendor frontend — baseline, unmodified
│   └── ticket-front-current/  frontend in use
├── pr-system/               Patient Relations service (Django + CRA)
├── ticket-crm/              Next-generation CRM (NestJS + Prisma + Vite)
├── abc-pr/                  Patient satisfaction (Express + Vite)
└── plans/                   Planning and audit documents
```

`ticket-crm/` and `abc-pr/` were previously standalone repositories. Their
original history is preserved on disk as `.git-original/` — rename back to
`.git` to work with their own remotes.
