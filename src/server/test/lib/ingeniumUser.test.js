const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

// Generate a throwaway RSA keypair once for signing/verifying test tokens - AUTH_PUBLIC_PEM
// is read by config/index.js, which ingeniumUser.js depends on for jwt.verify().
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// config/index.js is a plain object built once at require-time from process.env, and
// ingeniumUser.js captures a reference to that object at its own require-time. Both module
// caches must be cleared and re-required together after setting PUBLIC_PEM, or ingeniumUser
// will keep using whatever (likely undefined) AUTH_PUBLIC_PEM was baked in by an earlier test.
function loadIngeniumUser() {
  const configPath = require.resolve('../../src/config');
  const userPath = require.resolve('../../src/lib/ingeniumUser');
  delete require.cache[configPath];
  delete require.cache[userPath];

  process.env.PUBLIC_PEM = publicKey;
  try {
    // eslint-disable-next-line global-require
    return require(userPath);
  } finally {
    delete process.env.PUBLIC_PEM;
    delete require.cache[configPath];
    delete require.cache[userPath];
  }
}

function signToken(payload) {
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

test('IngeniumUser decodes a valid access token', () => {
  const { IngeniumUser } = loadIngeniumUser();
  const token = signToken({
    username: 'mrkhan',
    scopes: ['basic', 'admin'],
    roles: ['Reviewer'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const user = new IngeniumUser(token);
  assert.strictEqual(user.isAuthenticated(), true);
  assert.strictEqual(user.getUsername(), 'mrkhan');
  assert.strictEqual(user.getFullName(), 'mrkhan');
  assert.strictEqual(user.isAdmin(), true);
  assert.deepStrictEqual(user.getPermissions(), ['basic', 'admin']);
  assert.deepStrictEqual(user.getRoles(), ['Reviewer']);
  assert.strictEqual(user.getToken(), token);
  assert.strictEqual(user.getImageUrl(), '/static/images/default-profile-photo.jpeg');
});

test('IngeniumUser.getAccessExpiration and getAccessIat return the token exp/iat claims', () => {
  const { IngeniumUser } = loadIngeniumUser();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const token = signToken({ username: 'mrkhan', scopes: [], iat, exp });

  const user = new IngeniumUser(token);
  assert.strictEqual(user.getAccessIat(), iat);
  assert.strictEqual(user.getAccessExpiration(), exp);
});

test('IngeniumUser.isAdmin returns false when admin scope is absent', () => {
  const { IngeniumUser } = loadIngeniumUser();
  const token = signToken({ username: 'someone', scopes: ['basic'] });

  const user = new IngeniumUser(token);
  assert.strictEqual(user.isAdmin(), false);
});

test('IngeniumUser.decodeAccessJwt caches the decoded payload (only decodes once)', () => {
  const { IngeniumUser } = loadIngeniumUser();
  const token = signToken({ username: 'mrkhan', scopes: [] });

  const user = new IngeniumUser(token);
  const first = user.decodeAccessJwt();
  const second = user.decodeAccessJwt();
  assert.strictEqual(first, second);
});

test('IngeniumAnonymousUser is never authenticated, even with a token set', () => {
  const { IngeniumAnonymousUser } = loadIngeniumUser();
  const anon = new IngeniumAnonymousUser();
  assert.strictEqual(anon.isAuthenticated(), false);
  assert.strictEqual(anon.getUsername(), '');
  assert.strictEqual(anon.isAdmin(), false);
  assert.strictEqual(anon.getImageUrl(), '');
});

test('IngeniumUser with no access token returns empty/falsy values without decoding', () => {
  const { IngeniumUser } = loadIngeniumUser();
  const user = new IngeniumUser(null);
  assert.strictEqual(user.isAuthenticated(), false);
  assert.strictEqual(user.getUsername(), '');
  assert.strictEqual(user.getAccessExpiration(), null);
  assert.strictEqual(user.getAccessIat(), null);
  assert.strictEqual(user.getPermissions(), null);
  assert.strictEqual(user.getRoles(), null);
});

test('IngeniumUser throws on a token signed with a different key (bad signature)', () => {
  const { IngeniumUser } = loadIngeniumUser();
  const otherKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const forgedToken = jwt.sign({ username: 'attacker' }, otherKeyPair.privateKey, { algorithm: 'RS256' });

  const user = new IngeniumUser(forgedToken);
  assert.throws(() => user.getUsername());
});
