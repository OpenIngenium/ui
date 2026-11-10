/**
 * Port of src/apps/ingenium_login/views/login_page.py + token_controller.py
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getRequest, postRequest } = require('../lib/httpClient');
const { IngeniumUser } = require('../lib/ingeniumUser');
const { asyncHandler } = require('../lib/asyncHandler');

const router = express.Router();

const SECRET_LABEL = config.AUTH_METHOD === 'rsa' ? 'RSA (PIN + TOKENCODE)' : 'JPL Password';

function isAbsolute(url) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(url || '') || (url || '').startsWith('//');
}

function getRedirect(req) {
  let redirect = config.LOGIN_REDIRECT_AFTER_LOGIN;
  if (req.query && req.query.next) {
    redirect = req.query.next;
    if (redirect && !isAbsolute(redirect)) {
      return redirect;
    }
    return config.LOGIN_REDIRECT_AFTER_LOGIN;
  }
  return redirect;
}

function renderLoginPage(req, res, redirect, errors) {
  return res.render('login', {
    next: redirect,
    login_errors: errors,
    secret_label: SECRET_LABEL,
    APPLICATION_TITLE: config.APPLICATION_TITLE,
    APPLICATION_ACRONYM: config.APPLICATION_ACRONYM,
  });
}

router.get('/login', (req, res, next) => {
  const redirect = getRedirect(req);

  if (req.user && req.user.isAuthenticated()) {
    return res.redirect(redirect);
  }

  return renderLoginPage(req, res, redirect, null);
});

router.post('/login', asyncHandler(async (req, res) => {
  const redirect = getRedirect(req);
  const { username, password } = req.body || {};

  if (!username || !password) {
    return renderLoginPage(req, res, redirect, 'Missing Username or Password');
  }

  let response;
  try {
    response = await getRequest(config.AUTH_LOGIN_URL, {
      auth: { username, password },
      headers: {
        'content-type': 'application/json',
        'X-AUTH-METHOD': config.AUTH_METHOD,
      },
    });
  } catch (err) {
    // Auth service unreachable/misconfigured - never propagate raw axios error (may echo
    // back request internals). Show a generic error on the login page instead.
    return renderLoginPage(req, res, redirect, 'Unable to reach authentication service. Please try again later.');
  }

  const body = response.data || {};

  if (response.status !== 200) {
    return renderLoginPage(req, res, redirect, body.message || 'Authentication failed');
  }

  const user = new IngeniumUser(body.access_token);
  user.access_token_timeout = body.access_token_timeout;

  res.cookie('access_token', user.getToken());
  res.cookie('access_token_timeout', user.access_token_timeout);
  res.cookie('expiration_date', user.getAccessExpiration());

  return res.redirect(redirect);
}));

async function logoutRequest(req, res) {
  let redirectTo = '/';

  if (req.query && req.query.next) {
    const redirect = req.query.next;
    if (redirect && !isAbsolute(redirect)) {
      redirectTo = `/login?next=${redirect}`;
    }
  }

  if (req.user && req.user.getToken()) {
    try {
      await postRequest(config.AUTH_LOGOUT_URL, { token: req.user.getToken() });
    } catch (err) {
      // best-effort logout call to auth service; proceed regardless
    }
  }

  res.clearCookie('access_token');
  res.clearCookie('access_token_timeout');
  res.clearCookie('expiration_date');

  return res.redirect(redirectTo);
}

router.get('/logout', asyncHandler((req, res) => logoutRequest(req, res)));

router.post('/renew', asyncHandler((req, res) => renewTokenRequestHandler(req, res)));

async function renewTokenRequestHandler(req, res) {
  const nextRedirect = (req.query && req.query.next) || '';

  if (!req.user || !req.user.isAuthenticated()) {
    return res.redirect(nextRedirect ? `/login?next=${nextRedirect}` : '/login');
  }

  const response = await postRequest(config.AUTH_REFRESH_TOKEN_URL, {
    token: req.user.getToken(),
  });

  if (response.status === 200) {
    const body = response.data || {};
    const decoded = jwt.verify(body.access_token, config.AUTH_PUBLIC_PEM, {
      algorithms: config.AUTH_SECRET_KEY_ALGORITHMS,
    });

    const expires = new Date(decoded.exp * 1000);
    res.cookie('access_token', body.access_token, { expires });
    res.cookie('expiration_date', decoded.exp, { expires });

    return res.status(200).json({});
  }

  // 403 = past the absolute session ceiling, 401 = token already expired/invalid by the time
  // renewal was attempted - either way the session can never be renewed again, so force a full
  // logout instead of leaving a stale/expired cookie in place. Any other status (5xx, transient
  // upstream/network issues) is NOT treated as a hard failure - the existing cookie is still
  // potentially valid, so just propagate the status and let the next scheduled renewal retry.
  if (response.status === 401 || response.status === 403) {
    return res.redirect(nextRedirect ? `/logout?next=${nextRedirect}` : '/logout');
  }

  return res.status(response.status).json({});
}

module.exports = { router, logoutRequest };
