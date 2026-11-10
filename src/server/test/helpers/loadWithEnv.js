/**
 * Loads one or more modules fresh after setting env vars, so config/index.js (a singleton
 * read once at require-time) and anything that captured a reference to it pick up the new
 * values. Clears the require cache for config + all requested modules both before and after,
 * so tests don't leak state into each other.
 */
function loadWithEnv(env, modulePaths) {
  const resolvedConfigPath = require.resolve('../../src/config');
  const resolvedPaths = modulePaths.map((p) => require.resolve(p));
  const allPaths = [resolvedConfigPath, ...resolvedPaths];
  allPaths.forEach((p) => delete require.cache[p]);

  Object.entries(env).forEach(([k, v]) => {
    process.env[k] = v;
  });

  try {
    return resolvedPaths.map((p) => require(p)); // eslint-disable-line global-require
  } finally {
    Object.keys(env).forEach((k) => delete process.env[k]);
    allPaths.forEach((p) => delete require.cache[p]);
  }
}

module.exports = { loadWithEnv };
