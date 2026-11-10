const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../helpers/loadConfig');

test('PORT defaults to 5000 and is parsed as an integer', () => {
  const config = loadConfig({});
  assert.strictEqual(config.PORT, 5000);
});

test('PORT respects the PORT env var', () => {
  const config = loadConfig({ PORT: '8123' });
  assert.strictEqual(config.PORT, 8123);
});

test('derived *_URL fields are undefined when the base API URL is unset', () => {
  const config = loadConfig({});
  assert.strictEqual(config.CORE_API_URL, undefined);
  assert.strictEqual(config.EXECUTIONS_URL, undefined);
  assert.strictEqual(config.CORE_SERVER_ORIGIN, undefined);
});

test('derived *_URL fields are built from the base API URL when set', () => {
  const config = loadConfig({ CORE_API_URL: 'http://127.0.0.1:8002/api/v5/' });
  assert.strictEqual(config.EXECUTIONS_URL, 'http://127.0.0.1:8002/api/v5/executions/');
  assert.strictEqual(config.PROCEDURES_URL, 'http://127.0.0.1:8002/api/v5/procedures/');
  assert.strictEqual(config.CORE_HEALTH_CHECK, 'http://127.0.0.1:8002/api/v5/health/');
});

test('CORE_SERVER_ORIGIN extracts protocol+host only (no path) for the client passthrough proxy', () => {
  const config = loadConfig({ CORE_API_URL: 'http://127.0.0.1:8002/api/v5/' });
  assert.strictEqual(config.CORE_SERVER_ORIGIN, 'http://127.0.0.1:8002');
});

test('an unparseable API URL results in an undefined origin instead of throwing', () => {
  const config = loadConfig({ CORE_API_URL: 'not a url' });
  assert.strictEqual(config.CORE_SERVER_ORIGIN, undefined);
});

test('AUTH_PUBLIC_PEM is populated from PUBLIC_PEM', () => {
  const config = loadConfig({ PUBLIC_PEM: 'from-public-pem' });
  assert.strictEqual(config.AUTH_PUBLIC_PEM, 'from-public-pem');
});

test('AUTH_PUBLIC_PEM is undefined when PUBLIC_PEM is unset', () => {
  const config = loadConfig({});
  assert.strictEqual(config.AUTH_PUBLIC_PEM, undefined);
});

test('JS bundle filenames default to the plain (non-timestamped) build:single-node output names', () => {
  const config = loadConfig({});
  assert.strictEqual(config.AUTHORING_JS_BUNDLE, 'authoring-bundle.js');
  assert.strictEqual(config.HEADER_JS_BUNDLE, 'header-bundle.js');
});

test('JS bundle filenames can be overridden via env vars (deploy-time hashed filenames)', () => {
  const config = loadConfig({ AUTHORING_JS_BUNDLE: 'authoring-bundle.abc123.js' });
  assert.strictEqual(config.AUTHORING_JS_BUNDLE, 'authoring-bundle.abc123.js');
});

test('ENABLE_DEBUG_INFORMATION is only true for the literal string "true" (case-insensitive)', () => {
  assert.strictEqual(loadConfig({ UI_ENABLE_DEBUG_INFORMATION: 'true' }).ENABLE_DEBUG_INFORMATION, true);
  assert.strictEqual(loadConfig({ UI_ENABLE_DEBUG_INFORMATION: 'True' }).ENABLE_DEBUG_INFORMATION, true);
  assert.strictEqual(loadConfig({ UI_ENABLE_DEBUG_INFORMATION: 'yes' }).ENABLE_DEBUG_INFORMATION, false);
  assert.strictEqual(loadConfig({}).ENABLE_DEBUG_INFORMATION, false);
});
