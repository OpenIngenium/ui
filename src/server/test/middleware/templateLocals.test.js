const test = require('node:test');
const assert = require('node:assert/strict');
const { templateLocals } = require('../../src/middleware/templateLocals');

test('injects application-wide locals for every request', () => {
  const req = { user: null };
  const res = { locals: {} };
  let nextCalled = false;

  templateLocals(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(typeof res.locals.APPLICATION_TITLE, 'string');
  assert.strictEqual(typeof res.locals.APPLICATION_ACRONYM, 'string');
  assert.strictEqual(typeof res.locals.HEADER_JS_BUNDLE, 'string');
  assert.strictEqual(typeof res.locals.UI_CUSTOM_FOOTER, 'string');
  assert.strictEqual(typeof res.locals.FROALA_KEY, 'string');
  assert.strictEqual(res.locals.SESSION_WARNING_EXPIRATION_IN_SECONDS, undefined);
});

test('adds SESSION_WARNING_EXPIRATION_IN_SECONDS only for authenticated users', () => {
  const req = { user: { isAuthenticated: () => true } };
  const res = { locals: {} };

  templateLocals(req, res, () => {});

  assert.strictEqual(typeof res.locals.SESSION_WARNING_EXPIRATION_IN_SECONDS, 'number');
});

test('does not add SESSION_WARNING_EXPIRATION_IN_SECONDS for anonymous users', () => {
  const req = { user: { isAuthenticated: () => false } };
  const res = { locals: {} };

  templateLocals(req, res, () => {});

  assert.strictEqual(res.locals.SESSION_WARNING_EXPIRATION_IN_SECONDS, undefined);
});
