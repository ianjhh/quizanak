const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, jwtCookie } = require('./support/testServer');

const MINUTE = 60 * 1000;

describe('email verification', () => {
  let api;

  // Registers a user and returns the Authorization header for their session.
  async function signUp(username, email) {
    const res = await api.request('POST', '/api/register', { body: { username, email, password: 'rahasia123' } });
    assert.equal(res.status, 200);
    return { Authorization: `Bearer ${res.data.token}` };
  }

  const storedUser = (username) => api.db.credentials.findOne({ username });
  const ageCode = (username, ms) => api.db.credentials.updateOne({ username }, { $set: { codeCreatedAt: Date.now() - ms } });

  beforeEach(async () => {
    api = await startTestServer();
  });

  afterEach(() => api.close());

  test('sends a 6-digit code at sign-up and verifies the signed-in user with it', async () => {
    const auth = await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    assert.match(verificationCode, /^\d{6}$/);

    const res = await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode } });
    assert.equal(res.status, 200);
    assert.equal(jwtCookie(res), undefined, 'must not replace the session');

    const user = await storedUser('dewi');
    assert.equal(user.verified, true);
    assert.equal(user.verificationCode, undefined);

    const session = await api.request('GET', '/api/verifyToken', { headers: auth });
    assert.equal(session.data.verified, true);
  });

  test('requires a signed-in user', async () => {
    await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    const res = await api.request('POST', '/api/setVerified', { body: { verificationCode } });
    assert.equal(res.status, 401);
    assert.equal((await storedUser('dewi')).verified, false);
  });

  test("a code only verifies its own account", async () => {
    const dewi = await signUp('dewi', 'dewi@example.com');
    await signUp('rudi', 'rudi@example.com');
    const rudisCode = (await storedUser('rudi')).verificationCode;

    const res = await api.request('POST', '/api/setVerified', { headers: dewi, body: { verificationCode: rudisCode } });
    // Codes can collide by chance; only a mismatch is meaningful here.
    if ((await storedUser('dewi')).verificationCode !== rudisCode) {
      assert.equal(res.status, 400);
    }
    assert.equal((await storedUser('rudi')).verified, false);
  });

  test('rejects wrong codes and locks the code after 5 attempts', async () => {
    const auth = await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    const wrongCode = verificationCode === '000000' ? '111111' : '000000';

    for (let i = 0; i < 5; i++) {
      const res = await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode: wrongCode } });
      assert.equal(res.status, 400);
    }
    const locked = await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode } });
    assert.equal(locked.status, 429);
    assert.equal((await storedUser('dewi')).verified, false);
  });

  test('rejects a code older than 24 hours', async () => {
    const auth = await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    await ageCode('dewi', 25 * 60 * MINUTE);

    const res = await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode } });
    assert.equal(res.status, 410);
  });

  test('accepts a fresh code from the last 24 hours', async () => {
    const auth = await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    await ageCode('dewi', 23 * 60 * MINUTE);

    const res = await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode } });
    assert.equal(res.status, 200);
  });

  test('resends a new code to the signed-in user only, after a cooldown', async () => {
    const auth = await signUp('dewi', 'dewi@example.com');
    await signUp('rudi', 'rudi@example.com');
    await new Promise((resolve) => setTimeout(resolve, 20));
    api.mailer.sent.length = 0;

    const tooSoon = await api.request('POST', '/api/resendCode', { headers: auth });
    assert.equal(tooSoon.status, 429);
    assert.ok(Number(tooSoon.headers.get('retry-after')) > 0);

    await ageCode('dewi', 2 * MINUTE);
    const oldCode = (await storedUser('dewi')).verificationCode;
    // The username in the body is ignored: it used to let anyone email any user.
    const res = await api.request('POST', '/api/resendCode', { headers: auth, body: { username: 'rudi' } });
    assert.equal(res.status, 200);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const user = await storedUser('dewi');
    assert.deepEqual(api.mailer.sent, [{ to: 'dewi@example.com', code: user.verificationCode }]);
    assert.match(user.verificationCode, /^\d{6}$/);
    assert.equal(user.verifyAttempts, 0);
    assert.ok(user.verificationCode !== oldCode || user.codeCreatedAt > Date.now() - MINUTE);
  });

  test('resend requires a session and an unverified account', async () => {
    const anonymous = await api.request('POST', '/api/resendCode', { body: { username: 'dewi' } });
    assert.equal(anonymous.status, 401);

    const auth = await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode } });
    await ageCode('dewi', 2 * MINUTE);
    const res = await api.request('POST', '/api/resendCode', { headers: auth });
    assert.equal(res.status, 409);
  });

  test('verifying an already verified account is harmless', async () => {
    const auth = await signUp('dewi', 'dewi@example.com');
    const { verificationCode } = await storedUser('dewi');
    await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode } });
    const again = await api.request('POST', '/api/setVerified', { headers: auth, body: { verificationCode: '123456' } });
    assert.equal(again.status, 200);
    assert.deepEqual(again.data, { verified: true });
  });
});
