# Testing

[← Home](Home.md) · See also [Development](Development.md) · [CI-CD](CI-CD.md)

Client and server have **completely separate test stacks** — Karma+Jasmine for the Vue client,
Node's built-in `node:test` runner for the Express server. There are no end-to-end/integration
tests in this repository as currently structured: no `e2e/` directory exists under
`src/client/test/` (only `unit/` and `test-reports/`), and no `nightwatch` (or similar E2E
framework) dependency exists in `src/client/package.json`.

## Client tests

**Stack:** Karma test runner, `karma-jasmine` (Jasmine 5 core), `karma-webpack` (specs are
webpack-bundled via `webpack.test.js` before running), `@vue/test-utils` for component
mounting, `sinon` for stubs/spies, `jsdom` (headless) or a real `Chrome` browser depending on
config.

**Location:** `src/client/test/unit/specs/**/*.spec.js`,
organized to mirror `src/modules/` (`api/`, `authoring/`, `common/`, `dashboard/`, `directives/`,
`elements/`, `execution/`, `project-config/`, `reporting/`, `venue-detail/`, plus a few
top-level component specs).

**Bootstrap:** `test/unit/setup.js` runs before every spec file (not webpack-processed, so no
ES module syntax). It silences `console.error`/`console.warn` (many API modules intentionally
log caught errors — see [Error-Handling](Error-Handling.md#1-api-layer-error-swallowing))
and replaces `window.XMLHttpRequest` with an inert stub so no spec can accidentally leak a real
network call past test teardown (specs are expected to stub `transport`/`*Api` methods directly
instead).

### Commands

Run from `src/client/`:

```sh
npm test            # karma.test.conf.js, NODE_ENV=production, jsdom, --single-run — what CI runs
npm run test:watch   # karma.dev.conf.js, NODE_ENV=test, real Chrome, watch mode + HTML reporter
npm run test:coverage # karma.coverage.conf.js, NODE_ENV=test, jsdom, --single-run, full coverage reports
```

All three scripts run `../../gen_version.sh` first (same as the build scripts) and set
`NODE_OPTIONS=--max-old-space-size=8192` — the test bundle is large enough that this repo's
scripts always raise Node's heap limit for Karma runs.

**Scoping to a subset of specs:** `karma.test.conf.js` and `karma.coverage.conf.js` both honor
`SPEC_GLOB`:

```sh
SPEC_GLOB="specs/common/*.spec.js" NODE_ENV=test NODE_OPTIONS=--max-old-space-size=8192 \
  ./node_modules/.bin/karma start test/unit/karma.coverage.conf.js --single-run
```

**Known exclusion:** `specs/execution/IngElementWrapper.spec.js` is excluded from both
`karma.test.conf.js` and `karma.coverage.conf.js` because jsdom does not implement the
`DataTransfer` API that drag-and-drop tests need — it only runs under a real browser (i.e. via
`test:watch`'s Chrome launcher), if at all.

### Coverage output

`karma.coverage.conf.js` writes to `../test-reports/coverage`
(i.e. `src/client/test/test-reports/coverage/`, gitignored): `text-summary` to stdout, an HTML
report (`html/`), `lcov.info`, and `coverage-summary.json`. `karma.test.conf.js` (the CI/`npm
test` config) additionally writes a JUnit XML report (`unit-junit.xml`) and a
`json-summary`-only coverage file to `../test-reports`.

## Server tests

**Stack:** Node's built-in `node:test` module (no third-party test framework) +
`node:assert`, `supertest` for HTTP-level route assertions.

**Location:** `src/server/test/**/*.test.js`, mirroring
`src/` exactly: `config/index.test.js`, `lib/{asyncHandler,httpClient,ingeniumUser}.test.js`,
`middleware/{auth,csrf,loginRequired,session,templateLocals}.test.js`,
`routes/{authService,clientProxy,core,dictService,fileServer,login,pages}.test.js`.

**Helpers:** `test/helpers/loadConfig.js` and `loadWithEnv.js` re-`require()` the config module
under controlled env vars (since `config/index.js` reads `process.env` once at module-load
time, tests need to reset Node's module cache to exercise different env combinations).

### Commands

Run from `src/server/`:

```sh
npm test             # node --test --test-force-exit "test/**/*.test.js"
npm run test:coverage # node --test --experimental-test-coverage --test-coverage-exclude="test/**" --test-force-exit "test/**/*.test.js"
```

`--test-force-exit` ensures the process exits even if something (e.g. an open proxy/WS
listener) would otherwise keep the event loop alive.

## CI enforcement

Both `npm run test:coverage` invocations (client and server) are run as separate jobs
(`test-client`, `test-server`) in `.github/workflows/ci.yml` on every push/PR to `devel`/`main`
— see [CI-CD](CI-CD.md). Docker images are only built after **both** test jobs succeed.

## Writing new tests

- **Client component specs**: use `@vue/test-utils`'s `shallowMount`/`mount`, provide a real or
  minimal `Vuex.Store` (most element/store specs construct `new Vuex.Store({ state, getters,
  mutations, actions })` directly rather than mounting the full app store), stub `sinon` against
  `transport`/the relevant `api/*.js` module rather than letting real HTTP happen (enforced in
  practice by the inert `XMLHttpRequest` in `setup.js`).
- **Server route specs**: use `supertest` against an app instance built by `createApp()`, with
  `test/helpers/loadWithEnv.js` to control which backend URLs/secrets are "configured" for that
  test.
- Follow existing sibling spec files for conventions (mock shapes, `mapGetters`/`mapActions`
  stubbing patterns) before introducing new ones.

## Related pages

- [CI-CD](CI-CD.md) — exact CI job definitions.
- [Error-Handling](Error-Handling.md) — why `console.error`/`console.warn` are silenced in
  `setup.js`.
- [Development](Development.md) — local dev commands these test scripts sit alongside.
