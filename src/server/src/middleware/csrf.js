/**
 * Port of Django's global CsrfViewMiddleware (src/settings/base.py MIDDLEWARE_CLASSES:
 * 'django.middleware.csrf.CsrfViewMiddleware'), which protected every non-safe request
 * (POST/PUT/PATCH/DELETE) including the login form ({% csrf_token %} in
 * apps/ingenium_login/templates/ingenium_login/login_form_widget.html).
 *
 * Uses the double-submit-cookie pattern: a signed token is set in a cookie and must also
 * be echoed back by the client (hidden form field for HTML forms, header for AJAX/XHR).
 */
const { doubleCsrf } = require('csrf-csrf');
const config = require('../config');

const CSRF_SECRET = config.CSRF_SECRET;

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieName: 'csrf_token',
  cookieOptions: {
    sameSite: 'strict',
    secure: config.NODE_ENV === 'production',
    httpOnly: false, // must be readable by client JS to attach to AJAX headers, like Django's csrftoken cookie
  },
  getSessionIdentifier: (req) => (req.user && req.user.isAuthenticated() ? req.user.getUsername() : 'anonymous'),
  getCsrfTokenFromRequest: (req) => (req.body && req.body._csrf) || req.get('X-CSRF-Token'),
});

function attachCsrfToken(req, res, next) {
  res.locals.csrf_token = generateCsrfToken(req, res);
  next();
}

function csrfErrorHandler(err, req, res, next) {
  if (err === invalidCsrfTokenError) {
    return res.status(403).render('403');
  }
  return next(err);
}

module.exports = { doubleCsrfProtection, attachCsrfToken, csrfErrorHandler };
