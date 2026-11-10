const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const request = require('supertest');
const { loadWithEnv } = require('../helpers/loadWithEnv');

function startFakeAuth(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function buildApp(authRoutes) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { getToken: () => 'test-token' };
    next();
  });
  app.use('/authentication_service', authRoutes);
  return app;
}

async function withAuthRoutes(handler, testFn) {
  const auth = await startFakeAuth(handler);
  const { port } = auth.address();
  const [authRoutes] = loadWithEnv({ AUTH_API_URL: `http://127.0.0.1:${port}/` }, ['../../src/routes/authService']);
  try {
    await testFn(buildApp(authRoutes));
  } finally {
    auth.close();
  }
}

test('POST /roles/add/role requires a name', async () => {
  await withAuthRoutes(
    () => { throw new Error('should not call upstream without a name'); },
    async (app) => {
      const res = await request(app).post('/authentication_service/roles/add/role').send({});
      assert.strictEqual(res.status, 400);
      assert.deepStrictEqual(res.body, { errors: ['Name is required'] });
    },
  );
});

test('POST /roles/add/role converts comma-separated users/groups into lists', async () => {
  let receivedBody = '';
  await withAuthRoutes(
    (req, res) => {
      assert.strictEqual(req.method, 'POST');
      assert.strictEqual(req.url, '/roles/');
      req.on('data', (c) => { receivedBody += c; });
      req.on('end', () => {
        res.writeHead(201);
        res.end();
      });
    },
    async (app) => {
      const res = await request(app).post('/authentication_service/roles/add/role').send({
        name: 'Reviewer',
        users_id: 'alice, bob',
        groups_id: 'group1,group2',
      });
      assert.strictEqual(res.status, 201);
      assert.deepStrictEqual(JSON.parse(receivedBody), {
        name: 'Reviewer',
        description: '',
        permissions: [],
        users: ['alice', 'bob'],
        groups: ['group1', 'group2'],
      });
    },
  );
});

test('POST /roles/update/role requires both name and role_id', async () => {
  await withAuthRoutes(
    () => { throw new Error('should not call upstream'); },
    async (app) => {
      const missingRoleId = await request(app).post('/authentication_service/roles/update/role').send({ name: 'X' });
      assert.strictEqual(missingRoleId.status, 400);
      assert.deepStrictEqual(missingRoleId.body, { errors: ['Role ID no defined'] });

      const missingName = await request(app).post('/authentication_service/roles/update/role').send({ role_id: '1' });
      assert.strictEqual(missingName.status, 400);
      assert.deepStrictEqual(missingName.body, { errors: ['Name is required'] });
    },
  );
});

test('POST /roles/update/role PUTs to the role-specific URL', async () => {
  await withAuthRoutes(
    (req, res) => {
      assert.strictEqual(req.method, 'PUT');
      assert.strictEqual(req.url, '/roles/role-42');
      res.writeHead(200);
      res.end();
    },
    async (app) => {
      const res = await request(app).post('/authentication_service/roles/update/role').send({
        role_id: 'role-42',
        name: 'Reviewer',
      });
      assert.strictEqual(res.status, 200);
    },
  );
});

test('POST /roles/delete/role requires a role_id', async () => {
  await withAuthRoutes(
    () => { throw new Error('should not call upstream without a role_id'); },
    async (app) => {
      const res = await request(app).post('/authentication_service/roles/delete/role').send({});
      assert.strictEqual(res.status, 400);
      assert.deepStrictEqual(res.body, { errors: ['Missing Role Id'] });
    },
  );
});

test('POST /roles/delete/role DELETEs the role-specific URL', async () => {
  await withAuthRoutes(
    (req, res) => {
      assert.strictEqual(req.method, 'DELETE');
      assert.strictEqual(req.url, '/roles/role-42');
      res.writeHead(200);
      res.end();
    },
    async (app) => {
      const res = await request(app).post('/authentication_service/roles/delete/role').send({ role_id: 'role-42' });
      assert.strictEqual(res.status, 200);
    },
  );
});

test('GET /lookup/user maps the upstream user list down to usernames', async () => {
  await withAuthRoutes(
    (req, res) => {
      assert.ok(req.url.includes('q=jsmith'));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify([{ username: 'jsmith', extra: 'ignored' }, { username: 'asmith' }]));
    },
    async (app) => {
      const res = await request(app).get('/authentication_service/lookup/user').query({ q: 'jsmith' });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, ['jsmith', 'asmith']);
    },
  );
});

test('GET /lookup/user returns a 400 wrapper error when the upstream LDAP lookup fails', async () => {
  await withAuthRoutes(
    (req, res) => {
      res.writeHead(500);
      res.end();
    },
    async (app) => {
      const res = await request(app).get('/authentication_service/lookup/user').query({ q: 'jsmith' });
      assert.strictEqual(res.status, 400);
      assert.deepStrictEqual(res.body, { errors: ['Issue connecting to auth service'] });
    },
  );
});

test('GET /lookup/group returns the raw upstream group list', async () => {
  await withAuthRoutes(
    (req, res) => {
      assert.ok(req.url.includes('q=admins'));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(['admins', 'reviewers']));
    },
    async (app) => {
      const res = await request(app).get('/authentication_service/lookup/group').query({ q: 'admins' });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, ['admins', 'reviewers']);
    },
  );
});
