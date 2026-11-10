const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const request = require('supertest');
const { mount, mountClientProxyRoutes } = require('../../src/routes/clientProxy');

// Spins up a plain HTTP server that just echoes back the path it received, so tests can
// assert exactly what path the proxy forwarded upstream.
function startFakeUpstream() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ receivedUrl: req.url }));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function upstreamOrigin(server) {
  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

test('mount() strips the prefix before forwarding (stripPrefix defaults to true)', async (t) => {
  const upstream = await startFakeUpstream();
  t.after(() => upstream.close());

  const app = express();
  mount(app, '/core_server', upstreamOrigin(upstream));

  const res = await request(app).get('/core_server/api/v5/venues?limit=10');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.receivedUrl, '/api/v5/venues?limit=10');
});

test('mount() keeps the prefix when stripPrefix is false (dict_server behavior)', async (t) => {
  const upstream = await startFakeUpstream();
  t.after(() => upstream.close());

  const app = express();
  mount(app, '/dict_server', upstreamOrigin(upstream), { stripPrefix: false });

  const res = await request(app).get('/dict_server/api/v4/dictionaries/flight/versions/1/cmds');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.receivedUrl, '/dict_server/api/v4/dictionaries/flight/versions/1/cmds');
});

test('mount() does nothing (and does not throw) when no target origin is configured', () => {
  const app = express();
  assert.doesNotThrow(() => mount(app, '/execution_monitor', undefined, { ws: true }));
});

test('mount() only proxies requests matching its own prefix, not unrelated paths', async (t) => {
  const upstream = await startFakeUpstream();
  t.after(() => upstream.close());

  const app = express();
  mount(app, '/core_server', upstreamOrigin(upstream));
  app.use((req, res) => res.status(404).send('not proxied'));

  const res = await request(app).get('/some_other_path');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.text, 'not proxied');
});

test('mountClientProxyRoutes() wires up all 6 client-facing prefixes from config', async (t) => {
  // clientProxy.js reads `config` at require-time, so config's env vars must be set and both
  // module caches cleared+re-required together, same pattern as test/lib/ingeniumUser.test.js.
  const upstream = await startFakeUpstream();
  t.after(() => upstream.close());
  const origin = upstreamOrigin(upstream);

  const configPath = require.resolve('../../src/config');
  const proxyPath = require.resolve('../../src/routes/clientProxy');
  delete require.cache[configPath];
  delete require.cache[proxyPath];

  const env = {
    CORE_API_URL: `${origin}/api/v5/`,
    AUTH_API_URL: `${origin}/api/v2/`,
    REPORT_API_URL: origin,
    SEARCH_API_URL: origin,
    DICT_API_URL: `${origin}/api/v4/`,
    EXECUTION_MONITOR_URL: origin,
  };
  Object.entries(env).forEach(([k, v]) => {
    process.env[k] = v;
  });

  let freshMountClientProxyRoutes;
  try {
    // eslint-disable-next-line global-require
    ({ mountClientProxyRoutes: freshMountClientProxyRoutes } = require(proxyPath));
  } finally {
    Object.keys(env).forEach((k) => delete process.env[k]);
    delete require.cache[configPath];
    delete require.cache[proxyPath];
  }

  const app = express();
  freshMountClientProxyRoutes(app);

  const coreRes = await request(app).get('/core_server/api/v5/venues?limit=1');
  assert.strictEqual(coreRes.status, 200);
  assert.strictEqual(coreRes.body.receivedUrl, '/api/v5/venues?limit=1');

  // dict_server keeps its prefix (see file header note in clientProxy.js).
  const dictRes = await request(app).get('/dict_server/api/v4/health');
  assert.strictEqual(dictRes.status, 200);
  assert.strictEqual(dictRes.body.receivedUrl, '/dict_server/api/v4/health');
});

test('the raw WS "upgrade" handler rewrites the path the same way HTTP requests do', async (t) => {
  // Regression test for the bug where Express's app.use(prefix, ...) implicitly stripped the
  // prefix for normal HTTP requests, but the raw `upgrade` event (registered directly on the
  // http.Server, bypassing Express) saw the *unstripped* URL and forwarded the wrong path.
  const upstream = await startFakeUpstream();
  t.after(() => upstream.close());

  const app = express();
  let capturedProxy;
  const originalOn = app.on.bind(app);
  app.on = (event, listener) => {
    if (event === 'upgrade-proxy-targets') {
      capturedProxy = listener;
    }
    return originalOn(event, listener);
  };

  mount(app, '/execution_monitor', upstreamOrigin(upstream), { ws: true });

  assert.strictEqual(typeof capturedProxy, 'function');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());

  capturedProxy(server);

  const port = server.address().port;
  const upgradeReceived = new Promise((resolve) => {
    upstream.on('upgrade', (req) => resolve(req.url));
  });

  const upgradeReq = http.request({
    host: '127.0.0.1',
    port,
    path: '/execution_monitor/socket.io/?EIO=4&transport=websocket',
    headers: {
      Connection: 'Upgrade',
      Upgrade: 'websocket',
      'Sec-WebSocket-Version': '13',
      'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
    },
  });
  upgradeReq.end();
  t.after(() => upgradeReq.destroy());

  const forwardedUrl = await upgradeReceived;
  // The prefix must be stripped here too - not left as "/execution_monitor/socket.io/...".
  assert.strictEqual(forwardedUrl, '/socket.io/?EIO=4&transport=websocket');
});
