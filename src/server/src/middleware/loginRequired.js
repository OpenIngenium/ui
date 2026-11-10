/**
 * Port of src/ingenium/middleware/ingenium_login_middleware.py (LoginRequiredMiddleware)
 * Redirects unauthenticated users to LOGIN_URL for any non-exempt path.
 */
const config = require('../config');

function isExempt(path) {
  return config.LOGIN_EXEMPT_PATHS.some((re) => re.test(path));
}

function loginRequired(req, res, next) {
  if (req.user && req.user.isAuthenticated()) {
    return next();
  }

  const path = req.path.replace(/^\//, '');

  if (isExempt(path)) {
    return next();
  }

  if (path === '') {
    return res.redirect(config.LOGIN_URL);
  }

  const queryString = req.url.split('?')[1];
  const next_ = queryString ? `${config.LOGIN_URL}?next=/${path}?${encodeURIComponent(queryString)}` : `${config.LOGIN_URL}?next=/${path}`;

  return res.redirect(next_);
}

module.exports = { loginRequired };
