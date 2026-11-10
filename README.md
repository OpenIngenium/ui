# Ingenium UI

**Web front end for Ingenium — a procedure authoring and execution system.**

[![CI](https://github.com/OpenIngenium/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/OpenIngenium/ui/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](.nvmrc)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)


---

## Overview

Ingenium UI lets users author step-by-step operational procedures (commands, waits,
verifications, manual steps, custom scripts, etc.), organize them into venues, and execute them
live with real-time status tracking, commenting/redlining, and reporting. Default branding
(`APPLICATION_TITLE`/`APPLICATION_ACRONYM`) targets the Europa Clipper mission but is
configurable per deployment (see [Configuration](#configuration)).

The repository is a **monorepo with two runtime halves**:

| Half | Path | Stack | Role |
|---|---|---|---|
| **Client** | [`src/client`](src/client) | Vue 2, Vuex, Vue Router, webpack 5 | Multi-SPA browser application (11 independent bundles) |
| **Server** | [`src/server`](src/server) | Node.js, Express 4, EJS | Auth/session/CSRF, SPA page shells, API proxying |

```text
Browser
   │
   ▼
NGINX (TLS, static assets, reverse proxy)              [production topologies only]
   │
   ▼
Express "ui" server (src/server)  — auth, CSRF, session, page shells, API proxy
   │
   ▼
Backend microservices (separate repositories)
Core API · Auth service · Dictionary service · Execution server ·
Report/Search services · Execution Monitor (WebSocket)
```

This repository does **not** contain the backend microservices themselves — only the client
code and a thin proxy layer that talks to them. Full functionality (login, dictionary lookups,
executions, etc.) requires those services to be reachable; see
[docs/Architecture.md](docs/Architecture.md).

## Features

- **Multi-SPA Vue 2 client** — 11 independently built bundles (`dashboard`, `authoring`,
  `execution`, `executions`, `execute-as-run`, `venue-detail`, `project-config`, `reporting`,
  `search`, `admin`, `header`) sharing one component/store library.
- **Procedure authoring** — build procedures from a reusable "element" component library
  (commands, waits, EHA/EVR verification, manual input, custom scripts, MIL-STD-1553, run-nested-
  procedure, sections, etc.), rendered by the *same* components in authoring, live execution, and
  as-run playback via mode-specific mixins.
- **Live execution** — real-time status updates, commenting, and redlining while a procedure is
  being run.
- **As-run playback** — read-only replay of a completed execution.
- **Project configuration** — manage dictionaries (commands/EVRs/EHAs) and custom scripts per
  project.
- **Role-based UI** — client-side authorization via [`@casl/vue`](https://casl.js.org/), driven
  by the `scopes` claim in the user's JWT.
- **Express BFF server** — handles login/session, JWT verification, double-submit-cookie CSRF
  protection, SPA page shells, and API proxying; replaces a legacy Django server (see
  [docs/Server.md](docs/Server.md)).
- **Multiple deployment topologies** — plain Node server, NGINX + Node, or NGINX with TLS in
  front, via the four Dockerfiles in this repo (see [Docker](#docker)).

## Installation

**Prerequisites**

- [Node.js](https://nodejs.org/) `>= 22` (CI and Docker images use `22.23.4` — see
  [`.nvmrc`](.nvmrc)). If you use [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`.
- `npm` (bundled with Node).
- Network access to the Ingenium backend microservices for full functionality (see
  [Configuration](#configuration)).

**Clone and install**

```bash
git clone https://github.com/OpenIngenium/ui.git
cd ui
npm run install:all   # npm install in both src/client and src/server
```

## Quick Start

```bash
# 1. Configure the server (client needs no .env — its config is baked in at build time)
cp src/server/.env.example src/server/.env
# edit src/server/.env: at minimum set the *_API_URL vars for the backend
# services you have access to (see Configuration below)

# 2. Run both halves together from the repo root
npm run dev
```

`npm run dev` runs `webpack --watch` for the client (rebuilds `src/client/dist` on change) and
`nodemon` for the server (auto-restarts on change) concurrently. Once both are up, open
`http://localhost:5000` (default `PORT`). Unauthenticated requests redirect to `/login`; a
working login requires `AUTH_API_URL` (and the other `*_API_URL` vars) to point at a reachable
Auth/Core/Dictionary service.

## Usage

The server renders one SPA shell per client bundle. Main routes (see
[`src/server/src/routes/pages.js`](src/server/src/routes/pages.js)):

| Route | Bundle |
|---|---|
| `GET /` | `dashboard` |
| `GET /procedures`, `/procedures/:procedureId`, `/authoring/:procedureId/:version` | `authoring` |
| `GET /execute/:venueId`, `/execute_spa/:venueId/:executionId` | `execution` |
| `GET /execute/as_run/:executionId` | `execute-as-run` |
| `GET /executions` | `executions` |
| `GET /venues/:venueId` | `venue-detail` |
| `GET /project_configuration/*` | `project-config` |
| `GET /reporting` | `reporting` |
| `GET /search` | `search` |
| `GET /admin` and `/admin/*` | `admin` |

All routes except `/login`, `/logout`, `/renew`, and `/static/*` require an authenticated session
(a valid `access_token` cookie). See [docs/API-Reference.md](docs/API-Reference.md) for
full endpoint- and function-level detail.

## Configuration

The client has no runtime `.env`; its `process.env` values are baked in per build mode via
[`src/client/config/{dev,test,prod}.env.js`](src/client/config). The server reads its
configuration from environment variables (or `src/server/.env`, loaded via `dotenv`) — template
in [`src/server/.env.example`](src/server/.env.example), parsed in
[`src/server/src/config/index.js`](src/server/src/config/index.js).

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the Express server listens on. |
| `NODE_ENV` | `production` | `development` enables verbose logging (`morgan('dev')`). |
| `APPLICATION_TITLE` | `Europa Clipper` | Shown in page titles/header. |
| `APPLICATION_ACRONYM` | `Europa Clipper Ingenium` | Shown in header/branding. |
| `UI_CUSTOM_FOOTER` | *(empty)* | Optional custom footer HTML/text. |
| `FROALA_KEY` | *(empty)* | Froala editor license key, injected into `window.froalaKey`. |
| `CSRF_SECRET` | `change-me-in-production` | Signs CSRF tokens — **must** be overridden in production. |
| `VERIFY_REQUESTS_SSL` | `false` | Parsed but not currently wired into any outgoing HTTP call in this repo — has no observable effect yet. |
| `UI_ENABLE_DEBUG_INFORMATION` | `false` | Logs upstream request/response status lines (never headers/bodies). |
| `AUTH_METHOD` | `password` | `password` or `rsa` — controls the login form and `X-AUTH-METHOD` header. |
| `PUBLIC_PEM` | *(none)* | RSA public key (PEM) used to verify JWTs from the auth service. Required for login to work. |
| `CORE_API_URL` | *(none)* | Core API — procedures, executions, venues, comments. |
| `AUTH_API_URL` | *(none)* | Auth service — login, JWT refresh, roles, LDAP lookup. |
| `DICT_API_URL` | *(none)* | Dictionary service — cmd/evr/eha lookups. |
| `ARCHIVE_API_URL` | *(none)* | Archive API (health check only, currently). |
| `EXECUTION_SERVER_URL` | *(none)* | Execution server (health check only, currently). |
| `REPORT_API_URL` | *(none)* | Report generation service. |
| `SEARCH_API_URL` | *(none)* | Cross-execution search service. |
| `EXECUTION_MONITOR_URL` | *(none)* | Live execution status via socket.io/WebSocket. |
| `*_JS_BUNDLE` (11 vars, e.g. `DASHBOARD_JS_BUNDLE`) | plain bundle filenames | Override if your build emits hashed/timestamped filenames (see [`js_filename_to_env.sh`](js_filename_to_env.sh)). |

## Project Structure

```text
.
├── .github/workflows/ci.yml   CI pipeline (GitHub Actions)
├── Dockerfile*                Four build targets (see Docker section)
├── ingenium-*.conf, nginx.conf NGINX config templates
├── docs/                  DeepWiki (developer documentation)
├── package.json                Root convenience scripts
└── src/
    ├── client/                 Vue 2 multi-SPA application (see docs/Client.md)
    │   ├── src/api/               Axios API layer (one module per backend service)
    │   ├── src/modules/           One dir per SPA + shared common/elements libraries
    │   └── test/unit/              Karma + Jasmine specs
    └── server/                  Express BFF server (see docs/Server.md)
        ├── src/{routes,middleware,lib,config,views}/
        └── test/                   node:test suites mirroring src/
```

## Development

```bash
# Root (both halves)
npm run install:all     # install dependencies for client + server
npm run dev              # run client watch-build + server (nodemon) together
npm test                 # run client + server unit tests
npm run test:coverage    # run client + server unit tests with coverage

# Client (src/client)
npm run dev               # webpack --watch (rebuilds dist/ on change)
npm run build              # production build
npm run build:single-node  # dev-mode build used by the single-container ui Dockerfile
npm test                   # karma, single run, NODE_ENV=production (what CI runs)
npm run test:watch          # karma, watch mode
npm run test:coverage        # karma with coverage report

# Server (src/server)
npm run dev    # nodemon, restarts on change
npm start        # plain node server.js
npm test          # node --test
npm run test:coverage  # node --test with coverage
```

There is no dedicated `lint` script in either package; `src/client/package.json` includes an
`eslintConfig` block for editor integration (see the ESLint VS Code extension).

## Testing & CI

`.github/workflows/ci.yml` runs on every push/PR to `devel` and `main`, with three jobs:

1. **`test-client`** — `npm ci --legacy-peer-deps` then `npm run test:coverage` in
   `src/client` (Karma + Jasmine, jsdom).
2. **`test-server`** — `npm ci` then `npm run test:coverage` in `src/server`
   (Node's built-in test runner, `node --test`).
3. **`docker`** — after both test jobs pass, builds the `ui` image (root `Dockerfile`) and the
   `ui` + NGINX/TLS image (`Dockerfile-nginx-https`) to confirm they build cleanly.

All jobs run on `ubuntu-latest` with the Node version pinned by [`.nvmrc`](.nvmrc)
(`22.23.4`).

## Docker

Two Dockerfiles support different deployment shapes (see
[docs/Architecture.md](docs/Architecture.md#deployment-topologies-observed-from-dockerfiles)):

| Dockerfile | Shape |
|---|---|
| [`Dockerfile`](Dockerfile) | Builds the client and packages it with the Node/Express server into one `ui` image that itself handles auth/CSRF/proxying and serves `/static`. |
| [`Dockerfile-nginx-https`](Dockerfile-nginx-https) | Full production shape: NGINX terminates TLS and reverse-proxies everything (including `/static`) to the `ui` container; no client build in this image. |

```bash
docker build -t ingenium_ui .
docker build -f Dockerfile-nginx-https -t ingenium_ui_nginx .
```

## Documentation

Deeper, developer-facing documentation lives in the [DeepWiki](docs/Home.md):

- [Architecture](docs/Architecture.md) — request pipeline, deployment topologies.
- [Repository-Structure](docs/Repository-Structure.md) — full directory breakdown.
- [Client](docs/Client.md) — Vue module/store/element system.
- [Server](docs/Server.md) — Express middleware/routes.
- [API-Reference](docs/API-Reference.md) — endpoint and function signatures.

## Contributing

This repository has no `CONTRIBUTING.md`. General workflow:

1. Clone the repository and create a branch off `devel` or `main`.
2. Make your changes; run `npm test` (and `npm run test:coverage` if touching well-covered
   areas) from the repo root, or per-package under `src/client`/`src/server`.
3. Open a pull request targeting `devel` or `main` — CI (`.github/workflows/ci.yml`) runs
   automatically on the PR.

## Security

This repository does not currently include a `SECURITY.md` or a documented vulnerability
reporting process.

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). See
[LICENSE](LICENSE) and [NOTICE](NOTICE) (the latter documents third-party components with
non-Apache licensing terms).
