const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { checkSessionExpiration } = require('../../src/middleware/session');

function makeRes() {
  const res = { redirectedTo: null, clearedCookies: [] };
  res.redirect = (to) => {
    res.redirectedTo = to;
  };
  res.clearCookie = (name) => {
    res.clearedCookies.push(name);
  };
  return res;
}

test('calls next() when the user is not authenticated (nothing to check)', () => {
  const req = { user: { isAuthenticated: () => false } };
  const res = makeRes();
  let nextCalled = false;

  checkSessionExpiration(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.redirectedTo, null);
});

test('calls next() when the token is valid (getUsername does not throw)', () => {
  const req = {
    user: {
      isAuthenticated: () => true,
      getUsername: () => 'mrkhan',
    },
  };
  const res = makeRes();
  let nextCalled = false;

  checkSessionExpiration(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
});

test('logs the user out (redirect + clear cookies) when the token is expired', async () => {
  const req = {
    user: {
      isAuthenticated: () => true,
      getUsername: () => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      },
      getToken: () => null, // skip the best-effort auth-service logout network call
    },
    query: {},
  };
  const res = makeRes();

  const maybePromise = checkSessionExpiration(req, res, () => {
    assert.fail('next() should not be called on expired token');
  });
  await maybePromise;

  assert.strictEqual(res.redirectedTo, '/');
  assert.deepStrictEqual(res.clearedCookies, ['access_token', 'access_token_timeout', 'expiration_date']);
});

test('logs the user out on a malformed/invalid signature token too', async () => {
  const req = {
    user: {
      isAuthenticated: () => true,
      getUsername: () => {
        throw new jwt.JsonWebTokenError('invalid signature');
      },
      getToken: () => null,
    },
    query: {},
  };
  const res = makeRes();

  await checkSessionExpiration(req, res, () => {
    assert.fail('next() should not be called on an invalid token');
  });

  assert.strictEqual(res.redirectedTo, '/');
});

test('logs the user out on a NotBeforeError too (JsonWebTokenError subclass)', async () => {
  const req = {
    user: {
      isAuthenticated: () => true,
      getUsername: () => {
        throw new jwt.NotBeforeError('jwt not active', new Date());
      },
      getToken: () => null,
    },
    query: {},
  };
  const res = makeRes();

  await checkSessionExpiration(req, res, () => {
    assert.fail('next() should not be called on a not-yet-active token');
  });

  assert.strictEqual(res.redirectedTo, '/');
});

test('forwards unexpected (non-JWT) errors to next(err) instead of logging out', () => {
  const boom = new Error('unexpected failure');
  const req = {
    user: {
      isAuthenticated: () => true,
      getUsername: () => {
        throw boom;
      },
    },
  };
  const res = makeRes();
  let forwardedErr;

  checkSessionExpiration(req, res, (err) => {
    forwardedErr = err;
  });

  assert.strictEqual(forwardedErr, boom);
  assert.strictEqual(res.redirectedTo, null);
});
