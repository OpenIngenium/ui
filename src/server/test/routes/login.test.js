const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const jsonwebtoken = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function validToken(overrides = {}) {
  return jsonwebtoken.sign(
    { username: 'mrkhan', scopes: [], ...overrides },
    privateKey,
    { algorithm: 'RS256', expiresIn: '30m' },
  );
}

function startFakeAuthServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// config/index.js (and login.js/templateLocals.js, which depend on it) are singletons read
// once at require-time - both module caches must be cleared and re-required together after
// setting env vars, same pattern used in test/lib/ingeniumUser.test.js.
function loadAppWithFakeAuth(authHandler) {
  return startFakeAuthServer(authHandler).then((authServer) => {
    const { port } = authServer.address();
    const configPath = require.resolve('../../src/config');
    const loginPath = require.resolve('../../src/routes/login');
    const templateLocalsPath = require.resolve('../../src/middleware/templateLocals');
    [configPath, loginPath, templateLocalsPath].forEach((p) => delete require.cache[p]);

    process.env.AUTH_API_URL = `http://127.0.0.1:${port}/api/v2/`;
    process.env.PUBLIC_PEM = publicKey;

    const authPath = require.resolve('../../src/middleware/auth');
    const csrfPath = require.resolve('../../src/middleware/csrf');
    const userPath = require.resolve('../../src/lib/ingeniumUser');
    [authPath, csrfPath, userPath].forEach((p) => delete require.cache[p]);

    let loginRoutes;
    let templateLocals;
    let attachUser;
    let attachCsrfToken;
    let config;
    try {
      // eslint-disable-next-line global-require
      config = require(configPath);
      // eslint-disable-next-line global-require
      loginRoutes = require(loginPath);
      // eslint-disable-next-line global-require
      ({ templateLocals } = require(templateLocalsPath));
      // eslint-disable-next-line global-require
      ({ attachUser } = require(authPath));
      // eslint-disable-next-line global-require
      ({ attachCsrfToken } = require(csrfPath));
    } finally {
      delete process.env.AUTH_API_URL;
      delete process.env.PUBLIC_PEM;
      [configPath, loginPath, templateLocalsPath, authPath, csrfPath, userPath].forEach(
        (p) => delete require.cache[p],
      );
    }

    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', config.VIEWS_DIR);
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(attachUser);
    app.use(templateLocals);
    app.use(attachCsrfToken);
    app.use('/', loginRoutes.router);

    return { app, authServer, config, logoutRequest: loginRoutes.logoutRequest };
  });
}

test('GET /login renders the login page when unauthenticated', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth(() => {});
  t.after(() => authServer.close());

  const res = await request(app).get('/login');
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes('form'));
});

test('GET /login redirects to "/" when already authenticated', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth(() => {});
  t.after(() => authServer.close());

  const res = await request(app).get('/login').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/');
});

test('GET /login?next=/procedures/ preserves a relative next redirect target', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth(() => {});
  t.after(() => authServer.close());

  const res = await request(app).get('/login?next=/procedures/').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.headers.location, '/procedures/');
});

test('GET /login?next=https://evil.example.com falls back to the default redirect (open-redirect guard)', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth(() => {});
  t.after(() => authServer.close());

  const res = await request(app).get('/login?next=https://evil.example.com').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.headers.location, '/');
});

test('POST /login with missing credentials re-renders the login page with an error', async (t) => {
  const { app, authServer } = await loadAppWithFacetAuthSafe();
  t.after(() => authServer && authServer.close());

  const res = await request(app).post('/login').send({});
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes('Missing Username or Password'));
});

// Small helper alias to keep the "missing credentials" test from hitting a real network call -
// the auth service should never be contacted when username/password are absent.
async function loadAppWithFacetAuthSafe() {
  return loadAppWithFakeAuth(() => {
    throw new Error('auth service should not have been called');
  });
}

test('POST /login with valid credentials sets cookies and redirects', async (t) => {
  const accessToken = jsonwebtoken.sign({ username: 'mrkhan', scopes: [] }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '30m',
  });

  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ access_token: accessToken, access_token_timeout: 1800 }));
  });
  t.after(() => authServer.close());

  const res = await request(app).post('/login').send({ username: 'mrkhan', password: 'hunter2' });

  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/');
  const cookies = res.headers['set-cookie'].join(';');
  assert.ok(cookies.includes('access_token='));
  assert.ok(cookies.includes('access_token_timeout=1800'));
});

test('POST /login with invalid credentials (auth service 401) re-renders with its error message', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid credentials' }));
  });
  t.after(() => authServer.close());

  const res = await request(app).post('/login').send({ username: 'mrkhan', password: 'wrong' });
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes('Invalid credentials'));
});

test('POST /login shows a generic error when the auth service is unreachable', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth(() => {});
  authServer.close();
  t.after(() => {});

  const res = await request(app).post('/login').send({ username: 'mrkhan', password: 'x' });
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes('Unable to reach authentication service'));
});

test('GET /logout clears all auth cookies and redirects to "/" by default', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{}');
  });
  t.after(() => authServer.close());

  const res = await request(app).get('/logout').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/');
  const cleared = res.headers['set-cookie'].join(';');
  assert.ok(cleared.includes('access_token=;'));
  assert.ok(cleared.includes('access_token_timeout=;'));
  assert.ok(cleared.includes('expiration_date=;'));
});

test('GET /logout still clears cookies and redirects even if the auth service logout call fails', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.destroy();
  });
  t.after(() => authServer.close());

  const res = await request(app).get('/logout').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 302);
});

test('POST /renew redirects to /login when not authenticated', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth(() => {});
  t.after(() => authServer.close());

  const res = await request(app).post('/renew');
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/login');
});

test('POST /renew refreshes the token and sets new cookies on success', async (t) => {
  const newToken = jsonwebtoken.sign({ username: 'mrkhan', scopes: [] }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '30m',
  });

  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ access_token: newToken }));
  });
  t.after(() => authServer.close());

  const res = await request(app).post('/renew').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, {});
  assert.ok(res.headers['set-cookie'].join(';').includes('access_token='));
});

test('POST /renew redirects to /logout when the refresh is rejected (403)', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(403, { 'content-type': 'application/json' });
    res.end('{}');
  });
  t.after(() => authServer.close());

  const res = await request(app).post('/renew').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/logout');
});

test('POST /renew redirects to /logout when the refresh is rejected (401 - token already expired/invalid)', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end('{}');
  });
  t.after(() => authServer.close());

  const res = await request(app).post('/renew').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/logout');
});

test('POST /renew does NOT log the user out on a transient upstream error (5xx) - existing cookie is preserved for retry', async (t) => {
  const { app, authServer } = await loadAppWithFakeAuth((req, res) => {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end('{}');
  });
  t.after(() => authServer.close());

  const res = await request(app).post('/renew').set('Cookie', `access_token=${validToken()}`);
  assert.strictEqual(res.status, 503);
  assert.strictEqual(res.headers.location, undefined);
});
