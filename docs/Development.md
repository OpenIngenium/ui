# Development

[← Home](Home.md) · See also [Configuration](Configuration.md) · [Testing](Testing.md) · [Troubleshooting](Troubleshooting.md)

> This page documents the **current** (Node/Express + Vue) toolchain in more depth than the
> top-level [`README.md`](../../README.md)'s Quick Start — see [Architecture](Architecture.md)
> for why this server replaced a previous Django server.

## Prerequisites

- **Node.js `22.23.4`** — pinned in `.nvmrc` and
  required by every `package.json`'s `"engines": { "node": ">=22" }`
  (root, `src/client`, `src/server`). If you use `nvm`: `nvm use` from the repo root.
- Access to the backend microservices (Core, Auth, Dictionary, Execution, Report, Search,
  Execution Monitor, Venue Config, File Server) — either a local docker-compose stack (not part
  of this repository — see [Architecture](Architecture.md#deployment-topologies-observed-from-dockerfiles))
  or CI-shared instances.

## Install

From the repo root:

```sh
npm run install:all
```

This runs `npm install --prefix src/client && npm install --prefix src/server`
(`package.json:7`). **Note:** CI installs the client
with `npm ci --legacy-peer-deps` (see `.github/workflows/ci.yml:38`) — if you hit peer-dependency
resolution errors with a plain `npm install` in `src/client`, add `--legacy-peer-deps`.

## Configure the server

```sh
cp src/server/.env.example src/server/.env
# edit src/server/.env: set CORE_API_URL, AUTH_API_URL, DICT_API_URL, PUBLIC_PEM, etc.
```

See [Configuration](Configuration.md#server-srcserver) for the full variable reference. At
minimum, `PUBLIC_PEM`/`AUTH_PUBLIC_PEM` is required for login and session checks to function
(`jwt.verify` throws without it).

## Run both halves together (root convenience script)

```sh
npm run dev
```

Runs `concurrently -n client,server -c blue,green "npm run dev --prefix src/client" "npm run dev --prefix src/server"`
(`package.json:6`) — i.e. webpack watch mode for the
client and `nodemon` for the server, in one terminal with color-coded, labeled output.

## Run each half independently

**Client** (`src/client`):

```sh
npm run dev               # webpack --progress --watch, NODE_ENV=production (minified, prod-mode Vue - see note below)
npm run dev:unminified    # webpack --progress --watch, NODE_ENV=development (unminified, full Vue dev warnings)
npm run build              # webpack --progress, NODE_ENV=production, then node timestamp ./dist/
npm run build:single-node  # webpack --progress, NODE_ENV=development (see Configuration.md note), then timestamp
```

**Note:** `dev` intentionally builds the client with `NODE_ENV=production` (still in `--watch`
mode, so it rebuilds on save) rather than `development`. Vue's dev-mode runtime checks (prop
validation, reactive dev-warning setters, the Devtools hook) and the lack of minification/scope
hoisting get dramatically more expensive as a procedure/execution grows to hundreds-thousands of
steps — enough to look like multi-second UI lag that isn't present in an actual production
build. Use `dev:unminified` (and the root `npm run dev:unminified`) when you specifically need
Vue's dev-mode warnings, unminified stack traces, or the Vue Devtools extension to work.

All three scripts run `../../gen_version.sh` first, which writes
`src/client/src/assets/ing_version.json` from the current git branch/commit (used for a version
display somewhere in the UI — the file itself is regenerated on every build, so don't hand-edit
it).

**Server** (`src/server`):

```sh
npm start   # node server.js
npm run dev  # cross-env NODE_ENV=development nodemon --watch . --ext js,ejs,env server.js
```

`nodemon` watches `.js`, `.ejs`, and `.env` files, so editing a view template or config also
restarts the server.

## Full local topology

1. Start the backend microservices (via a local docker-compose stack outside this repo, or
   point at CI instances per the env vars shown in `.env.example`).
2. `npm run dev --prefix src/server` (or `npm start` for a non-watching run).
3. `npm run dev --prefix src/client` in another terminal (webpack watch — rebuilds `dist/` on
   change; the server serves whatever is currently in `dist/`, so a hard refresh after a
   rebuild is required — there is no HMR dev server in this setup).
4. Access the app at whatever port/host your NGINX layer (if any) or the server directly
   (`http://localhost:5000` by default, per `PORT`) exposes.

If running **without** NGINX in front (hitting the Express server directly), the server's own
`clientProxy.js` reverse-proxies the browser-direct API prefixes (`/core_server`, etc.) so the
same client code works unmodified — see [Architecture](Architecture.md#big-picture).

## Docker builds

```sh
# Node/Express serves everything (client bundle + pages + proxy) — closest to Dockerfile-driven single-container deploys
docker build -t ingenium_ui .

# NGINX (TLS) pure reverse proxy in front of the ui container (no client build in this image)
docker build -f Dockerfile-nginx-https -t ingenium_ui_nginx .
```

These are exactly the two builds CI runs after tests pass (`.github/workflows/ci.yml`'s
`docker` job) — see [CI-CD](CI-CD.md).

## Linting

The client's ESLint config lives inline in
`src/client/package.json` (`eslintConfig` key) —
`eslint:recommended` + `plugin:vue/essential`, with `no-var`/`semi`/`indent` as errors and
`no-console`/`no-debugger`/`no-unused-vars` as warnings. `.vue` files get 4-space
`vue/script-indent` and `vue/html-self-closing` overrides. No `npm run lint` script is defined in
`src/client/package.json`; point your editor's ESLint integration at this inline config, or run
directly: `npx eslint src/client/src --ext .js,.vue` (not a defined script — construct as
needed). **Unknown / not documented:** whether the server half (`src/server`) has any lint
configuration — none was found in `src/server/package.json`.

## Debugging

- **Server**: standard Node debugging (`node --inspect server.js`, or attach your editor's Node
  debugger to the `nodemon`-spawned process). `morgan('dev')` logging is enabled automatically
  when `NODE_ENV !== 'production'` (`app.js:27`).
- **Client**: `webpack.config.js` emits source maps in production (`devtool: 'source-map'`) and
  none in development (`devtool: false`, per `isProduction` check) — use browser dev tools
  against the unminified dev build, or the source-mapped prod build.
- **Debug logging toggle**: set `UI_ENABLE_DEBUG_INFORMATION=true` in the server's `.env` to get
  verbose upstream request/response status logging from `httpClient.js` and the proxy routes
  (never logs headers/bodies/secrets — see [Security](Security.md#credential-safe-logging)).

## Related pages

- [Configuration](Configuration.md) — every environment variable referenced above.
- [Testing](Testing.md) — how to run the test suites for each half.
- [CI-CD](CI-CD.md) — how these same commands run in GitHub Actions.
