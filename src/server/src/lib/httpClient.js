/**
 * Port of src/ingenium/views/controllers/request_controller.py
 * Thin wrapper around axios for calling backend microservices (Core, Auth, Dict, Archive).
 */
const axios = require('axios');
const https = require('https');
const config = require('../config');

// Mirrors Django's `requests` lib `verify=VERIFY_REQUESTS_SSL` behavior for outbound calls to
// backend microservices (Core, Auth, Dict, Archive). Only disables cert verification when
// explicitly configured false; shared across requests since https.Agent is stateless here.
const httpsAgent = new https.Agent({ rejectUnauthorized: config.VERIFY_REQUESTS_SSL });

function buildHeaders(token, extra = {}) {
  return {
    'content-type': 'application/json',
    Authorization: token ? `Bearer ${token}` : undefined,
    ...extra,
  };
}

// NEVER log header/auth/token/body values - only method + URL. Credentials (Basic Auth,
// Bearer tokens, form bodies) must never be written to stdout/stderr.
function redactUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch (e) {
    return '[unparseable url]';
  }
}

function logRequest(method, url) {
  if (config.ENABLE_DEBUG_INFORMATION) {
    // eslint-disable-next-line no-console
    console.info(`${method} ${redactUrl(url)}`);
  }
}

function logResponse(response) {
  if (!response || response.status >= 400) {
    // eslint-disable-next-line no-console
    console.warn(`Upstream response status: ${response ? response.status : 'ERR'}`);
  } else if (config.ENABLE_DEBUG_INFORMATION) {
    // eslint-disable-next-line no-console
    console.info(`Upstream response status: ${response.status}`);
  }
}

async function request(method, url, { data, params, token, headers, auth, ...rest } = {}) {
  const finalHeaders = headers || buildHeaders(token);
  logRequest(method, url);

  try {
    const response = await axios({
      method,
      url,
      data,
      params,
      headers: finalHeaders,
      auth,
      httpsAgent,
      validateStatus: () => true, // mirror `requests` lib: don't throw on non-2xx, caller checks status
      ...rest,
    });
    logResponse(response);
    return response;
  } catch (err) {
    logResponse(err.response);
    // Strip the axios error down to a safe, credential-free error before propagating.
    // The raw axios error's `config`/`request` objects contain the Authorization header
    // and request body (which may include a password) and must never be logged upstream.
    const safeError = new Error(`Upstream request to ${redactUrl(url)} failed: ${err.code || err.message}`);
    safeError.status = err.response ? err.response.status : 502;
    throw safeError;
  }
}

module.exports = {
  getRequest: (url, opts) => request('get', url, opts),
  postRequest: (url, opts) => request('post', url, opts),
  putRequest: (url, opts) => request('put', url, opts),
  patchRequest: (url, opts) => request('patch', url, opts),
  deleteRequest: (url, opts) => request('delete', url, opts),
};
