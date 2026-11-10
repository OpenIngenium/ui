const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const fileServerRoutes = require('../../src/routes/fileServer');

function buildApp() {
  const app = express();
  app.use('/file_server', fileServerRoutes);
  return app;
}

test('GET /file_server/:path sets X-Accel-Redirect to the internal location and returns no body', async () => {
  const res = await request(buildApp()).get('/file_server/execution-1/log.txt');

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers['x-accel-redirect'], '/file_server_internal/execution-1/log.txt');
  assert.strictEqual(res.text, '');
});

test('GET /file_server/:path preserves nested path segments', async () => {
  const res = await request(buildApp()).get('/file_server/a/b/c.png');

  assert.strictEqual(res.headers['x-accel-redirect'], '/file_server_internal/a/b/c.png');
});
