const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { startTestServer, jwtCookie } = require('./support/testServer');
const { createMemoryDb } = require('./support/memoryDb');
const { ensureIndexes } = require('../src/db');

const newUser = { username: 'dewi', password: 'rahasia123', email: 'Dewi@Example.com' };

describe('sign-up', () => {
  let api;

  beforeEach(async () => {
    api = await startTestServer({
      db: createMemoryDb({
        credentials: [{ username: 'budi', email: 'budi@example.com', password: bcrypt.hashSync('rahasia123', 4), verified: true }],
      }),
    });
  });

  afterEach(() => api.close());

  test('creates an unverified account with a hashed password and emails a code', async () => {
    const res = await api.request('POST', '/api/register', { body: newUser });
    assert.equal(res.status, 200);
    assert.ok(jwtCookie(res), 'starts a session so the user can verify');

    const stored = await api.db.credentials.findOne({ username: 'dewi' });
    assert.equal(stored.email, 'dewi@example.com');
    assert.equal(stored.verified, false);
    assert.notEqual(stored.password, newUser.password);
    assert.ok(await bcrypt.compare(newUser.password, stored.password));

    // The mail is sent in the background, so give it a moment.
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.deepEqual(api.mailer.sent.map((m) => m.to), ['dewi@example.com']);
    assert.equal(api.mailer.sent[0].code, stored.verificationCode);
  });

  test('ignores fields the client should not control', async () => {
    await api.request('POST', '/api/register', {
      body: { ...newUser, verified: true, createdAt: '1999-01-01', history: [['hack', 10]] },
    });
    const stored = await api.db.credentials.findOne({ username: 'dewi' });
    assert.equal(stored.verified, false);
    assert.deepEqual(stored.history, []);
    assert.ok(stored.createdAt instanceof Date && stored.createdAt.getFullYear() > 2000);
  });

  test('rejects invalid input', async () => {
    for (const body of [
      { ...newUser, username: 'ab' },
      { ...newUser, password: 'pendek' },
      { ...newUser, email: 'bukan-email' },
      { email: newUser.email },
    ]) {
      const res = await api.request('POST', '/api/register', { body });
      assert.equal(res.status, 400, JSON.stringify(body));
    }
    assert.equal(await api.db.credentials.countDocuments({}), 1);
  });

  test('refuses a username or email that is already taken', async () => {
    const sameName = await api.request('POST', '/api/register', { body: { ...newUser, username: 'budi' } });
    assert.equal(sameName.status, 409);
    assert.equal(jwtCookie(sameName), undefined, 'must not hand out a session for the existing account');

    const sameEmail = await api.request('POST', '/api/register', { body: { ...newUser, email: 'BUDI@example.com' } });
    assert.equal(sameEmail.status, 409);
  });

  test('turns a duplicate-key error from a racing sign-up into a 409', async () => {
    await ensureIndexes(api.db);
    // Simulate a second request that passed the existence check just before
    // the first one inserted the user.
    const findOne = api.db.credentials.findOne.bind(api.db.credentials);
    api.db.credentials.findOne = async (filter, options) => (filter.email ? null : findOne(filter, options));

    const res = await api.request('POST', '/api/register', { body: { ...newUser, username: 'dewi2', email: 'budi@example.com' } });
    assert.equal(res.status, 409);
    assert.equal(res.data, 'Email sudah terdaftar!');
  });

  test('accepts the pre-hashed password that older frontend builds send', async () => {
    const hash = bcrypt.hashSync(newUser.password, 4);
    const res = await api.request('POST', '/api/register', { body: { ...newUser, password: hash } });
    assert.equal(res.status, 200);

    const login = await api.request('POST', '/api/login', { body: { username: 'dewi', password: newUser.password } });
    assert.equal(login.status, 200);
  });

  test('the email check matches addresses case-insensitively', async () => {
    api.bloom.emails.add('budi@example.com');
    const taken = await api.request('POST', '/api/validateEmail', { body: { email: ' Budi@Example.com ' } });
    assert.equal(taken.status, 409);

    const free = await api.request('POST', '/api/validateEmail', { body: { email: 'baru@example.com' } });
    assert.equal(free.status, 200);
  });
});
