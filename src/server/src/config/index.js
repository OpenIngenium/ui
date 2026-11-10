/**
 * Central config module. Mirrors src/settings/base.py (Django) env-driven settings.
 */
const path = require('path');

const env = (key, fallback = undefined) => process.env[key] !== undefined ? process.env[key] : fallback;

const CORE_API_URL = env('CORE_API_URL');
const AUTH_API_URL = env('AUTH_API_URL');
const DICT_API_URL = env('DICT_API_URL');
const ARCHIVE_API_URL = env('ARCHIVE_API_URL');
const EXECUTION_SERVER_URL = env('EXECUTION_SERVER_URL');
const REPORT_API_URL = env('REPORT_API_URL');
const SEARCH_API_URL = env('SEARCH_API_URL');
const EXECUTION_MONITOR_URL = env('EXECUTION_MONITOR_URL');

// The Vue client itself calls these path prefixes directly (e.g. `/core_server/api/v5/venues`),
// expecting NGINX to reverse-proxy them straight through to the backend host (see
// ingenium-https.conf `location /core_server/ { proxy_pass ... }`).
// This was never handled by Django - NGINX did it. Since this dev server replaces Django
// only (not NGINX), these origins are used to reverse-proxy those same prefixes here too.
function originOf(url) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch (e) {
    return undefined;
  }
}


module.exports = {
  PORT: parseInt(env('PORT', '5000'), 10),
  NODE_ENV: env('NODE_ENV', 'production'),

  APPLICATION_TITLE: env('APPLICATION_TITLE', 'Europa Clipper'),
  APPLICATION_ACRONYM: env('APPLICATION_ACRONYM', 'Europa Clipper Ingenium'),
  UI_CUSTOM_FOOTER: env('UI_CUSTOM_FOOTER', ''),
  FROALA_KEY: env('FROALA_KEY', ''),

  // Configurable command-string format for the CMD "Lookup" builder. Rendered client-side by
  // src/client/src/modules/elements/executable/cmd/cmd-string-format.js. Tokens:
  // {{STEM}}, {{PRE_ARGS}}...{{/PRE_ARGS}}, {{POST_ARGS}}...{{/POST_ARGS}}, {{#ARGS}}...{{/ARGS}},
  // {{ARG_NAME}}, {{ARG_VALUE}}, {{SEP}}...{{/SEP}}.
  // Full reference: docs/Configuration.md#command-string-format
  CMD_STRING_FORMAT: env('CMD_STRING_FORMAT', '{{STEM}}{{PRE_ARGS}},{{/PRE_ARGS}}{{#ARGS}}{{ARG_VALUE}}{{SEP}},{{/SEP}}{{/ARGS}}'),

  // Replaces Django's SECRET_KEY usage for CSRF token signing (settings/base.py SECRET_KEY).
  CSRF_SECRET: env('CSRF_SECRET', 'change-me-in-production'),

  VERIFY_REQUESTS_SSL: env('VERIFY_REQUESTS_SSL', 'false') === 'true',
  ENABLE_DEBUG_INFORMATION: env('UI_ENABLE_DEBUG_INFORMATION', 'False').toLowerCase() === 'true',

  // Static/client build output (replaces STATICFILES_DIRS -> client/dist)
  CLIENT_DIST_DIR: path.join(__dirname, '..', '..', '..', 'client', 'dist'),
  // Legacy static assets (jquery/bootstrap/global.css/favicon/etc). Originally lived under
  // src/ingenium/static and were collected by django.contrib.staticfiles; copied into
  // src/server/static so they no longer depend on the (now removed) Django app. Served
  // alongside client/dist under the same /static/ prefix so page templates keep working.
  LEGACY_STATIC_DIR: path.join(__dirname, '..', '..', 'static'),
  VIEWS_DIR: path.join(__dirname, '..', 'views'),

  // Auth
  AUTH_API_URL,
  AUTH_LOGIN_URL: AUTH_API_URL ? AUTH_API_URL + 'login/' : undefined,
  AUTH_LOGOUT_URL: AUTH_API_URL ? AUTH_API_URL + 'logout/' : undefined,
  AUTH_REFRESH_TOKEN_URL: AUTH_API_URL ? AUTH_API_URL + 'refresh_token/' : undefined,
  AUTH_METHOD: env('AUTH_METHOD', 'password').toLowerCase(),
  AUTH_HEALTH_CHECK_URL: AUTH_API_URL ? AUTH_API_URL + 'health/' : undefined,
  AUTH_LDAP_URL: AUTH_API_URL ? AUTH_API_URL + 'ldap/' : undefined,
  AUTH_LDAP_USER_LOOKUP: AUTH_API_URL ? AUTH_API_URL + 'ldap/users/' : undefined,
  AUTH_LDAP_GROUP_LOOKUP: AUTH_API_URL ? AUTH_API_URL + 'ldap/groups/' : undefined,
  AUTH_GROUPS_URL: AUTH_API_URL ? AUTH_API_URL + 'groups/' : undefined,
  AUTH_USERS_URL: AUTH_API_URL ? AUTH_API_URL + 'users/' : undefined,
  AUTH_ROLES_URL: AUTH_API_URL ? AUTH_API_URL + 'roles/' : undefined,
  AUTH_PERMISSIONS_URL: AUTH_API_URL ? AUTH_API_URL + 'permissions/' : undefined,
  AUTH_SECRET_KEY_ALGORITHMS: ['RS256'],
  // Real docker-compose passes this as `PUBLIC_PEM` (see the `ui` service env in
  // docker-compose.yml).
  AUTH_PUBLIC_PEM: env('PUBLIC_PEM'),

  // Core / Execution / Procedure API
  CORE_API_URL,
  CORE_HEALTH_CHECK: CORE_API_URL ? CORE_API_URL + 'health/' : undefined,
  EXECUTIONS_URL: CORE_API_URL ? CORE_API_URL + 'executions/' : undefined,
  PROCEDURES_URL: CORE_API_URL ? CORE_API_URL + 'procedures/' : undefined,
  COMMENTS_URL_TEMPLATE: CORE_API_URL ? CORE_API_URL + 'elements/{0}/comments' : undefined,
  DELETE_ELEMENT_TEMPLATE: CORE_API_URL ? CORE_API_URL + 'steps/{0}' : undefined,
  VENUES_URL: CORE_API_URL ? CORE_API_URL + 'venues/' : undefined,

  EXECUTION_SERVER_URL,
  EXECUTION_SERVER_HEALTH_CHECK_URL: EXECUTION_SERVER_URL ? EXECUTION_SERVER_URL + 'health' : undefined,

  // Archive
  ARCHIVE_API_URL,
  ARCHIVE_HEALTH_CHECK: ARCHIVE_API_URL ? ARCHIVE_API_URL + 'health' : undefined,

  // Dictionary
  DICT_API_URL,
  DICTIONARY_HEALTH_CHECK_URL: DICT_API_URL ? DICT_API_URL + 'health' : undefined,

  // Report / Search services (client calls /report_server, /search_server directly - see
  // ingenium-https.conf)
  REPORT_API_URL,
  SEARCH_API_URL,

  // Live execution status updates (socket.io/WebSocket, client calls /execution_monitor directly)
  EXECUTION_MONITOR_URL,

  // Origins for the client's direct `/core_server`, `/auth_server`, `/dict_server`,
  // `/report_server`, `/search_server`, `/execution_monitor` reverse-proxy calls (previously
  // handled by NGINX, not Django - see routes/clientProxy.js). One URL per service - the
  // origin (protocol+host) is extracted from the same *_API_URL used for server-side calls,
  // no separate *_HOST var needed.
  CORE_SERVER_ORIGIN: originOf(CORE_API_URL),
  AUTH_SERVER_ORIGIN: originOf(AUTH_API_URL),
  DICT_SERVER_ORIGIN: originOf(DICT_API_URL),
  REPORT_SERVER_ORIGIN: originOf(REPORT_API_URL),
  SEARCH_SERVER_ORIGIN: originOf(SEARCH_API_URL),
  EXECUTION_MONITOR_ORIGIN: originOf(EXECUTION_MONITOR_URL),

  // Login / session
  LOGIN_URL: '/login/',
  LOGIN_REDIRECT_AFTER_LOGIN: '/',
  LOGIN_EXEMPT_PATHS: [/^static\//, /^login\/?$/, /^logout\/?$/],
  SESSION_WARNING_EXPIRATION_IN_SECONDS: 70,
  SESSION_RENEW_IAT_AFTER_MINS: 3,

  // JS bundle filenames (populated at build/deploy time same as Django did via env vars).
  // Defaults match the plain (non-timestamped) filenames emitted by `npm run build:single-node`
  // in src/client/dist, so pages render out of the box in local/dev without extra env setup.
  AUTHORING_JS_BUNDLE: env('AUTHORING_JS_BUNDLE', 'authoring-bundle.js'),
  DASHBOARD_JS_BUNDLE: env('DASHBOARD_JS_BUNDLE', 'dashboard-bundle.js'),
  EXECUTE_AS_RUN_JS_BUNDLE: env('EXECUTE_AS_RUN_JS_BUNDLE', 'execute-as-run-bundle.js'),
  EXECUTION_JS_BUNDLE: env('EXECUTION_JS_BUNDLE', 'execution-bundle.js'),
  EXECUTIONS_JS_BUNDLE: env('EXECUTIONS_JS_BUNDLE', 'executions-bundle.js'),
  PROJECT_CONFIG_JS_BUNDLE: env('PROJECT_CONFIG_JS_BUNDLE', 'project-config-bundle.js'),
  VENUE_DETAIL_JS_BUNDLE: env('VENUE_DETAIL_JS_BUNDLE', 'venue-detail-bundle.js'),
  REPORTING_JS_BUNDLE: env('REPORTING_JS_BUNDLE', 'reporting-bundle.js'),
  HEADER_JS_BUNDLE: env('HEADER_JS_BUNDLE', 'header-bundle.js'),
  ADMIN_JS_BUNDLE: env('ADMIN_JS_BUNDLE', 'admin-bundle.js'),
  SEARCH_JS_BUNDLE: env('SEARCH_JS_BUNDLE', 'search-bundle.js'),
};
