const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { startTestServer, jwtCookie } = require('./support/testServer');
const { createMemoryDb } = require('./support/memoryDb');

describe('login sessions', () => {
  let api;

  before(async () => {
    api = await startTestServer({
      db: createMemoryDb({
        credentials: [
          { username: 'budi', email: 'budi@example.com', password: bcrypt.hashSync('rahasia123', 4), verified: true, history: [] },
          { username: 'sari', email: 'sari@example.com', password: bcrypt.hashSync('rahasia456', 4), verified: false, history: [] },
        ],
      }),
    });
  });

  after(() => api.close());

  test('logs in with the right password and sets a session cookie', async () => {
    const res = await api.request('POST', '/api/login', { body: { username: 'budi', password: 'rahasia123' } });
    assert.equal(res.status, 200);
    assert.ok(jwtCookie(res));
  });

  test("login reports whether the account's email is verified", async () => {
    const verified = await api.request('POST', '/api/login', { body: { username: 'budi', password: 'rahasia123' } });
    assert.equal(verified.data.verified, true);

    const unverified = await api.request('POST', '/api/login', { body: { username: 'sari', password: 'rahasia456' } });
    assert.equal(unverified.status, 200);
    assert.equal(unverified.data.verified, false);
  });

  test('rejects a wrong password or unknown user', async () => {
    const wrong = await api.request('POST', '/api/login', { body: { username: 'budi', password: 'salah' } });
    assert.equal(wrong.status, 404);
    assert.equal(jwtCookie(wrong), undefined);

    const unknown = await api.request('POST', '/api/login', { body: { username: 'siapa', password: 'rahasia123' } });
    assert.equal(unknown.status, 404);
  });

  test('reports the signed-in user from the session cookie', async () => {
    const login = await api.request('POST', '/api/login', { body: { username: 'budi', password: 'rahasia123' } });
    const res = await api.request('GET', '/api/verifyToken', { headers: { Cookie: `jwt=${jwtCookie(login)}` } });
    assert.equal(res.status, 200);
    assert.equal(res.data.verified, true);
    assert.equal(res.data.authorizedData.username, 'budi');
  });

  test('logout clears the session cookie', async () => {
    const res = await api.request('GET', '/api/logout');
    assert.equal(res.status, 202);
    assert.equal(jwtCookie(res), '');
  });
});
