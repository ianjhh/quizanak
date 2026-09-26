const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createMailer } = require('../src/mailer');
const { loadConfig } = require('../src/config');
const { TEST_ENV } = require('./support/testServer');

const emailConfig = (env) => loadConfig({ ...TEST_ENV, ...env }).email;

const GMAIL_ENV = {
  EMAIL_USER: 'kuisanak.test@gmail.com',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REFRESH_TOKEN: 'refresh-token',
};

// A fetch stand-in that records calls and answers from a routing function.
function fakeFetch(route) {
  const calls = [];
  const fn = async (url, options = {}) => {
    calls.push({ url, options });
    const [status, body] = await route(url, options);
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  fn.calls = calls;
  return fn;
}

const googleOk = (url) => {
  if (url.includes('oauth2.googleapis.com')) return [200, { access_token: 'access-1', expires_in: 3600 }];
  if (url.includes('gmail.googleapis.com')) return [200, { id: 'msg-1' }];
  throw new Error(`unexpected URL ${url}`);
};

describe('mailer', () => {
  let logs;
  const { log, error } = console;

  beforeEach(() => {
    logs = [];
    console.log = (...args) => logs.push(args.join(' '));
    console.error = (...args) => logs.push(args.join(' '));
  });

  afterEach(() => {
    console.log = log;
    console.error = error;
  });

  test('sends through the Gmail API over HTTPS with the refresh token', async () => {
    const fetch = fakeFetch(googleOk);
    const mailer = createMailer(emailConfig(GMAIL_ENV), { fetch });
    assert.deepEqual(mailer.transports, ['Gmail API']);

    assert.equal(await mailer.sendVerificationCode('dewi@example.com', '482913'), true);

    const [tokenCall, sendCall] = fetch.calls;
    const form = new URLSearchParams(tokenCall.options.body);
    assert.equal(form.get('grant_type'), 'refresh_token');
    assert.equal(form.get('refresh_token'), 'refresh-token');

    assert.equal(sendCall.options.headers.Authorization, 'Bearer access-1');
    const raw = Buffer.from(JSON.parse(sendCall.options.body).raw, 'base64url').toString();
    assert.match(raw, /^To: dewi@example\.com\r$/m);
    assert.match(raw, /^From: KuisAnak <kuisanak\.test@gmail\.com>\r$/m);
    assert.match(raw, /Subject: Kode verifikasi KuisAnak: 482913/);
    assert.ok(logs.some((line) => line.includes('d***@example.com via Gmail API')));
    assert.ok(!logs.some((line) => line.includes('dewi@example.com')), 'does not log the full address');
  });

  test('reuses the Google access token until it expires', async () => {
    const fetch = fakeFetch(googleOk);
    const mailer = createMailer(emailConfig(GMAIL_ENV), { fetch });
    await mailer.sendVerificationCode('a@example.com', '111111');
    await mailer.sendVerificationCode('b@example.com', '222222');
    assert.equal(fetch.calls.filter((c) => c.url.includes('oauth2')).length, 1);
  });

  test('explains an expired refresh token and falls back to Resend', async () => {
    const fetch = fakeFetch((url) => {
      if (url.includes('oauth2.googleapis.com')) return [400, { error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }];
      if (url === 'https://api.resend.com/emails') return [200, { id: 're_1' }];
      throw new Error(`unexpected URL ${url}`);
    });
    const mailer = createMailer(emailConfig({ ...GMAIL_ENV, RESEND_API_KEY: 're_key', RESEND_FROM: 'KuisAnak <kode@kuis.example>' }), { fetch });
    assert.deepEqual(mailer.transports, ['Gmail API', 'Resend']);

    assert.equal(await mailer.sendVerificationCode('dewi@example.com', '482913'), true);
    assert.ok(logs.some((line) => line.includes('invalid_grant') && line.includes('"Testing" mode')));

    const resendCall = fetch.calls.find((c) => c.url === 'https://api.resend.com/emails');
    const body = JSON.parse(resendCall.options.body);
    assert.deepEqual(body.to, ['dewi@example.com']);
    assert.equal(body.from, 'KuisAnak <kode@kuis.example>');
    assert.match(body.text, /482913/);
  });

  test("names Resend's test-mode restriction when it refuses a recipient", async () => {
    const fetch = fakeFetch(() => [403, {
      statusCode: 403,
      name: 'validation_error',
      message: 'You can only send testing emails to your own email address (owner@example.com). To send emails to other recipients, please verify a domain at resend.com/domains',
    }]);
    const mailer = createMailer(emailConfig({ RESEND_API_KEY: 're_key' }), { fetch });

    assert.equal(await mailer.sendVerificationCode('dewi@example.com', '482913'), false);
    assert.ok(logs.some((line) => line.includes('verify a domain and set RESEND_FROM')));
  });

  test('gives up on a transport that hangs and reports failure', async () => {
    const fetch = fakeFetch(() => new Promise(() => {}));
    const mailer = createMailer(emailConfig({ RESEND_API_KEY: 're_key' }), { fetch, timeoutMs: 50 });
    const started = Date.now();
    assert.equal(await mailer.sendVerificationCode('dewi@example.com', '482913'), false);
    assert.ok(Date.now() - started < 1000);
    assert.ok(logs.some((line) => line.includes('did not answer')));
  });

  test('prints the code to the log when no transport is configured', async () => {
    const mailer = createMailer(emailConfig({}), { fetch: fakeFetch(() => [500, {}]) });
    assert.deepEqual(mailer.transports, []);
    assert.equal(await mailer.sendVerificationCode('dewi@example.com', '482913'), false);
    assert.ok(logs.some((line) => line.includes('482913') && line.includes('d***@example.com')));
  });

  test('reports at startup which transports work', async () => {
    const fetch = fakeFetch((url) => {
      if (url.includes('oauth2.googleapis.com')) return [200, { access_token: 'access-1', expires_in: 3600 }];
      if (url === 'https://api.resend.com/domains') return [200, { data: [] }];
      throw new Error(`unexpected URL ${url}`);
    });
    const mailer = createMailer(emailConfig({ ...GMAIL_ENV, RESEND_API_KEY: 're_key' }), { fetch });
    await mailer.checkConfiguration();
    assert.ok(logs.includes('Email transport ready: Gmail API'));
    assert.ok(logs.some((line) => line.startsWith('Email transport Resend is not working') && line.includes('no verified domain')));
  });
});
