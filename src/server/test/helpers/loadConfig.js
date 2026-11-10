/**
 * src/config/index.js reads process.env once at require-time. Tests that need to exercise
 * different env var combinations must clear the require cache and restore process.env
 * afterwards so they don't leak into other test files.
 */
function loadConfig(env = {}) {
  const configPath = require.resolve('../../src/config');
  delete require.cache[configPath];

  const originalEnv = { ...process.env };
  Object.keys(process.env).forEach((key) => delete process.env[key]);
  Object.assign(process.env, env);

  try {
    // eslint-disable-next-line global-require
    return require(configPath);
  } finally {
    Object.keys(process.env).forEach((key) => delete process.env[key]);
    Object.assign(process.env, originalEnv);
    delete require.cache[configPath];
  }
}

module.exports = { loadConfig };
