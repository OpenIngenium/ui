# Repository Structure

[← Home](Home.md) · See also [Architecture](Architecture.md)

## Top level

```
ui/
├── .github/workflows/ci.yml       CI pipeline (GitHub Actions)
├── Dockerfile                     Builds client + Node/Express server into one "ui" image
├── Dockerfile-nginx-https         Pure NGINX (TLS) reverse proxy in front of ui; no client build
├── nginx.conf                     Base NGINX config (includes conf.d/*.conf)
├── ingenium-https.conf            NGINX conf template for the "full" HTTPS deployment
├── eval_file_prod.sh               envsubst wrapper used by the NGINX HTTPS Dockerfile
├── gen_version.sh                 Writes src/client/src/assets/ing_version.json from git state
├── js_filename_to_env.sh          Converts built bundle filenames into *_JS_BUNDLE env exports
├── package.json                   Root convenience scripts (dev/install/test both halves)
├── README.md                      Public-facing setup/usage doc
├── docs/                     This DeepWiki
└── src/
    ├── client/                    Vue 2 SPA(s) — see below
    └── server/                    Express server — see below
```

## `src/server/` — Express BFF

```
src/server/
├── server.js                  Entry point: loads dotenv, creates app, listens, wires WS upgrade
├── package.json                dependencies: express, axios, jsonwebtoken, csrf-csrf, cookie-parser,
│                                cors, ejs, http-proxy-middleware, morgan, dotenv
├── .env.example                 Template for local .env (see Configuration.md)
├── src/
│   ├── app.js                   createApp(): assembles the full middleware/route pipeline
│   ├── config/index.js          Central env-driven config module (mirrors old Django settings/base.py)
│   ├── middleware/
│   │   ├── auth.js               attachUser — derives req.user from access_token cookie
│   │   ├── session.js            checkSessionExpiration — force-logout on expired/invalid JWT
│   │   ├── loginRequired.js      Redirects unauthenticated requests to /login
│   │   ├── templateLocals.js     Injects shared EJS locals (title, bundle names, footer)
│   │   └── csrf.js               Double-submit-cookie CSRF protection (csrf-csrf)
│   ├── routes/
│   │   ├── login.js              /login, /logout, /renew (talks to Auth service)
│   │   ├── pages.js               SPA page-shell routes (one per client bundle)
│   │   ├── core.js                /core/* — execution update/close/resume/halt proxy endpoints
│   │   ├── dictService.js         /dictionary_service/* — cmd/evr/eha lookups, parser updates
│   │   ├── authService.js         /authentication_service/* — roles CRUD, LDAP user/group lookup
│   │   ├── fileServer.js          /file_server/* — proxies uploaded file content
│   │   └── clientProxy.js         /core_server, /auth_server, /dict_server, /report_server,
│   │                              /search_server, /execution_monitor — direct
│   │                              browser-facing reverse proxies (dev-mode stand-in for NGINX)
│   ├── lib/
│   │   ├── httpClient.js          axios wrapper for calling backend services (redacted logging)
│   │   ├── ingeniumUser.js        IngeniumUser / IngeniumAnonymousUser — JWT-backed user model
│   │   └── asyncHandler.js        Wraps async route handlers so rejections reach next(err)
│   └── views/
│       ├── login.ejs, 403.ejs, 404.ejs
│       ├── partials/head.ejs, foot.ejs
│       └── spa/*.ejs              One shell template per client bundle (dashboard, authoring, ...)
├── static/                    Legacy static assets (css/fonts/images/js/lib, sound effects) —
│                                served alongside client/dist under /static
└── test/                      node:test suites mirroring src/ 1:1 (config, lib, middleware, routes)
```

Full behavioral breakdown: [Server](Server.md).

## `src/client/` — Vue 2 multi-SPA application

```
src/client/
├── webpack.config.js          Production/dev build config — defines the 11 entry bundles
├── webpack.test.js            Karma/webpack config used only for unit tests
├── config/{dev,test,prod}.env.js   process.env values baked in per NODE_ENV via DefinePlugin
├── package.json                scripts: dev, build, build:single-node, test, test:watch, test:coverage
├── .babelrc                    @babel/preset-env + lodash/optional-chaining/nullish-coalescing plugins
├── timestamp.js                 Post-build helper invoked by `npm run build`
├── dist/                       Build output (gitignored; consumed by src/server or NGINX)
├── test/unit/                  Karma + Jasmine specs (see Testing.md)
└── src/
    ├── api/                    Axios-based API layer, one module per backend service
    ├── assets/                 Logo, generated ing_version.json, global styles
    └── modules/                 One directory per SPA + shared "common" and "elements" libraries
        ├── common/               Shared Vue components, Vuex modules, mixins, utils (see Client.md)
        ├── elements/             Shared procedure "element" (step) component library
        │   ├── executable/         Executable step types (cmd, wait-eha, custom_script, ...)
        │   ├── non-executable/     Structural types (section, paragraph, run-procedure, ...)
        │   └── mixins/             Mode-specific mixins (authoring / execution / as-run)
        ├── dashboard/            Venue dashboard SPA
        ├── authoring/            Procedure authoring SPA
        ├── execution/            Live execution SPA
        ├── executions/           Executions list SPA
        ├── as-run/               As-run (post-execution playback) SPA
        ├── venue-detail/         Venue detail SPA
        ├── project-config/       Dictionary/custom-script project configuration SPA
        ├── reporting/            Report generation SPA
        ├── search/               Cross-execution search SPA
        ├── admin/                Admin (permissions, venues, venue groups, labels) SPA
        └── header/               Shared top navigation bar SPA (mounted independently)
```

Full behavioral breakdown: [Client](Client.md).

## How the two halves relate

- The **server never imports client code** and vice versa — they are two separate Node
  packages with independent `package.json`/`package-lock.json`.
- The link is filesystem-only: `config.CLIENT_DIST_DIR` in
  `src/server/src/config/index.js:50` points at
  `../../../client/dist` relative to the server, i.e. it expects the client to already be built
  into `src/client/dist` next to `src/server`. The Dockerfile enforces this build order (client
  builds in an earlier stage, server image just copies `client/dist`).
- The server's EJS templates (`views/spa/*.ejs`) reference the built bundle filenames via
  `res.locals`/config (e.g. `DASHBOARD_JS_BUNDLE`), so the two halves agree on filenames through
  environment variables set at deploy time (see `js_filename_to_env.sh` and
  [Configuration](Configuration.md)).

## Related pages

- [Architecture](Architecture.md) — how these pieces interact at runtime.
- [Server](Server.md), [Client](Client.md) — per-half deep dives.
- [Development](Development.md) — how to build/run both halves locally.
