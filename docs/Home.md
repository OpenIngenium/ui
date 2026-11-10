# Ingenium UI — DeepWiki

Technical knowledge base for the Ingenium UI repository. This is the **developer-facing**
companion to the top-level [`README.md`](../../README.md): the README tells you whether to use
the project and how to get it running; this wiki explains **how it actually works** so you can
develop, debug, and extend it.

> **Scope note:** This wiki documents the `ui` repository only (this Git repo). Ingenium is a
> multi-repository system — the Core API, Auth service, Dictionary service, Execution server,
> Report/Search services, and the Execution Monitor (WebSocket) service referenced throughout
> this wiki all live in **separate repositories** and are consumed by this repo only as HTTP/WS
> backends. Their internals are out of scope; only their observable contracts (URLs, payloads)
> as used by this codebase are documented.

## What this project is

Ingenium UI is the web front end for **Ingenium**, a procedure authoring and execution system
(built for the Europa Clipper mission per the default branding strings in
`src/server/src/config/index.js:39-41`). Users author
step-by-step procedures (command sequences, verifications, waits, scripts, etc.), organize them
into venues, and execute them live with real-time status tracking, commenting/redlining, and
reporting.

The repository is a **monorepo with two runtime halves**:

| Half | Path | Stack | Role |
|---|---|---|---|
| **Client** | `src/client` | Vue 2, Vuex, Vue Router, webpack 5 | Multi-SPA browser application (11 independent bundles) |
| **Server** | `src/server` | Node.js, Express 4, EJS | Auth/session/CSRF, page shells, thin API proxy — replaces a legacy Django server |

Both are independent Node projects (their own `package.json`/lockfile) tied together by the
root [`package.json`](../../package.json) convenience scripts and by the production
[`Dockerfile`](../../Dockerfile), which builds the client and bundles it for the server to serve.

## Start here

- **New to the repo?** Read [Architecture](Architecture.md) then [Repository-Structure](Repository-Structure.md).
- **Working on the server?** Go to [Server](Server.md).
- **Working on the Vue client?** Go to [Client](Client.md).
- **Need endpoint/function signatures?** See [API-Reference](API-Reference.md).
- **Tracing a user workflow (login, authoring, execution)?** See [Data-Flow](Data-Flow.md).
- **Setting env vars or `.env`?** See [Configuration](Configuration.md).
- **Running locally / building?** See [Development](Development.md).
- **Running or writing tests?** See [Testing](Testing.md).
- **CI pipeline / Docker builds?** See [CI-CD](CI-CD.md).
- **Auth, CSRF, JWT model?** See [Security](Security.md).
- **How failures propagate and surface to users?** See [Error-Handling](Error-Handling.md).
- **Adding a new step/element type, page, or route?** See [Extending](Extending.md).
- **Known gotchas?** See [Troubleshooting](Troubleshooting.md).

## Document conventions

Throughout this wiki:

- **Observed implementation** — stated directly from source code; treated as fact.
- **Strong inference** — reasonable conclusion from code/config, explicitly flagged as inferred.
- **Unknown / not documented** — the repository does not establish this; explicitly flagged
  rather than guessed at.

File references use the form `@/absolute/path/to/file.ext:line` and can be opened directly in
your editor.

## Wiki pages

1. [Architecture](Architecture.md)
2. [Repository-Structure](Repository-Structure.md)
3. [Server](Server.md)
4. [Client](Client.md)
5. [API-Reference](API-Reference.md)
6. [Data-Flow](Data-Flow.md)
7. [Configuration](Configuration.md)
8. [Development](Development.md)
9. [Testing](Testing.md)
10. [CI-CD](CI-CD.md)
11. [Security](Security.md)
12. [Error-Handling](Error-Handling.md)
13. [Extending](Extending.md)
14. [Troubleshooting](Troubleshooting.md)
