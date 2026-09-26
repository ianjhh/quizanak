const redis = require('redis');

const FILTER_KEY = 'emailBloom';
const COMMAND_TIMEOUT_MS = 2000;

function withTimeout(promise, ms = COMMAND_TIMEOUT_MS) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error(`Redis did not answer within ${ms} ms`)), ms);
    }),
  ]);
}

// An optional speed-up for sign-up: a RedisBloom filter of registered emails
// can say "definitely free" without querying MongoDB. MongoDB stays the source
// of truth, so when Redis is not configured, unreachable or missing the
// RedisBloom module, every check simply goes to MongoDB instead of hanging.
function createEmailBloom(redisConfig, credentials) {
  const { url, host, port, password } = redisConfig;
  if (!url && !host) {
    return {
      init: async () => console.log('Redis is not configured; email checks use MongoDB only.'),
      mightContain: async () => true,
      add: async () => {},
      close: async () => {},
    };
  }

  const socket = {
    connectTimeout: 5000,
    // Keep retrying in the background, backing off to one attempt every 30 seconds.
    reconnectStrategy: (retries) => Math.min(1000 * 2 ** retries, 30000),
  };
  // Without the offline queue, commands fail at once while Redis is down
  // instead of waiting for a reconnection that may never come.
  const client = url
    ? redis.createClient({ url, socket, disableOfflineQueue: true })
    : redis.createCluster({
        rootNodes: [0, 1, 2].map((offset) => ({ url: `redis://${host}:${port + offset}` })),
        useReplicas: true,
        defaults: { password, socket, disableOfflineQueue: true },
      });

  let filterReady = false;
  let reportedError = false;

  const build = async () => {
    try {
      const emails = await credentials.distinct('email');
      await withTimeout(client.del(FILTER_KEY));
      await withTimeout(client.bf.reserve(FILTER_KEY, 0.01, Math.max(1000, emails.length * 2)));
      if (emails.length > 0) {
        await withTimeout(client.bf.mAdd(FILTER_KEY, emails));
      }
      filterReady = true;
      reportedError = false;
      console.log(`Email Bloom filter ready with ${emails.length} address(es).`);
    } catch (err) {
      filterReady = false;
      console.error('Could not build the email Bloom filter; email checks use MongoDB only:', err.message);
    }
  };

  client.on('error', (err) => {
    filterReady = false;
    if (!reportedError) {
      reportedError = true;
      console.error('Redis error; email checks use MongoDB only until it recovers:', err.message);
    }
  });
  if (url) {
    // Rebuild after every (re)connection in case Redis lost the filter.
    client.on('ready', build);
  }

  return {
    async init() {
      try {
        await client.connect();
        if (!url) {
          await build();
        }
      } catch (err) {
        console.error('Could not connect to Redis; email checks use MongoDB only:', err.message);
      }
    },

    // true means "maybe registered, ask MongoDB"; false means "definitely free".
    async mightContain(email) {
      if (!filterReady) {
        return true;
      }
      try {
        return Boolean(await withTimeout(client.bf.exists(FILTER_KEY, email)));
      } catch (err) {
        console.error('Bloom filter check failed; using MongoDB:', err.message);
        return true;
      }
    },

    async add(email) {
      if (!filterReady) {
        return;
      }
      try {
        await withTimeout(client.bf.add(FILTER_KEY, email));
      } catch (err) {
        console.error('Could not add an email to the Bloom filter:', err.message);
      }
    },

    async close() {
      filterReady = false;
      try {
        await client.disconnect();
      } catch (err) {
        // already closed
      }
    },
  };
}

module.exports = { createEmailBloom };
