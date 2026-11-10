/**
 * Port of src/ingenium/urls/dict_service_urls.py + views/requests/ajax/dict_service_api.py
 * + views/requests/proxy/dict_service/dict_service_dictionary_proxy.py
 */
const express = require('express');
const config = require('../config');
const { getRequest, patchRequest, deleteRequest } = require('../lib/httpClient');
const { asyncHandler } = require('../lib/asyncHandler');

const router = express.Router();

const DICTIONARY_SSE_ID = 'sse';
const DICTIONARY_FLIGHT_ID = 'flight';

function cmdUrl(dictionaryType, version) {
  return dictionaryType.toLowerCase() === DICTIONARY_SSE_ID
    ? config.DICT_API_URL + `dictionaries/sse/versions/${version}/cmds`
    : config.DICT_API_URL + `dictionaries/flight/versions/${version}/cmds`;
}

function evrUrl(dictionaryType, version) {
  return dictionaryType.toLowerCase() === DICTIONARY_SSE_ID
    ? config.DICT_API_URL + `dictionaries/sse/versions/${version}/evrs`
    : config.DICT_API_URL + `dictionaries/flight/versions/${version}/evrs`;
}

function ehaUrl(dictionaryType, version) {
  return dictionaryType.toLowerCase() === DICTIONARY_SSE_ID
    ? config.DICT_API_URL + `dictionaries/sse/versions/${version}/ehas`
    : config.DICT_API_URL + `dictionaries/flight/versions/${version}/ehas`;
}

router.get('/lookup/cmd/names', asyncHandler(async (req, res) => {
  const { q: commandStem, dictionary_type: dictionaryType, flight_dictionary_version, sse_dictionary_version } = req.query;
  const version = dictionaryType.toLowerCase() === DICTIONARY_SSE_ID ? sse_dictionary_version : flight_dictionary_version;

  const response = await getRequest(cmdUrl(dictionaryType, version), {
    params: { command_stem: commandStem },
    token: req.user.getToken(),
  });

  return res.status(response.status === 200 ? 200 : response.status).json(response.status === 200 ? response.data : {});
}));

router.get('/lookup/evr/names', asyncHandler(async (req, res) => {
  const { q: evrName, dictionary_type: dictionaryType, flight_dictionary_version, sse_dictionary_version } = req.query;
  const version = dictionaryType.toLowerCase() === DICTIONARY_SSE_ID ? sse_dictionary_version : flight_dictionary_version;

  const response = await getRequest(evrUrl(dictionaryType, version), {
    params: { evr_name: evrName },
    token: req.user.getToken(),
  });

  return res.status(response.status === 200 ? 200 : response.status).json(response.status === 200 ? response.data : {});
}));

router.get('/lookup/eha/names', asyncHandler(async (req, res) => {
  const { q: ehaName, dictionary_type: dictionaryType = '', flight_dictionary_version, sse_dictionary_version } = req.query;
  const version = dictionaryType.toLowerCase() === DICTIONARY_SSE_ID ? sse_dictionary_version : flight_dictionary_version;

  const response = await getRequest(ehaUrl(dictionaryType, version), {
    params: { eha_name: ehaName },
    token: req.user.getToken(),
  });

  return res.status(response.status === 200 ? 200 : response.status).json(response.status === 200 ? response.data : {});
}));

router.post('/delete/dictionary', asyncHandler(async (req, res) => {
  const { type: dictionaryType, version } = req.body || {};
  const url = config.DICT_API_URL + `dictionaries/${dictionaryType}/versions/${version}`;

  const response = await deleteRequest(url, { token: req.user.getToken() });

  return res.status(response.status).json({});
}));

async function updateDictionaryParser(req, res, dictionaryType, parserName) {
  if (!parserName) {
    return res.status(400).json({ errors: ['Missing Parser Name'] });
  }

  const url = config.DICT_API_URL + `dictionaries/${dictionaryType}/parsers`;
  const response = await patchRequest(url, {
    data: { parser_name: parserName },
    token: req.user.getToken(),
  });

  return res.status(response.status).json({});
}

router.post('/update/sse/parser', asyncHandler((req, res) => updateDictionaryParser(req, res, DICTIONARY_SSE_ID, (req.body || {}).active_sse_dictionary_parser)));
router.post('/update/flight/parser', asyncHandler((req, res) => updateDictionaryParser(req, res, DICTIONARY_FLIGHT_ID, (req.body || {}).active_flight_dictionary_parser)));

// NOTE: add/update sse/flight dictionary endpoints (add_sse_dictionary, add_flight_dictionary,
// update_sse_dictionary, update_flight_dictionary in the original dict_service_api.py) accept
// multipart file uploads (.xml/.tar dictionary files). Wiring these up requires a multipart
// middleware (e.g. `multer`) plus forwarding the file buffer to DICT_API_URL. Left as a follow-up
// since it needs a dependency decision + testing against the real dictionary service.

module.exports = router;
