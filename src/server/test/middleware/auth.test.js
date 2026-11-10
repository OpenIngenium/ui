const test = require('node:test');
const assert = require('node:assert/strict');
const { attachUser } = require('../../src/middleware/auth');

test('attaches an authenticated IngeniumUser when access_token cookie is present', () => {
  const req = { cookies: { access_token: 'a.b.c', access_token_timeout: '123' } };
  const res = {};
  let nextCalled = false;

  attachUser(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.isAuthenticated(), true);
  assert.strictEqual(req.user.getToken(), 'a.b.c');
  assert.strictEqual(req.user.access_token_timeout, '123');
});

test('attaches an IngeniumAnonymousUser when there is no access_token cookie', () => {
  const req = { cookies: {} };
  const res = {};

  attachUser(req, res, () => {});

  assert.strictEqual(req.user.isAuthenticated(), false);
});

test('attaches an IngeniumAnonymousUser when req.cookies is missing entirely', () => {
  const req = {};
  const res = {};

  attachUser(req, res, () => {});

  assert.strictEqual(req.user.isAuthenticated(), false);
});
