# API Reference

[← Home](Home.md) · See also [Server](Server.md) · [Client](Client.md) · [Security](Security.md)

Two distinct "API" surfaces exist in this repo:

1. **Server routes** — endpoints the `src/server` Express app itself implements (small; mostly
   proxy/session/page-shell logic).
2. **Client API layer** — `src/client/src/api/*.js` functions that call backend microservices,
   either through the server's proxy routes or directly via NGINX/`clientProxy.js`.

This repo does not implement the Core/Auth/Dictionary/Execution/Report/Search services
themselves — only their client-facing contracts as consumed here.

## Server routes

### `src/routes/login.js`

| Method & path | Auth required? | Behavior |
|---|---|---|
| `GET /login` | No | Renders `login.ejs`. If already authenticated, redirects to `?next` (or `/`). |
| `POST /login` | No | Body: `{ username, password }`. Calls `AUTH_LOGIN_URL` with HTTP Basic auth + `X-AUTH-METHOD` header. On success (`200`), sets `access_token`, `access_token_timeout`, `expiration_date` cookies and redirects to `?next`. On failure, re-renders the login page with an error message (never the raw upstream error). |
| `GET /logout` | No | Best-effort `POST` to `AUTH_LOGOUT_URL` with the current token, then clears all three auth cookies and redirects (to `/` or `/login?next=...`). |
| `GET /renew` | Requires an existing `access_token` cookie (redirects to login otherwise) | `POST`s to `AUTH_REFRESH_TOKEN_URL`; on `200`, verifies the new JWT and resets `access_token`/`expiration_date` cookies (30-minute cookie `expires`), returns `200 {}`. On `403` from the auth service, redirects to `/logout`. Otherwise passes the upstream status through with an empty JSON body. |

Also exports `logoutRequest(req, res)`, reused by `middleware/session.js` to force-logout on an
expired/invalid JWT.

### `src/routes/pages.js`

Each route renders one SPA shell with the configured bundle filename as a template local; all
require authentication (mounted after `loginRequired`):

| Path | Template | Local passed |
|---|---|---|
| `GET /` | `spa/dashboard` | `dashboard_js_bundle` |
| `GET /admin` and any `/admin/*` (regex) | `spa/admin` | `admin_js_bundle` |
| `GET /authoring/:procedureId/:version` | `spa/authoring` | `authoring_js_bundle` |
| `GET /procedures/:procedureId` | `spa/authoring` | `authoring_js_bundle` |
| `GET /procedures` | `spa/authoring` | `authoring_js_bundle` |
| `GET /executions` | `spa/executions` | `executions_js_bundle` |
| `GET /reporting` | `spa/reporting` | `reporting_js_bundle` |
| `GET /search` | `spa/search` | `search_js_bundle` |
| `GET /execute/:venueId` | `spa/execution` | `execution_js_bundle` |
| `GET /execute_spa/:venueId/:executionId` | `spa/execution` | `execution_js_bundle` |
| `GET /execute/as_run/:executionId` | `spa/execution_as_run` | `execute_as_run_js_bundle` |
| `GET /project_configuration/*` (regex) | `spa/project_config` | `project_config_js_bundle` |
| `GET /venues/:venueId` | `spa/venue_detail` | `venue_id`, `venue_detail_js_bundle` |

A code comment notes that other admin sub-pages present in the old Django views
(`manage_venues_page`, `manage_roles_page`, etc.) were **dead code** (unreferenced by any URL)
and were intentionally not ported.

### `src/routes/core.js` (mounted at `/core`)

| Method & path | Body | Behavior |
|---|---|---|
| `POST /execution/update` | `{ description, execution_id }` | `PATCH`es `EXECUTIONS_URL/:id` with `{ description }`; normalizes upstream `204` to `200`. |
| `POST /execution/:executionId/close` | — | `POST`s `.../status` with `{ status: 'CLOSED' }`. |
| `POST /execution/:executionId/resume` | `{ venue_id }` | `POST`s `.../resume` with `{ venue_id }`; returns upstream status + body. |
| `POST /execution/:executionId/halt/step` | — | `POST`s `.../halt`. |

### `src/routes/dictService.js` (mounted at `/dictionary_service`)

| Method & path | Query/body | Behavior |
|---|---|---|
| `GET /lookup/cmd/names` | `q`, `dictionary_type`, `flight_dictionary_version`, `sse_dictionary_version` | Looks up commands by stem against the SSE or flight dictionary version (selected by `dictionary_type`). |
| `GET /lookup/evr/names` | same pattern, `q` = EVR name | EVR name lookup. |
| `GET /lookup/eha/names` | same pattern, `q` = EHA name | EHA name lookup. |
| `POST /delete/dictionary` | `{ type, version }` | Deletes a dictionary version. |
| `POST /update/sse/parser` | `{ active_sse_dictionary_parser }` | Sets the active SSE dictionary parser. |
| `POST /update/flight/parser` | `{ active_flight_dictionary_parser }` | Sets the active flight dictionary parser. |

A code comment notes that multipart dictionary **upload** endpoints (add/update SSE or flight
dictionary files) from the old `dict_service_api.py` were **not ported** — they need a
multipart-handling dependency decision (e.g. `multer`) and are flagged as a follow-up.

### `src/routes/authService.js` (mounted at `/authentication_service`)

| Method & path | Body/query | Behavior |
|---|---|---|
| `POST /roles/add/role` | `{ name, description?, permissions?, users_id?, groups_id? }` | `400` if `name` missing; otherwise creates a role (comma-separated `users_id`/`groups_id` are split into arrays). |
| `POST /roles/update/role` | `{ role_id, name, ... }` | `400` if `name` or `role_id` missing; `PUT`s the role. |
| `POST /roles/delete/role` | `{ role_id }` | `400` if missing; deletes the role. |
| `GET /lookup/user` | `q` | Proxies to LDAP user lookup, returning just an array of usernames (`400` on upstream failure). |
| `GET /lookup/group` | `q` | Proxies to LDAP group lookup, returning the raw upstream array. |

### `src/routes/fileServer.js` / `src/routes/clientProxy.js`

Not application routes but **generic reverse proxies** — see [Server](Server.md#route-modules)
and [Architecture](Architecture.md) for prefixes and behavior.

## Client API layer

All modules live in `src/client/src/api/` and share the
`transport` axios instance from `transport.js` (Bearer token attached automatically). Common
pattern: each function `await`s a `transport.<verb>()` call, `catch`es errors with
`console.error`, and returns either the parsed `response.data` or a sentinel
(`null`/`undefined`/`{ error }`) rather than re-throwing — see
[Error-Handling](Error-Handling.md#1-api-layer-error-swallowing).

Representative functions (not exhaustive — see each file for the full list):

- **`procedures.js`**: `getProcedures(params)` (list, with pagination/filter/sort →
  `{ procedures, total }` using the `X-Total-Count` response header),
  `getProcedureVersions(procedureId, options)`, `getProcedure(procedureId)`.
- **`authoring.js`** (16 KB) — CRUD for procedure elements/steps during authoring: creating,
  moving, copying, deleting elements, updating step content, managing the step palette. Backs
  most of `authoring-store.js`'s actions.
- **`execution.js`** (18 KB) — execution lifecycle and per-element execution actions (save
  input, redline, comments-on-elements, time references, file attachments) — see
  `core-urls.js::coreExecutionUrls` for the full endpoint surface it targets
  (`elements`, `comments`, `elementFile`, `commentFile`, `modify`, `justify`,
  `move`, `copy`, `refresh`, `status`, `search`, `break_points`, `switch_wait_flag`, ...).
- **`comments.js`** — element/execution comment thread CRUD, used by `comments-store.js`.
- **`dictionary.js`** (25 KB) — SSE/flight dictionary CRUD, cmd/evr/eha browsing — client-side
  counterpart to `dictService.js`'s server routes, but note most dictionary calls go **directly**
  to `/dict_server/...` rather than through the server's `/dictionary_service` routes (compare
  `dict-urls.js` prefixes against `dictService.js`'s narrower lookup/parser-update surface).
- **`venue.js`** — venue CRUD/status, consumed by `dashboard-store.js`/`venue-detail-store.js`.
- **`admin.js`** — role/permission/venue-group admin operations, calling `admin-urls.js`
  endpoints (separate from `authService.js`'s server-side role routes — verify which is
  authoritative before modifying either).
- **`report.js`**, **`search.js`** — report generation and cross-execution search, targeting
  `REPORT_API_URL`/`SEARCH_API_URL` via the `/report_server`/`/search_server` proxy prefixes.
- **`auth.js`** — `getUsers(userName)`, `getLdapUsers(userName)`, `getLdapGroups(groupName)`,
  all calling `/auth_server/api/v2/...` directly (bypassing the server's
  `authService.js` LDAP lookup routes entirely — these hit NGINX/`clientProxy.js` instead).

### URL builder modules

`core-urls.js`, `dict-urls.js`, `admin-urls.js`, `report-urls.js`, `search-url.js`
centralize path construction as plain object literals of functions (e.g.
`coreExecutionUrls.elements(executionId, elementId)`), so the request functions above never
hand-build URL strings. When adding a new endpoint, add the builder here first, then a
function in the matching `api/*.js` module — see [Extending](Extending.md).

## Related pages

- [Server](Server.md) — middleware context each route runs behind (auth, CSRF, etc).
- [Security](Security.md) — how the Bearer token these routes/functions rely on is obtained.
- [Data-Flow](Data-Flow.md) — concrete call sequences through this API surface.
- [Error-Handling](Error-Handling.md) — how failures from these calls surface to the user.
