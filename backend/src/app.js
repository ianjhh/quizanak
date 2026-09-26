const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authRoutes } = require('./routes/auth');
const { quizRoutes } = require('./routes/quizzes');
const { factRoutes } = require('./routes/facts');
const { errorHandler } = require('./http');
const { createSessions } = require('./session');

const allowedOrigins = [
  'http://localhost:3000',
  'https://kuisanak.com',
  'https://ianjhh-portfolio.netlify.app',
  'https://ianjhh.github.io',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.netlify.app') || origin.endsWith('.github.io')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Builds the Express app from already-created services, so the server entry
// point and the tests can each supply their own.
function createApp({ config, db, bloom, mailer }) {
  const app = express();
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(cors(corsOptions));

  app.get('/api/', async (req, res) => {
    res.send('Quizanak API Server is running');
  });

  const sessions = createSessions(config.jwtSecret);
  app.use(quizRoutes({ db, sessions }));
  app.use(authRoutes({ db, bloom, mailer, sessions }));
  app.use(factRoutes({ db }));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
