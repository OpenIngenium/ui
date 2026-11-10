# Server (`src/server`)

[← Home](Home.md) · See also [Architecture](Architecture.md) · [API-Reference](API-Reference.md) · [Security](Security.md)

The server is a Node/Express application whose job is to: serve the compiled Vue bundles inside
minimal EJS "page shell" templates, handle login/logout/session/CSRF, and proxy a subset of API
calls to backend microservices. It explicitly replaces a previous Django server — nearly every
module has a header comment naming the Django file it ports (e.g. "Port of
`src/ingenium/middleware/ingenium_user_middleware.py`"). There is **no database**; all user
state is derived from a JWT.

## Entry point

`src/server/server.js`:

```js
require('dotenv').config();
const createApp = require('./src/app');
const config = require('./src/config');
const app = createApp();
const server = app.listen(config.PORT, '0.0.0.0', () => { ... });
app.emit('upgrade-proxy-targets', server);
```

The final line is necessary because Express's `app.use()` cannot intercept a raw HTTP `upgrade`
event (needed for the `/execution_monitor` WebSocket proxy); `clientProxy.js` listens for the
`upgrade-proxy-targets` event to attach `proxy.upgrade` to the real `http.Server`.

## Middleware pipeline (`src/app.js`)

`createApp()` (`src/server/src/app.js`) builds the
pipeline in this exact order (see the [Architecture](Architecture.md#server-architecture-linear-middleware-pipeline)
diagram):

1. **`mountClientProxyRoutes(app)`** — mounted *first*, before body parsers, so proxied request
   bodies stream through untouched.
2. `express.json()`, `express.urlencoded()`, `cookieParser()`.
3. **Static assets** under `/static`: `CLIENT_DIST_DIR` first, then `LEGACY_STATIC_DIR` — two
   `express.static` calls stacked on the same prefix, mirroring how Django's
   `django.contrib.staticfiles` merged multiple static roots.
4. **`attachUser`** → **`checkSessionExpiration`** → **`templateLocals`**.
5. **`attachCsrfToken`** → **`doubleCsrfProtection`** — CSRF applies to *every* non-safe request
   from this point on, including the login POST itself.
6. **`loginRoutes.router`** mounted at `/` — `/login`, `/logout`, `/renew` are exempt from the
   auth gate below.
7. **`loginRequired`** — everything registered after this line requires an authenticated user.
8. `mountFileServerRoutes(app)`, then `/core`, `/dictionary_service`, `/authentication_service`,
   then `pagesRoutes` at `/`.
9. 404 handler → `csrfErrorHandler` → generic error handler.

## Config module

`src/server/src/config/index.js` is the single source
of truth for server config. It reads `process.env` via a local `env(key, fallback)` helper and
derives many URLs from a handful of base `*_API_URL` variables (e.g. `EXECUTIONS_URL =
CORE_API_URL + 'executions/'`). It also derives proxy target **origins** from those same URLs
via `originOf()` (strips the path, keeps `protocol//host`) for use by `clientProxy.js`. Full
variable list: [Configuration](Configuration.md#server-srcserver).

Notable derived/config values:
- `CLIENT_DIST_DIR` / `LEGACY_STATIC_DIR` / `VIEWS_DIR` — filesystem paths computed relative to
  `__dirname`, not configurable via env.
- `CSRF_SECRET` falls back to `SECRET_KEY`, then to the literal string
  `'change-me-in-production'` — the code comment flags this must be overridden in production.
- `LOGIN_EXEMPT_PATHS` — an array of regexes (`/^static\//`, `/^login\/?$/`, `/^logout\/?$/`)
  checked by `loginRequired`.
- `AUTH_PUBLIC_PEM` reads `PUBLIC_PEM` first, then `AUTH_PUBLIC_PEM`, because the real
  docker-compose stack sets `PUBLIC_PEM` (per an inline comment referencing the `ui` service
  env in a separate deployment repo).

## Middleware modules

| File | Responsibility |
|---|---|
| `middleware/auth.js` | `attachUser(req,res,next)` — reads the `access_token` cookie, builds `req.user` as an `IngeniumUser` (or `IngeniumAnonymousUser` if no cookie). Also copies `access_token_timeout` cookie onto the user object. |
| `middleware/session.js` | `checkSessionExpiration` — calls `req.user.getUsername()` (which triggers JWT verification); on `TokenExpiredError` or `JsonWebTokenError` it force-logs-out by calling `logoutRequest` from `routes/login.js`. |
| `middleware/loginRequired.js` | Redirects to `LOGIN_URL` with a `?next=` param for any non-exempt, unauthenticated request. Root path (`''`) redirects without a `next` param. |
| `middleware/templateLocals.js` | Sets `res.locals.APPLICATION_TITLE`, `APPLICATION_ACRONYM`, `HEADER_JS_BUNDLE`, `UI_CUSTOM_FOOTER` on every request; adds `SESSION_WARNING_EXPIRATION_IN_SECONDS` only if authenticated. |
| `middleware/csrf.js` | Wraps `csrf-csrf`'s `doubleCsrf()`. Cookie name `csrf_token`, `sameSite: 'strict'`, `secure` only in production, `httpOnly: false` (must be readable by client JS to attach to AJAX headers). Session identifier = username (or `'anonymous'`). Token read from `req.body._csrf` or the `X-CSRF-Token` header. |

## Route modules

| File | Mounted at | Purpose |
|---|---|---|
| `routes/login.js` | `/` (public) | `GET/POST /login`, `GET /logout`, `GET /renew`. See [Data-Flow](Data-Flow.md#login) and [API-Reference](API-Reference.md#server-routes). |
| `routes/pages.js` | `/` (auth required) | Renders the EJS shell for each SPA bundle. See [API-Reference](API-Reference.md#server-routes). |
| `routes/core.js` | `/core` | Execution description update, close, resume, halt — thin proxies to the Core API with the caller's Bearer token attached. |
| `routes/dictService.js` | `/dictionary_service` | cmd/evr/eha name lookups and dictionary parser updates against the Dictionary service. |
| `routes/authService.js` | `/authentication_service` | Role CRUD and LDAP user/group lookup against the Auth service. |
| `routes/clientProxy.js` | `/core_server`, `/auth_server`, `/dict_server`, `/report_server`, `/search_server`, `/execution_monitor` | Reverse-proxies the prefixes the **browser** calls directly, mirroring what NGINX does in production. `/dict_server` intentionally keeps its prefix (`stripPrefix: false`) because the CI dictionary host serves at that path; `/execution_monitor` is proxied with `ws: true` for the socket.io WebSocket. |

All async route handlers are wrapped in `asyncHandler()` (`lib/asyncHandler.js`) so a rejected
promise reaches Express's `next(err)` instead of crashing the process.

## `lib/` helpers

- **`httpClient.js`** — thin axios wrapper (`getRequest`/`postRequest`/`putRequest`/
  `patchRequest`/`deleteRequest`). Sets `validateStatus: () => true` so callers see non-2xx
  responses instead of thrown errors (mirroring Python `requests`). Logs method+redacted-URL
  only (never headers/body) via `redactUrl()`, and only logs at info level when
  `ENABLE_DEBUG_INFORMATION` is set; response status is always logged as a warning if ≥400. On
  network failure, it constructs a **new, credential-free** `Error` rather than propagating the
  raw axios error (whose `.config`/`.request` can carry `Authorization` headers or POST bodies).
- **`ingeniumUser.js`** — `IngeniumUser` wraps a raw JWT string. All getters
  (`getUsername`, `isAdmin`, `getAccessExpiration`, `getPermissions`, `getRoles`, ...) lazily
  call `decodeAccessJwt()`, which runs `jwt.verify(access, AUTH_PUBLIC_PEM, { algorithms: ['RS256'] })`
  and memoizes the decoded payload. `IngeniumAnonymousUser extends IngeniumUser` and overrides
  `isAuthenticated()` to always return `false`.
- **`asyncHandler.js`** — one-line promise-to-`next(err)` adapter, used by every route handler
  that does `await`.

## Views

EJS templates in `src/views/`:
- `login.ejs` — login form; label depends on `AUTH_METHOD` (`'JPL Password'` vs
  `'RSA (PIN + TOKENCODE)'`, computed in `routes/login.js`).
- `403.ejs`, `404.ejs` — error pages.
- `partials/head.ejs`, `partials/foot.ejs` — shared head/foot includes.
- `spa/*.ejs` — one shell per bundle (`dashboard.ejs`, `authoring.ejs`, `execution.ejs`,
  `execution_as_run.ejs`, `executions.ejs`, `project_config.ejs`, `reporting.ejs`, `search.ejs`,
  `venue_detail.ejs`, `admin.ejs`). Each is rendered by the matching route in
  `routes/pages.js` with the bundle filename injected as a local variable.

## Static assets

`static/` holds legacy assets that used to live under Django's `django.contrib.staticfiles`
(css, fonts, images, jQuery/bootstrap `lib/`, and step-result sound effects). They are served at
the same `/static` prefix as the compiled Vue bundles (`app.js` stacks two `express.static`
calls). NGINX (`Dockerfile-nginx-https`) does not serve any static assets itself — it proxies
every request, including `/static`, straight to this `ui` container.

## Tests

`src/server/test/` mirrors `src/server/src/` 1:1 — `config/index.test.js`,
`lib/{asyncHandler,httpClient,ingeniumUser}.test.js`,
`middleware/{auth,csrf,loginRequired,session,templateLocals}.test.js`,
`routes/{authService,clientProxy,core,dictService,fileServer,login,pages}.test.js`, plus
`test/helpers/{loadConfig,loadWithEnv}.js` for re-requiring the config module under different
env vars. See [Testing](Testing.md#server-tests) for how to run these.

## Related pages

- [API-Reference](API-Reference.md#server-routes) — endpoint-by-endpoint signatures.
- [Security](Security.md) — JWT verification and CSRF mechanics in depth.
- [Configuration](Configuration.md#server-srcserver) — every env var this module reads.
- [Data-Flow](Data-Flow.md) — end-to-end request lifecycles through this pipeline.
