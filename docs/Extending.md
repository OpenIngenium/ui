# Extending / Contribution Guide

[← Home](Home.md) · See also [Client](Client.md) · [Server](Server.md) · [Testing](Testing.md)

**Unknown / not documented:** this repository has no `CONTRIBUTING.md` and no PR template. The
only enforced contribution gate observed is the CI workflow
(`.github/workflows/ci.yml`) — client and server test suites must pass before the Docker build
validation job runs. Branch protection rules, review requirements, and commit conventions are
not established by anything in this repo.

## Adding a new element (step) type

The element system (see [Client](Client.md#the-element-system-moduleselements)) is the most
common extension point. To add a new **executable** step type, following the existing pattern
(e.g. `modules/elements/executable/wait-eha/`):

1. Create a folder under `src/client/src/modules/elements/executable/<your-step>/` with at
   least `<YourStep>Element.vue` (and `<YourStep>Entry.vue` if it needs a compact/tabular
   representation, following siblings like `wait-eha/WaitEhaElement.vue` +
   `WaitEhaEntry.vue`).
2. Export both from `modules/elements/executable/index.js` (add the import + add to the default
   export object).
3. Register the component **per mode** in each of the three SPA entry files that render
   elements, matching the existing registration lines for a similar type:
   - `modules/authoring/authoring.js` — `Vue.component('your-step-element', Vue.extend(elementAuthoringMixin).extend(executable.YourStepElement))`
   - `modules/execution/execution.js` — same pattern with `elementExecutionMixin`
   - `modules/as-run/as-run.js` — same pattern with the as-run equivalent mixin (check
     `modules/as-run/as-run.js` for its exact mixin import name)
4. If the step needs dedicated Vuex state (like `evr-store.js`, `cmd-store.js`, or
   `wait-eha-store.js` under `elements/executable/<type>/`), register it as a new module in
   **both** `modules/common/store.js` (shared store, used by execution/dashboard/etc.) and
   `modules/authoring/store.js` (authoring has its own store — see
   [Client](Client.md#shared-store-modulescommonstorejs)).
5. Add the new `step_type` to whatever server-side/dictionary-driven step palette definition
   backs `stepPaletteBuiltIn` (consumed by `elem_types.js::getElementDef`) — this repo only
   consumes that palette via the Core API; the palette's source of truth is outside this repo
   unless it's a **custom script** step (those come from the Dictionary/Core service's
   `palette_category`/`step_id` metadata, normalized client-side by
   `elem_types.js::augmentStepWithCustomElementMap`).
6. Add a spec under `test/unit/specs/execution/` or `.../authoring/` following an existing
   sibling spec for the mounting/store-stubbing pattern (see [Testing](Testing.md#client-tests)).

For a **non-executable** (structural) type, follow the same steps against
`modules/elements/non-executable/` and its `index.js` instead.

## Adding a new SPA page/bundle

1. Add a new module directory under `src/client/src/modules/<name>/` with an entry file
   (`<name>.js`) that mirrors an existing simple one (e.g. `modules/venue-detail/venue-detail.js`)
   — instantiate `VueRouter` + `new Vue({ el, router, store, render })`.
2. Register the new entry point in
   `src/client/webpack.config.js:13-25`
   (`entry: { ..., 'your-page': './src/modules/your-page/your-page.js' }`) — the emitted
   filename will be `your-page-bundle.js`.
3. Add an EJS shell in `src/server/src/views/spa/your_page.ejs` (copy an existing minimal one,
   e.g. `venue_detail.ejs`), including the mount element your entry file's `el` selector
   targets.
4. Add a route in `src/server/src/routes/pages.js`
   that renders it, passing the bundle filename as a local (add a matching
   `YOUR_PAGE_JS_BUNDLE` entry to `src/server/src/config/index.js` and `.env.example`, following
   the existing `*_JS_BUNDLE` pattern — see [Configuration](Configuration.md#server-srcserver)).
5. If the page needs auth, it's covered automatically by `loginRequired` since `pagesRoutes` is
   mounted after it in `app.js` — no per-route change needed unless the page should be public
   (in which case add its path to `config.LOGIN_EXEMPT_PATHS`).

## Adding a new server route / proxy target

- **A new backend microservice the browser calls directly:** add a `*_API_URL` env var to
  `src/server/src/config/index.js` (deriving a `*_ORIGIN` via `originOf()`), add a
  `.env.example` entry, and add a `mount(app, '/your-prefix', config.YOUR_SERVER_ORIGIN)` call
  in `routes/clientProxy.js::mountClientProxyRoutes`. Also add the equivalent
  `location /your-prefix/ { proxy_pass ...; }` block to the NGINX conf templates
  (`ingenium-https.conf`, `ingenium-single-node*.conf`) so production parity is maintained —
  the Node proxy only stands in for NGINX in topologies where NGINX isn't present.
- **A new server-mediated endpoint** (server attaches the Bearer token and calls a backend
  service itself, rather than letting the browser call it directly): add a handler to the
  relevant `routes/*.js` file (or a new file, registered in `app.js`), wrapped in
  `asyncHandler()`, using `getRequest`/`postRequest`/etc. from `lib/httpClient.js` with
  `token: req.user.getToken()`. Add a matching test in `src/server/test/routes/`.

## Adding client API functions

Add the URL builder to the relevant `src/client/src/api/*-urls.js` file first, then a function
in the matching `src/client/src/api/*.js` module that calls `transport` against it — follow the
try/catch/return-sentinel pattern described in
[Error-Handling](Error-Handling.md#1-api-layer-error-swallowing) for consistency with the rest
of that file, unless you have a specific reason to throw instead (document why if you deviate).

## Adding tests

See [Testing](Testing.md) for the frameworks/commands. In short: client specs go under
`src/client/test/unit/specs/`, mirroring the `src/modules/` path of the code under test; server
specs go under `src/server/test/`, mirroring `src/server/src/` exactly, one `*.test.js` per
source file.

## Related pages

- [Client](Client.md) — full element/mixin/store architecture referenced above.
- [Server](Server.md) — route/middleware structure referenced above.
- [Configuration](Configuration.md) — env vars to add alongside new proxy targets/bundles.
