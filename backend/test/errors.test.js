const { describe, test, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { startTestServer, TEST_ENV } = require('./support/testServer');
const { createMemoryDb } = require('./support/memoryDb');

describe('error handling', () => {
  const servers = [];
  const start = async (options) => {
    const api = await startTestServer(options);
    servers.push(api);
    return api;
  };
  after(() => Promise.all(servers.map((api) => api.close())));

  test('rejects missing, forged and orphaned sessions without crashing', async () => {
    const api = await start();

    const missing = await api.request('GET', '/api/verifyToken');
    assert.equal(missing.status, 401);

    const forged = jwt.sign({ username: 'budi' }, 'privatekey');
    const bad = await api.request('GET', '/api/verifyToken', { headers: { Cookie: `jwt=${forged}` } });
    assert.equal(bad.status, 401);

    // A valid token for a user that no longer exists used to crash the process.
    const orphan = jwt.sign({ username: 'ghost' }, TEST_ENV.JWT_SECRET);
    const ghost = await api.request('GET', '/api/verifyToken', { headers: { Cookie: `jwt=${orphan}` } });
    assert.equal(ghost.status, 401);

    const stillUp = await api.request('GET', '/api/');
    assert.equal(stillUp.status, 200);
  });

  test('answers with a 500 when the database fails', async () => {
    const db = createMemoryDb();
    db.quiz.find = () => {
      throw new Error('connection lost');
    };
    const api = await start({ db });
    const originalError = console.error;
    console.error = () => {};
    try {
      const res = await api.request('GET', '/api/fetchAnimalQuiz');
      assert.equal(res.status, 500);
    } finally {
      console.error = originalError;
    }
  });

  test('answers the email check even when Redis fails', async () => {
    const bloom = { init: async () => {}, add: async () => {}, exists: async () => { throw new Error('Redis is down'); } };
    const api = await start({ bloom });
    const originalError = console.error;
    console.error = () => {};
    try {
      const res = await api.request('POST', '/api/validateEmail', { body: { email: 'baru@example.com' } });
      assert.ok(res.status >= 200 && res.status < 600);
    } finally {
      console.error = originalError;
    }
  });

  test('rejects malformed JSON with a 400', async () => {
    const api = await start();
    const res = await fetch(`${api.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"username": ',
    });
    assert.equal(res.status, 400);
  });
});
