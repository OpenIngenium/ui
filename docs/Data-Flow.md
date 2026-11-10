# Data Flow

[← Home](Home.md) · See also [Architecture](Architecture.md) · [Server](Server.md) · [Client](Client.md) · [Security](Security.md)

Concrete, code-traced workflows through the system. Each uses actual function/file names so you
can follow along in the source.

## Login

```text
Browser GET /login
→ routes/login.js  GET /login            (public — exempt from loginRequired)
→ res.render('login', { next, login_errors, secret_label, ... })

Browser submits form → POST /login  { username, password }
→ middleware chain: attachUser (no cookie yet → IngeniumAnonymousUser) → checkSessionExpiration (no-op)
  → templateLocals → attachCsrfToken/doubleCsrfProtection (validates the form's _csrf field)
→ routes/login.js  POST /login
    - 400-equivalent: missing username/password → re-render with "Missing Username or Password"
    - getRequest(AUTH_LOGIN_URL, { auth: {username,password}, headers: {X-AUTH-METHOD} })
    - non-200 from Auth service → re-render with body.message || "Authentication failed"
    - network failure → re-render with a generic "Unable to reach authentication service" message
      (raw axios error never surfaced)
    - 200 → new IngeniumUser(body.access_token); set cookies:
        access_token, access_token_timeout, expiration_date
    - res.redirect(next || '/')
```

See [Security](Security.md#login-jwt-issuance) for exactly what's inside the JWT and how it's
later verified.

## Authenticated page load (any SPA)

```text
Browser GET /authoring/:procedureId/:version  (or any protected page route)
→ attachUser        (access_token cookie present → IngeniumUser)
→ checkSessionExpiration
    - req.user.getUsername() triggers jwt.verify(access, AUTH_PUBLIC_PEM, {algorithms:['RS256']})
    - TokenExpiredError / JsonWebTokenError → logoutRequest(req,res) short-circuits with a redirect
→ templateLocals    (res.locals.APPLICATION_TITLE, HEADER_JS_BUNDLE, ...)
→ attachCsrfToken / doubleCsrfProtection   (GET is a "safe" method — always passes)
→ loginRequired     (req.user.isAuthenticated() === true → next())
→ routes/pages.js   GET /authoring/:procedureId/:version
→ res.render('spa/authoring', { authoring_js_bundle: config.AUTHORING_JS_BUNDLE })
→ HTML response embeds <script src="/static/<bundle>"> + #spa-authoring mount point

Browser loads the bundle
→ modules/authoring/authoring.js runs:
    - defineAbilityFor(getUserScopes())   (decodes JWT client-side, no verification)
    - registers every 'ing-element'/'cmd-element'/... global component
      (Vue.extend(authoringNestableMixin | elementAuthoringMixin).extend(Component))
    - new VueRouter({...}) + new Vue({ el: '#spa-authoring', router, store, render })
    - Vue-router matches the current path → mounts Authoring.vue / ProcedureVersions.vue / Procedures.vue
→ mounted component's created()/store actions call src/api/*.js functions
→ those call the shared `transport` axios instance → /core_server/api/v5/... (browser-direct)
→ resolved by NGINX (prod) or clientProxy.js (local dev) → Core API
```

## Authoring: dragging a step onto the canvas

```text
User drags a palette entry (elementPath set as DataTransfer 'elementPath')
  or an existing element (elemId as 'elemId', optionally 'copy')
  and drops it on a DropPlaceHolder.vue target
→ v-drag-and-drop directive (modules/common/directives/DragAndDrop.js) fires a drop handler
→ authoring-nestable-mixin.js :: elementDrop(event)
    - reads dropafterid / parentid / level attributes off the drop target
    - reads elemId / elementPath / copy off event.dataTransfer
    - if isAllowEdit is false (procedure not checked out to this user, or not in ?update mode) → no-op
    - draggedElementId set:
        - copy=true  → dispatch('copyElement', { elementId, insertAfterId, level })
        - copy=false → dispatch('moveElement', { elementId, insertAfterId, level })
    - else elementPath set → dispatch('createElement', { elementType: elementPath, insertAfterId, level })
→ authoring-store.js action → src/api/authoring.js function → transport → Core API
→ Core API response → mutation updates authoring-store.js element map
→ Vue reactivity re-renders IngWorkflow.vue's element tree
```

`isAllowEdit` (in the same mixin) is gated on the procedure being the **working copy**
(`version === "0"`), the `?update` query parameter being present, and
`procedureDetails.locked_by` being empty or equal to the current user — i.e. **procedure
check-out/locking is enforced client-side by this computed property**, not just by the API
(though the API presumably also enforces it — not verified in this repo).

## Live execution updates (WebSocket)

```text
execution.js / authoring.js / as-run.js each construct a VueSocketIO instance:
    connection: `${protocol}//${host}:${port}/api/v2/execution_event_subscribe`
    options.path: '/execution_monitor/socket.io'
    options.query: { token: getJwt() }
    options.transports: ['websocket']
    options.autoConnect: false        (connection started explicitly by app code)

Server-side 'execution_monitor' service (separate repo) emits socket.io events, e.g. 'execution-event'
→ vue-socket.io auto-dispatches a Vuex action named `${actionPrefix}${event}`:
    execution.js   actionPrefix 'SOCKET_'          → action "SOCKET_execution-event"
    authoring.js   actionPrefix 'SOCKET_PROCEDURE_' → action "SOCKET_PROCEDURE_execution-event"
    as-run.js      actionPrefix 'SOCKET_AS_RUN_'    → action "SOCKET_AS_RUN_execution-event"
→ execution-store.js handles these with a big `switch(socket_data.event)` on the *inner* event
  name (e.g. "post_execution_message", "discard_override_step", ...), each case committing a
  targeted mutation (e.g. updateElementWebsocketsMetaData) so only the affected element re-renders.
→ handleErrorNotification(status_code, response, commit) runs first in every handler and always
  surfaces backend-reported errors via the shared message-store (see Error-Handling.md).
```

The `/execution_monitor` path is reverse-proxied with `ws: true` in
`src/server/src/routes/clientProxy.js:57`, and the raw
HTTP `upgrade` event is wired up in `server.js` (`app.emit('upgrade-proxy-targets', server)`) —
see [Server](Server.md#entry-point).

## Token renewal

The server exposes `GET /renew`
(`src/server/src/routes/login.js:117-148`), which calls
`AUTH_REFRESH_TOKEN_URL` and resets the `access_token`/`expiration_date` cookies on success. The
`templateLocals` middleware also exposes `SESSION_WARNING_EXPIRATION_IN_SECONDS` to every
authenticated page's EJS render. **However**, no caller of `/renew` and no consumer of
`SESSION_WARNING_EXPIRATION_IN_SECONDS` was found in `src/client/src` or in
`src/server/src/views/partials/head.ejs` — the countdown/renewal UI, if any, appears to live in
a legacy pre-built static asset (`static/js/global.min.js`) that was not source-inspected as
part of this audit. **Unknown / not documented:** whether/how the browser currently triggers
`/renew` automatically before expiration. See
[Troubleshooting](Troubleshooting.md#session-renewal-wiring-unclear).

`src/api/transport.js`'s response interceptor independently tracks client/server clock drift
(`ING_CLIENT_TIME_OFFSET_SECS` in `localStorage`) and stamps a `last_action` cookie on every
successful response — infrastructure that a renewal countdown would plausibly consume, but the
consuming code was not located.

## Related pages

- [Security](Security.md) — the JWT/CSRF mechanics referenced throughout.
- [Error-Handling](Error-Handling.md) — how `handleErrorNotification` and the API layer's
  try/catch pattern surface failures from these flows.
- [Client](Client.md#the-element-system-moduleselements) — the mixin system behind the
  authoring/execution examples above.
