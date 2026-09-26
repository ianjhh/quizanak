// Reads the API settings from environment variables once at startup.

// Browser origins allowed to call the API when CORS_ORIGINS is not set.
const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'https://ian-joseph.netlify.app'];

function parseOrigins(value) {
  if (!value) {
    return DEFAULT_CORS_ORIGINS;
  }
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function cleanRedisUrl(value) {
  if (!value) {
    return value;
  }
  let url = value.trim();
  // Accept a URL pasted together with the redis-cli command that prints it.
  if (url.startsWith('redis-cli -u ')) {
    url = url.replace('redis-cli -u ', '').trim();
  }
  // Strip quotes if present
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1);
  }
  return url;
}

function loadConfig(env = process.env) {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.');
  }
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.');
  }

  const rawPass = env.EMAIL_PASS || env.GMAIL_APP_PASSWORD || env.EMAIL_PASSWORD || env.GMAIL_PASS || env.MAIL_PASS;

  return {
    port: env.PORT || 5000,
    mongoUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
    corsOrigins: parseOrigins(env.CORS_ORIGINS),
    redis: {
      url: cleanRedisUrl(env.REDIS_URL),
      // Redis is optional: without REDIS_URL or REDIS_HOST the Bloom filter is off.
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT) || 7000,
      password: env.REDIS_PASSWORD,
    },
    email: {
      user: env.EMAIL_USER || 'kuisanak.id@gmail.com',
      // Sanitize App Password by stripping spaces and quotes
      pass: rawPass ? rawPass.replace(/\s+/g, '').replace(/['"]/g, '').trim() : null,
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GOOGLE_REFRESH_TOKEN,
      },
      smtp: {
        host: env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(env.EMAIL_PORT) || 587,
        secure: env.EMAIL_SECURE === 'true',
      },
      resend: {
        apiKey: env.RESEND_API_KEY ? env.RESEND_API_KEY.trim() : undefined,
        from: env.RESEND_FROM || 'KuisAnak <onboarding@resend.dev>',
      },
    },
  };
}

module.exports = { loadConfig };
