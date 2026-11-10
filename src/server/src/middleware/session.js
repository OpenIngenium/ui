/**
 * Port of src/ingenium/middleware/ingenium_session_middleware.py
 * Checks JWT expiration on every request; logs the user out if the token has expired.
 */
const jwt = require('jsonwebtoken');
const { logoutRequest } = require('../routes/login');

function checkSessionExpiration(req, res, next) {
  if (req.user && req.user.isAuthenticated()) {
    try {
      req.user.getUsername();
    } catch (err) {
      // Covers TokenExpiredError, NotBeforeError, and generic JsonWebTokenError (bad
      // signature/malformed) - all are JsonWebTokenError subclasses/instances and should be
      // treated as logged out, not surfaced as a server error.
      if (err instanceof jwt.JsonWebTokenError) {
        return logoutRequest(req, res);
      }
      return next(err);
    }
  }

  next();
}

module.exports = { checkSessionExpiration };
