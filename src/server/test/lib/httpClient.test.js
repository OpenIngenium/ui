const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const {
  getRequest, postRequest, putRequest, patchRequest, deleteRequest,
} = require('../../src/lib/httpClient');

function startFakeUpstream(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function urlFor(server, path = '/') {
  const { port } = server.address();
  return `http://127.0.0.1:${port}${path}`;
}

test('getRequest sends the Authorization header when a token is provided', async (t) => {
  let receivedAuth;
  const upstream = await startFakeUpstream((req, res) => {
    receivedAuth = req.headers.authorization;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });
  t.after(() => upstream.close());

  const response = await getRequest(urlFor(upstream), { token: 'abc.def.ghi' });

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(response.data, { ok: true });
  assert.strictEqual(receivedAuth, 'Bearer abc.def.ghi');
});

test('getRequest omits the Authorization header when no token is provided', async (t) => {
  let receivedAuth;
  const upstream = await startFakeUpstream((req, res) => {
    receivedAuth = req.headers.authorization;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{}');
  });
  t.after(() => upstream.close());

  await getRequest(urlFor(upstream));
  assert.strictEqual(receivedAuth, undefined);
});

test('postRequest sends the request body as JSON', async (t) => {
  let receivedBody = '';
  const upstream = await startFakeUpstream((req, res) => {
    req.on('data', (chunk) => {
      receivedBody += chunk;
    });
    req.on('end', () => {
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ echo: JSON.parse(receivedBody) }));
    });
  });
  t.after(() => upstream.close());

  const response = await postRequest(urlFor(upstream), { data: { status: 'CLOSED' } });
  assert.strictEqual(response.status, 201);
  assert.deepStrictEqual(response.data.echo, { status: 'CLOSED' });
});

test('does not throw on a non-2xx response (validateStatus always true, mirrors `requests`)', async (t) => {
  const upstream = await startFakeUpstream((req, res) => {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'not found' }));
  });
  t.after(() => upstream.close());

  const response = await getRequest(urlFor(upstream));
  assert.strictEqual(response.status, 404);
  assert.deepStrictEqual(response.data, { message: 'not found' });
});

test('putRequest and patchRequest use the correct HTTP methods', async (t) => {
  const methodsSeen = [];
  const upstream = await startFakeUpstream((req, res) => {
    methodsSeen.push(req.method);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{}');
  });
  t.after(() => upstream.close());

  await putRequest(urlFor(upstream), {});
  await patchRequest(urlFor(upstream), {});
  assert.deepStrictEqual(methodsSeen, ['PUT', 'PATCH']);
});

test('deleteRequest uses the DELETE method', async (t) => {
  let methodSeen;
  const upstream = await startFakeUpstream((req, res) => {
    methodSeen = req.method;
    res.writeHead(204);
    res.end();
  });
  t.after(() => upstream.close());

  await deleteRequest(urlFor(upstream));
  assert.strictEqual(methodSeen, 'DELETE');
});

test('a network error is converted into a safe, credential-free Error (never leaks auth/body)', async () => {
  // Nothing is listening on this port - guarantees an ECONNREFUSED, exercising the catch path.
  await assert.rejects(
    () => getRequest('http://127.0.0.1:1', { token: 'super-secret-token' }),
    (err) => {
      assert.ok(err instanceof Error);
      assert.ok(!err.message.includes('super-secret-token'));
      assert.strictEqual(err.config, undefined);
      assert.strictEqual(err.request, undefined);
      assert.strictEqual(typeof err.status, 'number');
      return true;
    },
  );
});
