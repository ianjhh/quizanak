const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { createEmailBloom } = require('../src/emailBloom');
const { MemoryCollection } = require('./support/memoryDb');

const quietly = async (fn) => {
  const { log, error } = console;
  console.log = () => {};
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
    console.error = error;
  }
};

describe('email Bloom filter', () => {
  test('is switched off when Redis is not configured', async () => {
    const bloom = createEmailBloom({}, new MemoryCollection());
    await quietly(() => bloom.init());
    assert.equal(await bloom.mightContain('a@example.com'), true, 'defers to MongoDB');
    await bloom.add('a@example.com');
  });

  test('never blocks a check while Redis is unreachable', async () => {
    // Port 9 (discard) is closed on a normal machine, so the connection fails.
    const bloom = createEmailBloom({ url: 'redis://127.0.0.1:9' }, new MemoryCollection());
    await quietly(async () => {
      bloom.init();
      const started = Date.now();
      assert.equal(await bloom.mightContain('a@example.com'), true);
      await bloom.add('a@example.com');
      assert.ok(Date.now() - started < 500, 'answers immediately');
      await bloom.close();
    });
  });
});
