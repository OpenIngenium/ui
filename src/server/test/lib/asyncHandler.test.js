const test = require('node:test');
const assert = require('node:assert/strict');
const { asyncHandler } = require('../../src/lib/asyncHandler');

test('asyncHandler forwards a rejected promise to next(err)', () => {
  const err = new Error('boom');
  const handler = asyncHandler(async () => {
    throw err;
  });

  return new Promise((resolve) => {
    handler({}, {}, (nextErr) => {
      assert.strictEqual(nextErr, err);
      resolve();
    });
  });
});

test('asyncHandler does not call next() on success', async () => {
  let nextCalled = false;
  const handler = asyncHandler(async (req, res) => {
    res.done = true;
  });

  const res = {};
  await new Promise((resolve) => {
    handler({}, res, () => {
      nextCalled = true;
    });
    // asyncHandler resolves synchronously-ish via Promise.resolve(); give it a tick.
    setImmediate(resolve);
  });

  assert.strictEqual(res.done, true);
  assert.strictEqual(nextCalled, false);
});
