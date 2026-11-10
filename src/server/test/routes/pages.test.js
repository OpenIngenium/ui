const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const config = require('../../src/config');
const { templateLocals } = require('../../src/middleware/templateLocals');
const pagesRoutes = require('../../src/routes/pages');

function buildApp() {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', config.VIEWS_DIR);
  // Real app.js always applies templateLocals before any page route - the view partials
  // (partials/head.ejs) depend on res.locals.APPLICATION_TITLE etc being set.
  app.use((req, res, next) => {
    req.user = { isAuthenticated: () => false };
    next();
  });
  app.use(templateLocals);
  app.use('/', pagesRoutes);
  return app;
}

test('/ renders the dashboard SPA shell with the dashboard bundle filename', async () => {
  const app = buildApp();
  const res = await request(app).get('/');
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes(config.DASHBOARD_JS_BUNDLE));
});

test('/admin and any /admin/* sub-path render the admin SPA shell', async () => {
  const app = buildApp();
  const rootAdmin = await request(app).get('/admin');
  const subAdmin = await request(app).get('/admin/procedurelabels');

  assert.strictEqual(rootAdmin.status, 200);
  assert.ok(rootAdmin.text.includes(config.ADMIN_JS_BUNDLE));
  assert.strictEqual(subAdmin.status, 200);
  assert.ok(subAdmin.text.includes(config.ADMIN_JS_BUNDLE));
});

test('/authoring/:procedureId/:version renders the authoring SPA shell', async () => {
  const app = buildApp();
  const res = await request(app).get('/authoring/clipper-procedure-10012/0');
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes(config.AUTHORING_JS_BUNDLE));
});

test('/procedures and /procedures/:procedureId both render the authoring SPA shell', async () => {
  const app = buildApp();
  const list = await request(app).get('/procedures');
  const detail = await request(app).get('/procedures/clipper-procedure-10012');

  assert.strictEqual(list.status, 200);
  assert.ok(list.text.includes(config.AUTHORING_JS_BUNDLE));
  assert.strictEqual(detail.status, 200);
  assert.ok(detail.text.includes(config.AUTHORING_JS_BUNDLE));
});

test('/executions, /reporting, /search each render their own SPA shell', async () => {
  const app = buildApp();
  const executions = await request(app).get('/executions');
  const reporting = await request(app).get('/reporting');
  const search = await request(app).get('/search');

  assert.ok(executions.text.includes(config.EXECUTIONS_JS_BUNDLE));
  assert.ok(reporting.text.includes(config.REPORTING_JS_BUNDLE));
  assert.ok(search.text.includes(config.SEARCH_JS_BUNDLE));
});

test('/execute/:venueId and /execute_spa/:venueId/:executionId render the execution SPA shell', async () => {
  const app = buildApp();
  const live = await request(app).get('/execute/venue-1');
  const spa = await request(app).get('/execute_spa/venue-1/exec-1');

  assert.ok(live.text.includes(config.EXECUTION_JS_BUNDLE));
  assert.ok(spa.text.includes(config.EXECUTION_JS_BUNDLE));
});

test('/execute/as_run/:executionId renders the as-run SPA shell', async () => {
  const app = buildApp();
  const res = await request(app).get('/execute/as_run/exec-1');
  assert.ok(res.text.includes(config.EXECUTE_AS_RUN_JS_BUNDLE));
});

test('/project_configuration/* renders the project config SPA shell', async () => {
  const app = buildApp();
  const res = await request(app).get('/project_configuration/some/nested/path');
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes(config.PROJECT_CONFIG_JS_BUNDLE));
});

test('/venues/:venueId renders the venue-detail SPA shell with the venue id available', async () => {
  const app = buildApp();
  const res = await request(app).get('/venues/venue-42');
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes(config.VENUE_DETAIL_JS_BUNDLE));
  assert.ok(res.text.includes('venue-42'));
});
