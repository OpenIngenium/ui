/**
 * Port of src/ingenium/urls/core_urls.py + views/requests/ajax/execution_api.py
 * + views/requests/proxy/core/core_execution_proxy.py
 */
const express = require('express');
const config = require('../config');
const { postRequest, patchRequest } = require('../lib/httpClient');
const { asyncHandler } = require('../lib/asyncHandler');

const router = express.Router();

router.post('/execution/update', asyncHandler(async (req, res) => {
  const { description, execution_id: executionId } = req.body || {};

  const executionCrudUrl = `${config.EXECUTIONS_URL}${executionId}`;

  const response = await patchRequest(executionCrudUrl, {
    data: { description },
    token: req.user.getToken(),
  });

  let statusCode = response.status;
  if (statusCode === 204) statusCode = 200;

  return res.status(statusCode).json({ description });
}));

router.post('/execution/:executionId/close', asyncHandler(async (req, res) => {
  const url = `${config.EXECUTIONS_URL}${req.params.executionId}/status`;

  await postRequest(url, {
    data: { status: 'CLOSED' },
    token: req.user.getToken(),
  });

  return res.status(200).json({});
}));

router.post('/execution/:executionId/resume', asyncHandler(async (req, res) => {
  const { venue_id: venueId } = req.body || {};
  const url = `${config.EXECUTIONS_URL}${req.params.executionId}/resume`;

  const response = await postRequest(url, {
    data: { venue_id: venueId || '' },
    token: req.user.getToken(),
  });

  return res.status(response.status).json(response.data);
}));

router.post('/execution/:executionId/halt/step', asyncHandler(async (req, res) => {
  const url = `${config.EXECUTIONS_URL}${req.params.executionId}/halt`;

  await postRequest(url, { token: req.user.getToken() });

  return res.status(200).json({});
}));

module.exports = router;
