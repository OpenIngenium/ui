/**
 * Port of src/ingenium/views/requests/pages/spa_page.py + src/ingenium/urls/page_urls.py
 * Renders the minimal HTML shell for each SPA "app", injecting the compiled JS bundle filename.
 */
const express = require('express');
const config = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('spa/dashboard', { dashboard_js_bundle: config.DASHBOARD_JS_BUNDLE });
});

// Port of src/ingenium/urls/pages_admin_urls.py - every admin sub-route (venues, parsers,
// permissions/groups|users|roles, preferences/personal, procedurelabels, venue_groups) maps
// to this same Vue SPA shell (admin_pages.py admin_page). The other admin_pages.py view
// functions (manage_venues_page, manage_roles_page, etc.) and their templates were dead code
// - not referenced by any URL - so they were intentionally not ported.
router.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.render('spa/admin', { admin_js_bundle: config.ADMIN_JS_BUNDLE });
});

router.get('/authoring/:procedureId/:version', (req, res) => {
  res.render('spa/authoring', { authoring_js_bundle: config.AUTHORING_JS_BUNDLE });
});

router.get('/procedures/:procedureId', (req, res) => {
  res.render('spa/authoring', { authoring_js_bundle: config.AUTHORING_JS_BUNDLE });
});

router.get('/procedures', (req, res) => {
  res.render('spa/authoring', { authoring_js_bundle: config.AUTHORING_JS_BUNDLE });
});

router.get('/executions', (req, res) => {
  res.render('spa/executions', { executions_js_bundle: config.EXECUTIONS_JS_BUNDLE });
});

router.get('/reporting', (req, res) => {
  res.render('spa/reporting', { reporting_js_bundle: config.REPORTING_JS_BUNDLE });
});

router.get('/search', (req, res) => {
  res.render('spa/search', { search_js_bundle: config.SEARCH_JS_BUNDLE });
});

router.get('/execute/:venueId', (req, res) => {
  res.render('spa/execution', { execution_js_bundle: config.EXECUTION_JS_BUNDLE });
});

router.get('/execute_spa/:venueId/:executionId', (req, res) => {
  res.render('spa/execution', { execution_js_bundle: config.EXECUTION_JS_BUNDLE });
});

router.get('/execute/as_run/:executionId', (req, res) => {
  res.render('spa/execution_as_run', { execute_as_run_js_bundle: config.EXECUTE_AS_RUN_JS_BUNDLE });
});

router.get(/^\/project_configuration\/.*$/, (req, res) => {
  res.render('spa/project_config', { project_config_js_bundle: config.PROJECT_CONFIG_JS_BUNDLE });
});

router.get('/venues/:venueId', (req, res) => {
  res.render('spa/venue_detail', {
    venue_id: req.params.venueId,
    venue_detail_js_bundle: config.VENUE_DETAIL_JS_BUNDLE,
  });
});

module.exports = router;
