const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const { doubleCsrfProtection, attachCsrfToken, csrfErrorHandler } = require('../../src/middleware/csrf');

function buildApp({ authenticated = false, username = 'anonymous' } = {}) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.user = { getUsername: () => username, isAuthenticated: () => authenticated };
    next();
  });
  app.use(attachCsrfToken);

  app.get('/token', (req, res) => res.json({ csrf_token: res.locals.csrf_token }));
  app.use(doubleCsrfProtection);
  app.post('/submit', (req, res) => res.json({ ok: true }));

  app.use(csrfErrorHandler);
  return app;
}

function extractCsrfCookie(setCookieHeaders) {
  const csrfCookie = (setCookieHeaders || []).find((c) => c.startsWith('csrf_token='));
  return csrfCookie ? csrfCookie.split(';')[0] : null;
}

test('GET request generates a csrf token and sets the csrf_token cookie', async () => {
  const app = buildApp();
  const res = await request(app).get('/token');

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.csrf_token);
  assert.ok(extractCsrfCookie(res.headers['set-cookie']));
});

test('POST without a csrf token is rejected with 403 (Django CsrfViewMiddleware parity)', async () => {
  const app = buildApp();
  const res = await request(app).post('/submit').send({});

  assert.strictEqual(res.status, 403);
});

test('POST with a mismatched csrf token/cookie pair is rejected with 403', async () => {
  const app = buildApp();
  const tokenRes = await request(app).get('/token');
  const cookie = extractCsrfCookie(tokenRes.headers['set-cookie']);

  const res = await request(app)
    .post('/submit')
    .set('Cookie', cookie)
    .send({ _csrf: 'not-the-right-token' });

  assert.strictEqual(res.status, 403);
});

test('POST with the matching csrf token (from body) and cookie succeeds', async () => {
  const app = buildApp();
  const tokenRes = await request(app).get('/token');
  const cookie = extractCsrfCookie(tokenRes.headers['set-cookie']);

  const res = await request(app)
    .post('/submit')
    .set('Cookie', cookie)
    .send({ _csrf: tokenRes.body.csrf_token });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});

test('POST with the matching csrf token via X-CSRF-Token header (AJAX pattern) succeeds', async () => {
  const app = buildApp();
  const tokenRes = await request(app).get('/token');
  const cookie = extractCsrfCookie(tokenRes.headers['set-cookie']);

  const res = await request(app)
    .post('/submit')
    .set('Cookie', cookie)
    .set('X-CSRF-Token', tokenRes.body.csrf_token)
    .send({});

  assert.strictEqual(res.status, 200);
});

test('works the same way for an authenticated user (session identifier bound to their username, not "anonymous")', async () => {
  const app = buildApp({ authenticated: true, username: 'mrkhan' });
  const tokenRes = await request(app).get('/token');
  const cookie = extractCsrfCookie(tokenRes.headers['set-cookie']);

  const res = await request(app)
    .post('/submit')
    .set('Cookie', cookie)
    .send({ _csrf: tokenRes.body.csrf_token });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});
