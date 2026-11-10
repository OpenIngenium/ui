const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('./config');
const { attachUser } = require('./middleware/auth');
const { checkSessionExpiration } = require('./middleware/session');
const { loginRequired } = require('./middleware/loginRequired');
const { templateLocals } = require('./middleware/templateLocals');
const { doubleCsrfProtection, attachCsrfToken, csrfErrorHandler } = require('./middleware/csrf');

const loginRoutes = require('./routes/login');
const pagesRoutes = require('./routes/pages');
const coreRoutes = require('./routes/core');
const dictServiceRoutes = require('./routes/dictService');
const authServiceRoutes = require('./routes/authService');
const fileServerRoutes = require('./routes/fileServer');
const { mountClientProxyRoutes } = require('./routes/clientProxy');

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', config.VIEWS_DIR);

  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Client-side direct reverse-proxy pass-throughs (/core_server, /auth_server, /dict_server,
  // /report_server, /search_server). Mounted before body-parsers so request bodies are
  // streamed through untouched, and before our own auth/CSRF pipeline since these external
  // services authenticate the request themselves via a Bearer token the client attaches.
  mountClientProxyRoutes(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Static assets. Django's django.contrib.staticfiles served both the compiled Vue bundles
  // (client/dist) AND each app's own static/ folder (ingenium/static: jquery, bootstrap,
  // global.css, favicon, etc). Mirror that by stacking both under /static, checked in order.
  app.use('/static', express.static(config.CLIENT_DIST_DIR));
  app.use('/static', express.static(config.LEGACY_STATIC_DIR));

  // Auth pipeline (replaces IngeniumUserMiddleware, IngeniumSessionMiddleware)
  app.use(attachUser);
  app.use(checkSessionExpiration);
  app.use(templateLocals);

  // CSRF protection (replaces Django's global CsrfViewMiddleware). Applies to every
  // non-safe request (POST/PUT/PATCH/DELETE), including the login form itself.
  app.use(attachCsrfToken);
  app.use(doubleCsrfProtection);

  // Public routes (login/logout/renew) - exempt from loginRequired
  app.use('/', loginRoutes.router);

  // Everything past this point requires authentication (replaces LoginRequiredMiddleware)
  app.use(loginRequired);

  app.use('/core', coreRoutes);
  app.use('/dictionary_service', dictServiceRoutes);
  app.use('/authentication_service', authServiceRoutes);
  // Auth-gated hand-off to nginx's internal-only /file_server_internal/ location (X-Accel-
  // Redirect) - see routes/fileServer.js and ingenium-https.conf. Must stay behind
  // loginRequired above.
  app.use('/file_server', fileServerRoutes);
  app.use('/', pagesRoutes);

  app.use((req, res) => {
    res.status(404).render('404');
  });

  app.use(csrfErrorHandler);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Only log the error message/stack - never the raw error object, since axios/HTTP
    // errors can carry request internals (Authorization headers, POST bodies with
    // passwords) on `err.config`/`err.request`.
    console.error(err && err.message ? err.message : 'Unknown error', err && err.stack);
    res.status((err && err.status) || 500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = createApp;
