/**
 * Port of src/ingenium/urls/auth_service_urls.py + views/requests/ajax/role_api.py, ldap_api.py
 * + views/requests/proxy/auth_service/auth_service_role_proxy.py, auth_service_ldap_proxy.py
 */
const express = require('express');
const config = require('../config');
const { getRequest, postRequest, putRequest, deleteRequest } = require('../lib/httpClient');
const { asyncHandler } = require('../lib/asyncHandler');

const router = express.Router();

function toList(csv) {
  if (!csv) return [];
  return String(csv).split(',').map((s) => s.trim());
}

router.post('/roles/add/role', asyncHandler(async (req, res) => {
  const { name, description, permissions = [], users_id: usersId, groups_id: groupsId } = req.body || {};

  if (!name) {
    return res.status(400).json({ errors: ['Name is required'] });
  }

  const response = await postRequest(config.AUTH_ROLES_URL, {
    data: { name, description: description || '', permissions, users: toList(usersId), groups: toList(groupsId) },
    token: req.user.getToken(),
  });

  return res.status(response.status).json({});
}));

router.post('/roles/update/role', asyncHandler(async (req, res) => {
  const { role_id: roleId, name, description, permissions = [], users_id: usersId, groups_id: groupsId } = req.body || {};

  if (!name) return res.status(400).json({ errors: ['Name is required'] });
  if (!roleId) return res.status(400).json({ errors: ['Role ID no defined'] });

  const response = await putRequest(`${config.AUTH_ROLES_URL}${roleId}`, {
    data: { name, description: description || '', permissions, users: toList(usersId), groups: toList(groupsId) },
    token: req.user.getToken(),
  });

  return res.status(response.status).json({});
}));

router.post('/roles/delete/role', asyncHandler(async (req, res) => {
  const { role_id: roleId } = req.body || {};

  if (!roleId) return res.status(400).json({ errors: ['Missing Role Id'] });

  const response = await deleteRequest(`${config.AUTH_ROLES_URL}${roleId}`, { token: req.user.getToken() });

  return res.status(response.status).json({});
}));

router.get('/lookup/user', asyncHandler(async (req, res) => {
  const response = await getRequest(config.AUTH_LDAP_USER_LOOKUP, {
    params: { q: req.query.q },
    token: req.user.getToken(),
  });

  if (response.status !== 200) {
    return res.status(400).json({ errors: ['Issue connecting to auth service'] });
  }

  const usernames = (response.data || []).map((user) => user.username);
  return res.status(200).json(usernames);
}));

router.get('/lookup/group', asyncHandler(async (req, res) => {
  const response = await getRequest(config.AUTH_LDAP_GROUP_LOOKUP, {
    params: { q: req.query.q },
    token: req.user.getToken(),
  });

  if (response.status !== 200) {
    return res.status(400).json({ errors: ['Issue connecting to auth service'] });
  }

  return res.status(200).json(response.data);
}));

module.exports = router;
