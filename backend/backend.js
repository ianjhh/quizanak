// Entry point: reads the configuration, creates the database, Redis and email
// clients, and starts the API server. The routes live in src/.
try {
  require('dotenv').config();
} catch (e) {
  // Dotenv is optional in production where variables are set directly in host dashboard
}

const { loadConfig } = require('./src/config');
const { connectDatabase, ensureIndexes } = require('./src/db');
const { createEmailBloom } = require('./src/emailBloom');
const { createMailer } = require('./src/mailer');
const { createApp } = require('./src/app');

const config = loadConfig();
const db = connectDatabase(config.mongoUri);
const bloom = createEmailBloom(config.redis, db.credentials);
const mailer = createMailer(config.email);

ensureIndexes(db);
bloom.init();
mailer.checkConfiguration();

const app = createApp({ config, db, bloom, mailer });
app.listen(config.port, () => {
  console.log(`App listening on port ${config.port}`);
});
