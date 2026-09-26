const jwt = require('jsonwebtoken');

// The login session is a JWT. The API sets it as an httpOnly cookie and also
// returns it in the response body, because browsers that block third-party
// cookies (Safari, every browser on iOS) never send the cookie to the API's
// separate domain. Those clients send it as `Authorization: Bearer <token>`.
const COOKIE_NAME = 'jwt';
const cookieOptions = { httpOnly: true, sameSite: 'none', secure: true };

function bearerToken(req) {
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

function createSessions(secret) {
  const verify = (token) => {
    try {
      const payload = jwt.verify(token, secret);
      return payload.username ? payload : null;
    } catch (e) {
      return null;
    }
  };

  return {
    // Signs a token for the user, sets it as the session cookie and returns it.
    start(res, username) {
      const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
      res.cookie(COOKIE_NAME, token, cookieOptions);
      return token;
    },

    // Returns the payload of the first valid token (header, then cookie), or
    // null when there is none or it does not name a user.
    read(req) {
      const candidates = [bearerToken(req), req.cookies && req.cookies[COOKIE_NAME]];
      for (const token of candidates) {
        const payload = token && verify(token);
        if (payload) {
          return payload;
        }
      }
      return null;
    },

    end(res) {
      res.clearCookie(COOKIE_NAME, cookieOptions);
    },
  };
}

module.exports = { createSessions };
