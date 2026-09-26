const { describe, test, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/testServer');

describe('CORS', () => {
  const servers = [];
  const start = async (options) => {
    const api = await startTestServer(options);
    servers.push(api);
    return api;
  };
  after(() => Promise.all(servers.map((api) => api.close())));

  const allowOrigin = (res) => res.headers.get('access-control-allow-origin');

  test('lets the portfolio and local development call the API with credentials', async () => {
    const api = await start();
    for (const origin of ['https://ian-joseph.netlify.app', 'http://localhost:3000']) {
      const res = await api.request('GET', '/api/fetchAnimalQuiz', { headers: { Origin: origin } });
      assert.equal(res.status, 200);
      assert.equal(allowOrigin(res), origin);
      assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    }
  });

  test('gives other sites no CORS access, including look-alike subdomains', async () => {
    const api = await start();
    for (const origin of ['https://kuisanak.com', 'https://evil.netlify.app', 'https://someone.github.io']) {
      const res = await api.request('GET', '/api/fetchAnimalQuiz', { headers: { Origin: origin } });
      assert.equal(allowOrigin(res), null, origin);
    }
  });

  test('answers preflight requests only for allowed origins', async () => {
    const api = await start();
    const preflight = (origin) => fetch(`${api.baseUrl}/api/login`, {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
    });

    const allowed = await preflight('https://ian-joseph.netlify.app');
    assert.equal(allowed.status, 204);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://ian-joseph.netlify.app');

    const blocked = await preflight('https://evil.example');
    assert.equal(blocked.headers.get('access-control-allow-origin'), null);
  });

  test('reads extra origins from CORS_ORIGINS', async () => {
    const api = await start({ env: { CORS_ORIGINS: 'https://quizanak.vercel.app/, https://ian-joseph.netlify.app' } });
    const res = await api.request('GET', '/api/', { headers: { Origin: 'https://quizanak.vercel.app' } });
    assert.equal(allowOrigin(res), 'https://quizanak.vercel.app');

    const local = await api.request('GET', '/api/', { headers: { Origin: 'http://localhost:3000' } });
    assert.equal(allowOrigin(local), null, 'the list replaces the defaults');
  });
});
