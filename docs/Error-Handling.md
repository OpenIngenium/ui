# Error Handling

[← Home](Home.md) · See also [Server](Server.md) · [Client](Client.md) · [Security](Security.md)

Error handling differs by layer; this page catalogues the actual patterns in use rather than a
theoretical model.

## Server: fail generically, log narrowly

- **Route level:** every async route handler is wrapped in `asyncHandler()`
  (`src/server/src/lib/asyncHandler.js`), which
  converts a rejected promise into `next(err)` instead of an unhandled rejection.
- **Upstream call level:** `lib/httpClient.js::request()` sets `validateStatus: () => true`, so
  a non-2xx response from a backend service is **not** an exception — callers must check
  `response.status` themselves (see e.g. `routes/login.js` checking `response.status !== 200`).
  A genuine network/transport failure (`catch` block in `httpClient.js`) is converted into a
  new `Error` with a redacted message and `.status` (defaulting to `502`) — the raw axios error
  is discarded specifically so it can't leak `Authorization` headers or POST bodies to logs or
  a client response (see [Security](Security.md#credential-safe-logging)).
- **Global handler:** `app.js`'s final middleware logs `err.message`/`err.stack` only, and
  responds `res.status(err.status || 500).json({ error: 'Internal Server Error' })` — the
  client **never** receives the real error message from this handler, only a generic string.
  Route-specific handlers (e.g. `login.js`) construct their own, more specific user-facing
  messages before this global handler would ever be reached.
- **CSRF failures:** handled distinctly, before the generic handler —
  `middleware/csrf.js::csrfErrorHandler` renders `403.ejs` for `invalidCsrfTokenError`
  specifically.
- **Auth/session failures:** `middleware/session.js::checkSessionExpiration` treats JWT
  verification errors (`jwt.TokenExpiredError`, `JsonWebTokenError`) as a special case — not an
  error response at all, but an automatic logout redirect via `logoutRequest`.
- **404s:** a catch-all `app.use((req,res) => res.status(404).render('404'))` before the CSRF
  and generic error handlers.

## Client: three coexisting patterns

### 1. API layer error-swallowing

Nearly every function in `src/client/src/api/*.js` follows the same shape:

```js
async function getProcedure(procedureId) {
    try {
        const response = await transport.get(coreProcedureUrls.base(procedureId));
        return response.data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}
```

Different functions return different sentinels on failure (`null`, `undefined`, `[]`, or `{
error }}` — see `src/client/src/api/procedures.js:50-59`
vs `auth.js:8-23`). **Callers must check for these sentinels explicitly** — there is no
consistent "throws on failure" contract across the API layer. This is why
`test/unit/setup.js` silences `console.error`/`console.warn` globally for the test suite: these
catch blocks fire routinely, including in tests that deliberately exercise the failure path (see
[Testing](Testing.md#client-tests)).

### 2. Centralized feedback modal (`message-store.js`)

For user-facing success/error banners, most of the app dispatches through a shared Vuex module:

```js
// modules/common/message-store.js
actions.displayFeedback({commit}, {type, errorObj, messageObj})
mutations.receiveFeedback(state, {type, errorObj, messageObj})
```

`receiveFeedback` normalizes an error object (`errorObj`) into a display-ready
`{ message, details }` shape — unescaping HTML entities via lodash's `_.unescape`, decoding
`ArrayBuffer` error response bodies (for endpoints that return binary/blob responses on error),
and falling back through `errorObj.response.data.message` → `errorObj.message` →
`String(errorObj)`. Setting `state.showFeedbackModal = true` causes `FeedbackModal.vue`
(rendered globally in most SPA shells) to display it.

### 3. Execution WebSocket error notifications

Live execution/authoring/as-run socket handlers all call
`handleErrorNotification(status_code, response, commit)`
(`src/client/src/modules/common/utils.js:979-994`) as
the **first** thing they do:

```js
export function handleErrorNotification(status_code, response, commit) {
    if (status_code < 200 || status_code >= 300) {
        const message = (response && response.message) ? response.message : 'Unknown error';
        const details = (response && response.details) ? response.details : '';
        commit('receiveNotification', {
            timestamp: (new Date()).toISOString(),
            msg: `${message} Details: ${details}`,
            level: 'ERROR',
        });
        return true;
    }
    return false;
}
```

Its return value is used to **short-circuit** the rest of the socket event handler
(`if (handleErrorNotification(...)) return;` in `execution-store.js`'s `SOCKET_execution-event`
and `SOCKET_AS_RUN_execution-event` actions) — a failed backend operation reported over the
socket produces a notification but no further state mutation for that event.

## Retries

**Not observed.** No retry/backoff logic was found in `httpClient.js`, the client `api/*.js`
modules, or the WebSocket handling code. A failed request is surfaced once (via one of the
patterns above) and left to the user to retry manually (e.g. re-submitting a form, reloading).

## Related pages

- [Security](Security.md#credential-safe-logging) — why raw errors are never logged/returned
  as-is server-side.
- [Data-Flow](Data-Flow.md#live-execution-updates-websocket) — where
  `handleErrorNotification` fits in the socket event lifecycle.
- [Testing](Testing.md#client-tests) — how the test suite copes with the API layer's
  `console.error` calls.
