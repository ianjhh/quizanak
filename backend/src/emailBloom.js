const redis = require('redis');

const FILTER_KEY = 'emailBloom';

// A RedisBloom filter holding every registered email, so sign-up can check
// whether an address is free without always querying MongoDB.
function createEmailBloom(redisConfig, credentials) {
  const { url, host, port, password } = redisConfig;

  const client = url
    ? redis.createClient({ url }).on('error', (err) => console.log('Redis Error:', err))
    : redis.createCluster({
        rootNodes: [
          { url: `redis://${host}:${port}` },
          { url: `redis://${host}:${port + 1}` },
          { url: `redis://${host}:${port + 2}` },
        ],
        useReplicas: true,
        defaults: { password },
      }).on('error', (err) => console.log('Redis Cluster Error:', err));

  const init = async () => {
    try {
      const emailArr = await credentials.distinct('email');
      await client.connect();

      // Delete any pre-existing Bloom Filter
      await client.del(FILTER_KEY);

      // Reserve/Create a Bloom Filter with configurable error rate and capacity
      await client.bf.reserve(FILTER_KEY, 0.01, 1000);
      console.log('Reserved Bloom Filter.');

      // Add multiple items to Bloom Filter at once with BF.MADD command
      await client.bf.mAdd(FILTER_KEY, emailArr);
    } catch (e) {
      console.log('Bloom filter initialization status:', e.message || e);
    }
  };

  return {
    init,
    exists: (email) => client.bf.exists(FILTER_KEY, email),
    add: (email) => client.bf.add(FILTER_KEY, email),
  };
}

module.exports = { createEmailBloom };
