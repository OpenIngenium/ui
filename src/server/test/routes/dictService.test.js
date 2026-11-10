const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const request = require('supertest');
const { loadWithEnv } = require('../helpers/loadWithEnv');

function startFakeDict(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function buildApp(dictRoutes) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { getToken: () => 'test-token' };
    next();
  });
  app.use('/dictionary_service', dictRoutes);
  return app;
}

async function withDictRoutes(handler, testFn) {
  const dict = await startFakeDict(handler);
  const { port } = dict.address();
  const [dictRoutes] = loadWithEnv({ DICT_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/dictService']);
  try {
    await testFn(buildApp(dictRoutes));
  } finally {
    dict.close();
  }
}

test('GET /lookup/cmd/names uses the flight dictionary URL/version by default', async () => {
  await withDictRoutes(
    (req, res) => {
      assert.strictEqual(req.url, '/dictionaries/flight/versions/3/cmds?command_stem=TCM');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(['TCM_1', 'TCM_2']));
    },
    async (app) => {
      const res = await request(app).get('/dictionary_service/lookup/cmd/names').query({
        q: 'TCM',
        dictionary_type: 'flight',
        flight_dictionary_version: 3,
      });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, ['TCM_1', 'TCM_2']);
    },
  );
});

test('GET /lookup/cmd/names uses the SSE dictionary URL/version when dictionary_type=sse', async () => {
  await withDictRoutes(
    (req, res) => {
      assert.strictEqual(req.url, '/dictionaries/sse/versions/7/cmds?command_stem=TCM');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('[]');
    },
    async (app) => {
      const res = await request(app).get('/dictionary_service/lookup/cmd/names').query({
        q: 'TCM',
        dictionary_type: 'sse',
        sse_dictionary_version: 7,
      });
      assert.strictEqual(res.status, 200);
    },
  );
});

test('GET /lookup/cmd/names returns an empty object (not upstream body) on a non-200 upstream response', async () => {
  await withDictRoutes(
    (req, res) => {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'boom' }));
    },
    async (app) => {
      const res = await request(app).get('/dictionary_service/lookup/cmd/names').query({
        q: 'TCM',
        dictionary_type: 'flight',
        flight_dictionary_version: 1,
      });
      assert.strictEqual(res.status, 500);
      assert.deepStrictEqual(res.body, {});
    },
  );
});

test('GET /lookup/evr/names queries by evr_name', async () => {
  await withDictRoutes(
    (req, res) => {
      assert.ok(req.url.includes('evr_name=SOME_EVR'));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('[]');
    },
    async (app) => {
      const res = await request(app).get('/dictionary_service/lookup/evr/names').query({
        q: 'SOME_EVR',
        dictionary_type: 'flight',
        flight_dictionary_version: 1,
      });
      assert.strictEqual(res.status, 200);
    },
  );
});

test('GET /lookup/eha/names queries by eha_name', async () => {
  await withDictRoutes(
    (req, res) => {
      assert.ok(req.url.includes('eha_name=SOME_EHA'));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('[]');
    },
    async (app) => {
      const res = await request(app).get('/dictionary_service/lookup/eha/names').query({
        q: 'SOME_EHA',
        dictionary_type: 'flight',
        flight_dictionary_version: 1,
      });
      assert.strictEqual(res.status, 200);
    },
  );
});

test('POST /delete/dictionary DELETEs the correct versioned dictionary URL', async () => {
  await withDictRoutes(
    (req, res) => {
      assert.strictEqual(req.method, 'DELETE');
      assert.strictEqual(req.url, '/dictionaries/flight/versions/2');
      res.writeHead(200);
      res.end();
    },
    async (app) => {
      const res = await request(app)
        .post('/dictionary_service/delete/dictionary')
        .send({ type: 'flight', version: 2 });
      assert.strictEqual(res.status, 200);
    },
  );
});

test('POST /update/sse/parser requires a parser name', async () => {
  await withDictRoutes(
    () => { throw new Error('should not call upstream without a parser name'); },
    async (app) => {
      const res = await request(app).post('/dictionary_service/update/sse/parser').send({});
      assert.strictEqual(res.status, 400);
      assert.deepStrictEqual(res.body, { errors: ['Missing Parser Name'] });
    },
  );
});

test('POST /update/flight/parser PATCHes the parser name', async () => {
  let receivedBody = '';
  await withDictRoutes(
    (req, res) => {
      assert.strictEqual(req.method, 'PATCH');
      assert.strictEqual(req.url, '/dictionaries/flight/parsers');
      req.on('data', (c) => { receivedBody += c; });
      req.on('end', () => {
        res.writeHead(200);
        res.end();
      });
    },
    async (app) => {
      const res = await request(app)
        .post('/dictionary_service/update/flight/parser')
        .send({ active_flight_dictionary_parser: 'custom-parser' });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(JSON.parse(receivedBody), { parser_name: 'custom-parser' });
    },
  );
});
