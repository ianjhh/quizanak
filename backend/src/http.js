// Shared helpers for Express handlers.

// Express 4 ignores promises returned by handlers, so an error thrown in an
// async handler either leaves the request hanging or, as an unhandled
// rejection, stops the whole process. This forwards it to errorHandler.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// Registered after every route in app.js.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).send('Permintaan tidak valid.');
  }
  console.error(err);
  res.status(500).send('Terjadi kesalahan pada server. Silakan coba lagi.');
}

module.exports = { asyncHandler, errorHandler };
