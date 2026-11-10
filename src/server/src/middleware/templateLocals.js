/**
 * Port of src/ingenium/context_processors/__init__.py (global_settings, user_session)
 * Injects shared variables into every EJS render via res.locals.
 */
const config = require('../config');

function templateLocals(req, res, next) {
  res.locals.APPLICATION_TITLE = config.APPLICATION_TITLE;
  res.locals.APPLICATION_ACRONYM = config.APPLICATION_ACRONYM;
  res.locals.HEADER_JS_BUNDLE = config.HEADER_JS_BUNDLE;
  res.locals.UI_CUSTOM_FOOTER = config.UI_CUSTOM_FOOTER;
  res.locals.FROALA_KEY = config.FROALA_KEY;
  res.locals.CMD_STRING_FORMAT = config.CMD_STRING_FORMAT;

  if (req.user && req.user.isAuthenticated()) {
    res.locals.SESSION_WARNING_EXPIRATION_IN_SECONDS = config.SESSION_WARNING_EXPIRATION_IN_SECONDS;
  }

  next();
}

module.exports = { templateLocals };
