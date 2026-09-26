const crypto = require('crypto');

// Rules for the email verification codes.
const CODE_LENGTH = 6;
const CODE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function generateCode() {
  return crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');
}

module.exports = { CODE_LENGTH, CODE_TTL_MS, MAX_ATTEMPTS, RESEND_COOLDOWN_MS, generateCode };
