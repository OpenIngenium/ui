const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const request = require('supertest');
const { loadWithEnv } = require('../helpers/loadWithEnv');

function startFakeCore(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function buildApp(coreRouter) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { getToken: () => 'test-token' };
    next();
  });
  app.use('/core', coreRouter);
  return app;
}

test('POST /execution/update PATCHes the description and maps 204 -> 200', async (t) => {
  const core = await startFakeCore((req, res) => {
    assert.strictEqual(req.method, 'PATCH');
    assert.strictEqual(req.url, '/executions/exec-1');
    res.writeHead(204);
    res.end();
  });
  t.after(() => core.close());
  const { port } = core.address();
  const [coreRoutes] = loadWithEnv({ CORE_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/core']);

  const res = await request(buildApp(coreRoutes))
    .post('/core/execution/update')
    .send({ execution_id: 'exec-1', description: 'updated' });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { description: 'updated' });
});

test('POST /execution/:executionId/close sets status to CLOSED', async (t) => {
  const core = await startFakeCore((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      assert.strictEqual(req.url, '/executions/exec-1/status');
      assert.deepStrictEqual(JSON.parse(body), { status: 'CLOSED' });
      res.writeHead(200);
      res.end();
    });
  });
  t.after(() => core.close());
  const { port } = core.address();
  const [coreRoutes] = loadWithEnv({ CORE_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/core']);

  const res = await request(buildApp(coreRoutes)).post('/core/execution/exec-1/close');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, {});
});

test('POST /execution/:executionId/resume forwards the venue_id and response status/body', async (t) => {
  const core = await startFakeCore((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ resumed: true }));
  });
  t.after(() => core.close());
  const { port } = core.address();
  const [coreRoutes] = loadWithEnv({ CORE_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/core']);

  const res = await request(buildApp(coreRoutes))
    .post('/core/execution/exec-1/resume')
    .send({ venue_id: 'venue-9' });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { resumed: true });
});

test('POST /execution/:executionId/resume defaults venue_id to an empty string', async (t) => {
  let receivedBody = '';
  const core = await startFakeCore((req, res) => {
    req.on('data', (c) => { receivedBody += c; });
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{}');
    });
  });
  t.after(() => core.close());
  const { port } = core.address();
  const [coreRoutes] = loadWithEnv({ CORE_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/core']);

  await request(buildApp(coreRoutes)).post('/core/execution/exec-1/resume').send({});
  assert.deepStrictEqual(JSON.parse(receivedBody), { venue_id: '' });
});

test('POST /execution/:executionId/halt/step halts and always returns 200', async (t) => {
  const core = await startFakeCore((req, res) => {
    assert.strictEqual(req.url, '/executions/exec-1/halt');
    res.writeHead(200);
    res.end();
  });
  t.after(() => core.close());
  const { port } = core.address();
  const [coreRoutes] = loadWithEnv({ CORE_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/core']);

  const res = await request(buildApp(coreRoutes)).post('/core/execution/exec-1/halt/step');
  assert.strictEqual(res.status, 200);
});
