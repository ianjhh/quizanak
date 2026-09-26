// Starts the real Express app on a random port with in-memory services, and
// returns a small client for making requests against it.
const { createApp } = require('../../src/app');
const { loadConfig } = require('../../src/config');
const { createMemoryDb } = require('./memoryDb');

const TEST_ENV = {
  MONGODB_URI: 'mongodb://unused-in-tests',
  JWT_SECRET: 'test-jwt-secret',
};

function createFakeBloom() {
  const emails = new Set();
  return {
    emails,
    init: async () => {},
    mightContain: async (email) => emails.has(email),
    add: async (email) => {
      emails.add(email);
    },
    close: async () => {},
  };
}

function createFakeMailer() {
  const sent = [];
  return {
    sent,
    verifyConnection: () => {},
    sendVerificationEmail: async (to, code) => {
      sent.push({ to, code });
    },
  };
}

async function startTestServer({ db, bloom, mailer, env } = {}) {
  const services = {
    config: loadConfig({ ...TEST_ENV, ...env }),
    db: db || createMemoryDb(),
    bloom: bloom || createFakeBloom(),
    mailer: mailer || createFakeMailer(),
  };
  const app = createApp(services);
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  // Sends a request and parses the body as JSON when possible. A short timeout
  // turns a handler that never responds into a test failure instead of a hang.
  async function request(method, path, { body, headers = {} } = {}) {
    const response = await fetch(baseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    const text = await response.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // plain-text response
    }
    return { status: response.status, data, headers: response.headers };
  }

  return {
    ...services,
    baseUrl,
    request,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// Reads the value of the `jwt` cookie from a response, if one was set.
function jwtCookie(response) {
  const header = response.headers.get('set-cookie') || '';
  const match = header.match(/(?:^|,\s*)jwt=([^;]*)/);
  return match ? match[1] : undefined;
}

module.exports = { startTestServer, createFakeBloom, createFakeMailer, jwtCookie, TEST_ENV };
