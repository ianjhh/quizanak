const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRoutes } = require('./routes/auth');
const { quizRoutes } = require('./routes/quizzes');
const { factRoutes } = require('./routes/facts');
const { errorHandler } = require('./http');
const { createSessions } = require('./session');

// Only the listed frontends may call the API from a browser with the user's
// session. Requests without an Origin header (curl, health checks) are fine.
function corsOptions(allowedOrigins) {
  return {
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  };
}

// Builds the Express app from already-created services, so the server entry
// point and the tests can each supply their own.
function createApp({ config, db, bloom, mailer }) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors(corsOptions(config.corsOrigins)));

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
