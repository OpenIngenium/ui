/**
 * Reverse-proxies the path prefixes the Vue client calls directly from the browser
 * (e.g. `/core_server/api/v5/venues`). In production this was handled entirely by NGINX
 * (see ingenium-https.conf `location /core_server/ { proxy_pass ... }`
 * etc) - Django never saw these requests. This dev server only replaces Django, so these
 * pass-throughs are added here to keep local/dev parity with the NGINX-fronted setup.
 *
 * NOTE on prefix handling:
 *  - /core_server, /auth_server, /report_server, /search_server: NGINX strips the prefix
 *    before forwarding (location `/core_server/` + `proxy_pass http://core_server/;`).
 *  - /dict_server: NGINX explicitly rewrites to KEEP the `/dict_server` prefix (see the
 *    `rewrite ^/dict_server(.*) /dict_server$1 break;` in the same nginx conf), because the
 *    CI dictionary host serves it at that path. Mirrored here by NOT stripping the prefix.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

function mount(app, prefix, target, { stripPrefix = true, ws = false } = {}) {
  if (!target) {
    // eslint-disable-next-line no-console
    console.warn(`[clientProxy] Skipping ${prefix} - no target origin configured`);
    return;
  }

  // Use http-proxy-middleware's own `pathFilter` to scope this proxy to `prefix`, instead of
  // relying on Express's `app.use(prefix, ...)` to strip it. That implicit stripping only
  // applies to requests routed through Express - the raw `upgrade` event (needed for WS, see
  // below) bypasses Express entirely, so `proxy.upgrade` would otherwise see the *unstripped*
  // URL and forward the wrong path upstream. Scoping + rewriting via `pathFilter`/`pathRewrite`
  // here makes both regular HTTP and WS upgrade forwarding behave consistently.
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    ws,
    pathFilter: prefix,
    pathRewrite: stripPrefix ? { [`^${prefix}`]: '' } : undefined,
    logLevel: config.ENABLE_DEBUG_INFORMATION ? 'info' : 'warn',
  });

  app.use(proxy);

  if (ws) {
    // http-proxy-middleware only intercepts the WS upgrade handshake if it's attached to the
    // underlying http.Server's 'upgrade' event too (express alone won't forward it).
    app.on('upgrade-proxy-targets', (server) => server.on('upgrade', proxy.upgrade));
  }
}

function mountClientProxyRoutes(app) {
  mount(app, '/core_server', config.CORE_SERVER_ORIGIN);
  mount(app, '/auth_server', config.AUTH_SERVER_ORIGIN);
  mount(app, '/report_server', config.REPORT_SERVER_ORIGIN);
  mount(app, '/search_server', config.SEARCH_SERVER_ORIGIN);
  // dict_server intentionally keeps its prefix - see file header note above.
  mount(app, '/dict_server', config.DICT_SERVER_ORIGIN, { stripPrefix: false });
  // execution_monitor is a socket.io WebSocket connection (live execution status updates).
  mount(app, '/execution_monitor', config.EXECUTION_MONITOR_ORIGIN, { ws: true });
}

module.exports = { mountClientProxyRoutes, mount };
