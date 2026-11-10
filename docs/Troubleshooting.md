# Troubleshooting

[← Home](Home.md) · See also [Development](Development.md) · [Configuration](Configuration.md)

Known gaps and gotchas, each grounded in a specific file/comment in the repository — not
speculative scenarios.

## `npm install` fails in `src/client` with peer-dependency errors

CI installs the client with `npm ci --legacy-peer-deps`
(`.github/workflows/ci.yml:38`), and the production `Dockerfile`s do the same
(`RUN npm ci --legacy-peer-deps ...`). If a plain `npm install`/`npm ci` in `src/client` fails
on peer-dependency resolution, add `--legacy-peer-deps` — this is the documented, CI-verified
install method, not a workaround you're introducing yourself.

## Login/session checks fail with a JWT verification error

`IngeniumUser.decodeAccessJwt()` (`src/server/src/lib/ingeniumUser.js:18-25`) calls
`jwt.verify(token, config.AUTH_PUBLIC_PEM, { algorithms: ['RS256'] })`. If `PUBLIC_PEM` (or its
alias `AUTH_PUBLIC_PEM`) is unset or wrong in your `.env`, this throws for *every* authenticated
request, not just login — `checkSessionExpiration` will treat the failure as an expired/invalid
session and force a logout redirect. See
[Configuration](Configuration.md#server-srcserver) and
[Security](Security.md#jwt-verification).

## Session renewal wiring unclear

The server exposes `GET /renew`
(`src/server/src/routes/login.js:117-148`) and exposes
`SESSION_WARNING_EXPIRATION_IN_SECONDS` to every authenticated EJS render
(`middleware/templateLocals.js:14`), but no caller of `/renew` and no consumer of that local was
found in `src/client/src` or in `src/server/src/views/partials/head.ejs`. If session-expiry
warnings/auto-renewal don't appear to work, the wiring may live in the legacy pre-built static
asset `src/server/static/js/global.min.js`, which was not source-inspected as part of this
documentation effort (it is a bundled third-party/legacy artifact, not first-party source). See
[Data-Flow](Data-Flow.md#token-renewal).

## Dictionary file upload endpoints return 404

`src/server/src/routes/dictService.js` only implements cmd/evr/eha **lookups**, dictionary
**delete**, and parser **updates**. A code comment (`dictService.js:96-100`) explicitly notes
that the old Django dictionary/SSE/flight-dictionary **upload** endpoints (multipart `.xml`/
`.tar` file uploads) were intentionally not ported, pending a dependency decision (e.g.
`multer`) and testing against the real Dictionary service. If a project-configuration
dictionary-upload flow 404s against `/dictionary_service/...`, this is why — check whether the
client actually calls the Dictionary service directly (`/dict_server/...`, per
[API-Reference](API-Reference.md#client-api-layer)) instead before assuming it's broken.

## A drag-and-drop spec is skipped / fails under headless test runs

`test/unit/specs/execution/IngElementWrapper.spec.js` is explicitly excluded in both
`karma.test.conf.js` and `karma.coverage.conf.js` because **jsdom does not implement the
`DataTransfer` API** that drag-and-drop interactions rely on. It only has a chance of running
under `npm run test:watch` (real Chrome via `karma.dev.conf.js`). Don't assume a failing
`npm test` run means drag-and-drop is broken — that spec isn't part of that run at all.

## `build:single-node` ships a non-production webpack build

`src/client/package.json`'s `build:single-node` script sets `NODE_ENV=development` for webpack
(unminified, `devtool: false`, and — via `config/dev.env.js` — an `http://` `VENUES_URL`). This
script is used by `Dockerfile`, a Docker-built image. If a "single-node" deployment looks
unminified or uses `http://` where you
expected `https://`, this is the documented (in code, via the script name/config split) but
unexplained cause — see [Configuration](Configuration.md#client-srcclient) for the exact
`NODE_ENV`/preset mapping. No rationale for this choice is recorded in the repository; treat it
as an area to confirm intent before "fixing".

## `VERIFY_REQUESTS_SSL` doesn't seem to affect anything

This config value is parsed in `src/server/src/config/index.js` but was not found wired into
`lib/httpClient.js`'s axios calls. If you need to actually disable/enable TLS certificate
verification for server-to-backend calls, check `httpClient.js` directly rather than assuming
this env var controls it — see [Security](Security.md#tls).

## Related pages

- [Development](Development.md) — the current, accurate setup process.
- [Configuration](Configuration.md) — full env var reference for both halves.
- [Security](Security.md) — JWT/CSRF specifics referenced above.
