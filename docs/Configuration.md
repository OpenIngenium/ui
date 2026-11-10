# Configuration

[← Home](Home.md) · See also [Server](Server.md) · [Client](Client.md) · [Development](Development.md)

The client and server each have their own, independent configuration mechanism. There is no
shared `.env` between them.

## Server (`src/server`)

Loaded via `dotenv` at process start (`server.js:1`) from a `.env` file in `src/server/`, then
centralized in `src/server/src/config/index.js`. Copy
`src/server/.env.example` to `.env` and fill in real
values for local development (`.env` itself is expected to be developer-local / not committed).

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | HTTP listen port. |
| `NODE_ENV` | `production` | Controls morgan log format (`combined` vs `dev`) and CSRF cookie `secure` flag. |
| `APPLICATION_TITLE` | `Europa Clipper` | Shown in page `<title>` / branding locals. |
| `APPLICATION_ACRONYM` | `Europa Clipper Ingenium` | Same. |
| `UI_CUSTOM_FOOTER` | `''` | Injected into `window.uiCustomFooter` (see `head.ejs`). |
| `FROALA_KEY` | `''` | Froala editor license key, injected into `window.froalaKey` (see `head.ejs`) and consumed by `FroalaEdit.vue`. Passed in via docker-compose in deployed environments. |
| `CMD_STRING_FORMAT` | `{{STEM}}{{PRE_ARGS}},{{/PRE_ARGS}}{{#ARGS}}{{ARG_VALUE}}{{SEP}},{{/SEP}}{{/ARGS}}` | Template controlling how the CMD "Lookup" builder assembles a command stem + arguments into a command string. Injected into `window.cmdStringFormat` (see `head.ejs`) and consumed by `cmd-string-format.js`. See [Command string format](#command-string-format). |
| `CSRF_SECRET` | `'change-me-in-production'` | Signs CSRF tokens. **Must** be overridden in production. |
| `VERIFY_REQUESTS_SSL` | `false` | Parsed as boolean (`=== 'true'`). Wired into `httpClient.js` as a shared `https.Agent({ rejectUnauthorized })` passed on every axios call, mirroring the Django `requests` lib's `verify=` param used by the predecessor `request_controller.py`. Set to `true` to enforce TLS cert verification on calls to backend microservices. |
| `UI_ENABLE_DEBUG_INFORMATION` | `False` | Parsed case-insensitively as boolean. Enables verbose upstream request/response logging in `httpClient.js` and `http-proxy-middleware` log level in the proxy routes. |
| `CORE_API_URL` | — | Base URL for the Core API (procedures/executions/venues/comments). Also used to derive `CORE_SERVER_ORIGIN` for `/core_server` proxying. |
| `AUTH_API_URL` | — | Base URL for the Auth service. Derives `AUTH_LOGIN_URL`, `AUTH_LOGOUT_URL`, `AUTH_REFRESH_TOKEN_URL`, `AUTH_HEALTH_CHECK_URL`, `AUTH_LDAP_URL`, `AUTH_LDAP_USER_LOOKUP`, `AUTH_LDAP_GROUP_LOOKUP`, `AUTH_GROUPS_URL`, `AUTH_USERS_URL`, `AUTH_ROLES_URL`, `AUTH_PERMISSIONS_URL`, and `AUTH_SERVER_ORIGIN`. |
| `DICT_API_URL` | — | Dictionary service base URL; derives `DICTIONARY_HEALTH_CHECK_URL`, `DICT_SERVER_ORIGIN`. |
| `ARCHIVE_API_URL` | — | Archive API base URL; derives `ARCHIVE_HEALTH_CHECK`. |
| `EXECUTION_SERVER_URL` | — | Execution server base URL; derives `EXECUTION_SERVER_HEALTH_CHECK_URL`. |
| `REPORT_API_URL` | — | Report service base URL; derives `REPORT_SERVER_ORIGIN`. |
| `SEARCH_API_URL` | — | Search service base URL; derives `SEARCH_SERVER_ORIGIN`. |
| `EXECUTION_MONITOR_URL` | — | WebSocket/socket.io execution-status service; derives `EXECUTION_MONITOR_ORIGIN` (proxied with `ws: true`). |
| `AUTH_METHOD` | `password` | `password` or `rsa`; sent as `X-AUTH-METHOD` header on login and controls the login form's secret-label text. |
| `PUBLIC_PEM` (preferred) / `AUTH_PUBLIC_PEM` (alias) | — | RSA public key (PEM) used to verify JWTs (`algorithms: ['RS256']`). **Required** for login-adjacent flows (`checkSessionExpiration`, `/renew`, `IngeniumUser.decodeAccessJwt`) to work — without it `jwt.verify` throws. |
| `AUTHORING_JS_BUNDLE`, `DASHBOARD_JS_BUNDLE`, `EXECUTE_AS_RUN_JS_BUNDLE`, `EXECUTION_JS_BUNDLE`, `EXECUTIONS_JS_BUNDLE`, `PROJECT_CONFIG_JS_BUNDLE`, `VENUE_DETAIL_JS_BUNDLE`, `REPORTING_JS_BUNDLE`, `HEADER_JS_BUNDLE`, `ADMIN_JS_BUNDLE`, `SEARCH_JS_BUNDLE` | plain filenames matching `npm run build:single-node` output (e.g. `dashboard-bundle.js`) | Which built bundle filename each EJS shell references. Override when a build produces content-hashed filenames — see `js_filename_to_env.sh`. |

Non-env, hardcoded in `config/index.js`:
- `CLIENT_DIST_DIR`, `LEGACY_STATIC_DIR`, `VIEWS_DIR` — filesystem paths relative to the config
  module's own location.
- `LOGIN_URL` (`/login/`), `LOGIN_REDIRECT_AFTER_LOGIN` (`/`),
  `LOGIN_EXEMPT_PATHS` (regex array).
- `SESSION_WARNING_EXPIRATION_IN_SECONDS` (`70`), `SESSION_RENEW_IAT_AFTER_MINS` (`3`) — see
  [Data-Flow](Data-Flow.md#token-renewal) for the caveat that no client-side consumer of these
  was located in this repo.
- `AUTH_SECRET_KEY_ALGORITHMS` (`['RS256']`).

### Command string format

`CMD_STRING_FORMAT` is rendered client-side by
`src/client/src/modules/elements/executable/cmd/cmd-string-format.js`,
shared by both CMD Lookup entry points (`CmdEntry.vue` and
`custom_script/CustomScriptInputArg.vue`). The default reproduces the legacy hardcoded
`STEM,arg1,arg2` behavior.

| Token | Meaning |
|---|---|
| `{{STEM}}` | Command stem (e.g. `PWR_CTRL`). |
| `{{PRE_ARGS}}...{{/PRE_ARGS}}` | Only rendered when at least one argument is present — use it for a leading separator/bracket that must not appear on zero-argument commands. |
| `{{POST_ARGS}}...{{/POST_ARGS}}` | Same, but placed after the `ARGS` loop. |
| `{{#ARGS}}...{{/ARGS}}` | Repeated once per argument (regular args first, then repeat-arg sections flattened). |
| `{{ARG_NAME}}` / `{{ARG_VALUE}}` | Current argument's name/value — only valid inside the `ARGS` loop. |
| `{{SEP}}...{{/SEP}}` | Inside the `ARGS` loop: literal text joined **between** arguments only, never before the first or after the last. |
| everything else | Literal text, copied as-is. |

Examples, for `STEM=PWR_CTRL` with arguments `SUBSYSTEM=SSPA` and `STATE=ON`:

| Format | With args | No args |
|---|---|---|
| `{{STEM}}{{PRE_ARGS}},{{/PRE_ARGS}}{{#ARGS}}{{ARG_VALUE}}{{SEP}},{{/SEP}}{{/ARGS}}` (default) | `PWR_CTRL,SSPA,ON` | `PWR_CTRL` |
| `{{STEM}} {{PRE_ARGS}}{ {{/PRE_ARGS}}{{#ARGS}}"{{ARG_NAME}}": "{{ARG_VALUE}}"{{SEP}}, {{/SEP}}{{/ARGS}}{{POST_ARGS}} }{{/POST_ARGS}}` | `PWR_CTRL { "SUBSYSTEM": "SSPA", "STATE": "ON" }` | `PWR_CTRL` |
| `{{STEM}}{{#ARGS}} {{ARG_NAME}}={{ARG_VALUE}}{{/ARGS}}` | `PWR_CTRL SUBSYSTEM=SSPA STATE=ON` | `PWR_CTRL` |

Re-opening the Lookup modal parses an existing command string back into a stem + arguments
using the same format (`parseCmdString`), so custom formats round-trip. Two caveats:

- A format with no literal text between `{{STEM}}` and the first argument (no `{{PRE_ARGS}}`
  block and no separator either) cannot be re-parsed — the boundary is ambiguous and the whole
  string is treated as the stem. Always keep some literal text there.
- An argument value that itself contains the `{{SEP}}` text (e.g. a comma, under the default
  format) will be split into two arguments when re-parsed. Pick a separator that cannot appear
  inside argument values.

Quote the value in `.env` (`CMD_STRING_FORMAT="..."`) so that `#` inside the template is not
treated as a dotenv comment.

## Client (`src/client`)

The client does **not** read `process.env` at runtime in the browser — webpack's `DefinePlugin`
bakes a fixed object into the bundle **at build time**, selected by `NODE_ENV` at build time
(not by any `.env` file):

```js
// webpack.config.js
new webpack.DefinePlugin({
    'process.env': isProduction ? config.prod : config.dev
})
```

`config/index.js` re-exports `dev.env.js`, `test.env.js`, `prod.env.js`:

| Env preset | `NODE_ENV` | `VENUES_URL` | `DEBUG_MODE` | Notes |
|---|---|---|---|---|
| `prod.env.js` | `"production"` | `https://<hostname>/core_server/api/v5/venues` | `false` | Base config. |
| `dev.env.js` | `"development"` | `http://<hostname>/core_server/api/v5/venues/` | `true` | `merge(prodEnv, {...})` — overrides `NODE_ENV`/`VENUES_URL`/`DEBUG_MODE`. |
| `test.env.js` | `"test"` | (inherits `dev.env.js`) | (inherits) | `merge(devEnv, { NODE_ENV: '"test"' })`. |

Which preset is used depends on the **npm script**, not a `.env` file:

| Script | `NODE_ENV` used for webpack `DefinePlugin` (`config/index.js` branch) | Karma `NODE_ENV` |
|---|---|---|
| `npm run dev` | `production` → `config.prod` (minified, prod-mode Vue - see note below) | — |
| `npm run dev:unminified` | `development` → `config.dev` (unminified, full Vue dev warnings/Devtools) | — |
| `npm run build` | `production` → `config.prod` | — |
| `npm run build:single-node` | `development` → `config.dev` (dev-mode, unminified - see note below) | — |
| `npm test` | — | `production` (karma.test.conf.js) |
| `npm run test:watch` | — | `test` (karma.dev.conf.js) |
| `npm run test:coverage` | — | `test` (karma.coverage.conf.js) |

**Note:** `npm run dev` deliberately builds the client with `NODE_ENV=production` (still in
webpack `--watch` mode, so it rebuilds on save) instead of `development`. Vue's dev-mode runtime
checks and lack of minification/scope-hoisting scale badly with large procedures/executions
(hundreds-thousands of steps) - enough to look like a multi-second UI regression that isn't
actually present in a real production build. Use `npm run dev:unminified` (same watch-mode
rebuild loop) when you need Vue's dev warnings, unminified stack traces, or the Vue Devtools
browser extension to work.

**Note (historical bug, fixed):** `build:single-node` sets webpack's own `NODE_ENV=development`
(controls `mode: 'development'`/`devtool: false` in `webpack.config.js`, and Vue's own dev-mode
runtime checks). The `Dockerfile` single-container image previously built the client with
`npm run build:single-node` by mistake (this predates the Node/Express migration - the same
`NODE_ENV=development` script was used by the old Django-based Dockerfile too), so real
deployments were unknowingly shipping an unminified, `config.dev`-configured bundle (with
`VENUES_URL` using `http://`, not `https://`, and no production-mode Vue optimizations - very
noticeable as UI lag on large procedures/executions). The `Dockerfile` now uses `npm run build`
instead. `build:single-node` itself is still used for quick local non-watch builds (see
`src/server/src/config/index.js`'s `*_JS_BUNDLE` defaults, which assume its plain/non-timestamped
filenames) - just no longer wired into the production image.

Beyond these baked constants, most **runtime** client configuration is really about which
**backend origin the browser can reach**, which is entirely determined by the reverse-proxy
layer (NGINX in production, `clientProxy.js` in local dev) — see
[Architecture](Architecture.md#big-picture). The client itself has no equivalent of the
server's `.env`.

## Root-level scripts (`package.json`)

The repo-root `package.json` has no configuration of its own — it only orchestrates the two
sub-projects (`npm run dev`, `npm run install:all`, `npm test`, `npm run test:coverage` each
run the corresponding script in both `src/client` and `src/server` via `--prefix`). See
[Development](Development.md).

## Related pages

- [Development](Development.md) — how these variables get set for local dev.
- [CI-CD](CI-CD.md) — how CI runs without a real `.env` (client/server unit tests do not require
  live backend URLs; see each project's test setup).
- [Security](Security.md) — the security-relevant subset (`CSRF_SECRET`, `PUBLIC_PEM`) in depth.
