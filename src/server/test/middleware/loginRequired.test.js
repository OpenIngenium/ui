const test = require('node:test');
const assert = require('node:assert/strict');
const { loginRequired } = require('../../src/middleware/loginRequired');

function makeReq({ path, url, authenticated }) {
  return {
    path,
    url: url || path,
    user: { isAuthenticated: () => authenticated },
  };
}

function makeRes() {
  const res = { redirectedTo: null };
  res.redirect = (to) => {
    res.redirectedTo = to;
  };
  return res;
}

test('calls next() when the user is authenticated', () => {
  const req = makeReq({ path: '/procedures/', authenticated: true });
  const res = makeRes();
  let nextCalled = false;

  loginRequired(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.redirectedTo, null);
});

test('calls next() for exempt paths (e.g. static assets) even when unauthenticated', () => {
  const req = makeReq({ path: '/static/css/bootstrap.min.css', authenticated: false });
  const res = makeRes();
  let nextCalled = false;

  loginRequired(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.redirectedTo, null);
});

test('calls next() for /login itself even when unauthenticated', () => {
  const req = makeReq({ path: '/login', authenticated: false });
  const res = makeRes();
  let nextCalled = false;

  loginRequired(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
});

test('redirects to LOGIN_URL (no ?next=) when hitting the root path unauthenticated', () => {
  const req = makeReq({ path: '/', authenticated: false });
  const res = makeRes();

  loginRequired(req, res, () => {});

  assert.strictEqual(res.redirectedTo, '/login/');
});

test('redirects to LOGIN_URL with ?next= pointing back to the originally requested path', () => {
  const req = makeReq({ path: '/procedures/', authenticated: false });
  const res = makeRes();

  loginRequired(req, res, () => {});

  assert.strictEqual(res.redirectedTo, '/login/?next=/procedures/');
});

test('preserves the original query string (URL-encoded) in the ?next= redirect', () => {
  const req = makeReq({
    path: '/procedures/',
    url: '/procedures/?foo=bar&baz=1',
    authenticated: false,
  });
  const res = makeRes();

  loginRequired(req, res, () => {});

  assert.strictEqual(res.redirectedTo, `/login/?next=/procedures/?${encodeURIComponent('foo=bar&baz=1')}`);
});

test('treats a missing req.user the same as unauthenticated', () => {
  const req = { path: '/procedures/', url: '/procedures/', user: null };
  const res = makeRes();
  let nextCalled = false;

  loginRequired(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.redirectedTo, '/login/?next=/procedures/');
});
