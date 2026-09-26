const jwt = require('jsonwebtoken');

// The login session is a JWT stored in an httpOnly cookie.
const COOKIE_NAME = 'jwt';
const cookieOptions = { httpOnly: true, sameSite: 'none', secure: true };

function createSessions(secret) {
  return {
    // Signs a token for the user and sets it as the session cookie.
    start(res, username) {
      res.cookie(COOKIE_NAME, jwt.sign({ username }, secret, { expiresIn: '1h' }), cookieOptions);
    },

    // Returns the token payload, or null when the token is missing, expired,
    // forged or does not name a user.
    read(req) {
      const token = req.cookies && req.cookies[COOKIE_NAME];
      if (!token) {
        return null;
      }
      try {
        const payload = jwt.verify(token, secret);
        return payload.username ? payload : null;
      } catch (e) {
        return null;
      }
    },

    end(res) {
      res.clearCookie(COOKIE_NAME, cookieOptions);
    },
  };
}

module.exports = { createSessions };
