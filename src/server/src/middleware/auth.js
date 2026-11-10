/**
 * Port of src/ingenium/middleware/ingenium_user_middleware.py
 * Attaches req.user derived purely from the access_token cookie (no DB).
 */
const { IngeniumUser, IngeniumAnonymousUser } = require('../lib/ingeniumUser');

function attachUser(req, res, next) {
  const accessToken = req.cookies ? req.cookies.access_token : null;

  if (accessToken) {
    const user = new IngeniumUser(accessToken);
    user.access_token_timeout = req.cookies.access_token_timeout || null;
    req.user = user;
  } else {
    req.user = new IngeniumAnonymousUser();
  }

  next();
}

module.exports = { attachUser };
