/**
 * Auth-gated file serving. Port of the access-control behavior of the (now removed) Django
 * view src/ingenium/views/files/serve_file.py, and the nginx `internal;` location it fed via
 * X-Accel-Redirect (see ingenium-https.conf,
 * `location ~* ^/file_server_internal(.*) { internal; ... }`).
 *
 * The client links to `/file_server/<path>` as plain browser GETs - <img src>, <a href download>,
 * window.location.origin + ... navigation, and Froala-inserted content (see
 * src/client/src/api/core-urls.js) - none of which carry an Authorization header. Because this
 * router is mounted (in app.js) *after* the `loginRequired` middleware, only a request with a
 * valid `access_token` session cookie reaches this handler; everything else is already
 * redirected to /login by loginRequired.
 *
 * This route does not fetch or stream the file itself - it hands off to nginx's internal-only
 * `/file_server_internal/` location via the X-Accel-Redirect response header, so nginx (not
 * this Node process) streams the (potentially large) file bytes from the upstream file server.
 */
const express = require('express');

const router = express.Router();

router.get(/^\/(.*)/, (req, res) => {
  res.set('X-Accel-Redirect', `/file_server_internal/${req.params[0]}`);
  res.end();
});

module.exports = router;
