const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../http');
const { CODE_TTL_MS, MAX_ATTEMPTS, RESEND_COOLDOWN_MS, generateCode } = require('../verification');

const PASSWORD_SALT_ROUNDS = 11;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Frontend builds from before server-side hashing send a bcrypt hash instead
// of the password. Accept those until every deployed frontend is rebuilt.
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

// Returns why the sign-up data is invalid, or null when it is fine.
function signUpProblem({ username, password, email }) {
  const name = typeof username === 'string' ? username.trim() : '';
  if (name.length < 3 || name.length > 30) {
    return 'Username harus 3 sampai 30 karakter.';
  }
  const passwordBytes = typeof password === 'string' ? Buffer.byteLength(password) : 0;
  if (!BCRYPT_HASH.test(password) && (passwordBytes < 8 || passwordBytes > 72)) {
    return 'Kata sandi harus 8 sampai 72 karakter.';
  }
  if (!EMAIL_PATTERN.test(normalizeEmail(email))) {
    return 'Format email salah!';
  }
  return null;
}

// Treats a missing or malformed stored hash as a wrong password.
async function passwordMatches(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    return false;
  }
}

// Sign-up, email verification and login sessions.
function authRoutes({ db, bloom, mailer, sessions }) {
  const router = express.Router();
  const { credentials } = db;

  router.post('/api/validateEmail', asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);

    /* check whether email exists in bloom filter */
    const emailExists = await bloom.exists(email);

    if (emailExists) {
      /* cross check with database since it could be false positive */
      const found = await credentials.findOne({ email }, { projection: { _id: 0, email: 1 } });
      if (found) {
        return res.status(409).send('Email exists already!');
      }
    }
    res.status(200).send('Email does not exist! You can use that email!');
  }));

  // Sends a fresh code to the signed-in user's own address. The username used
  // to come from the request body, which let anyone email any user.
  router.post('/api/resendCode', asyncHandler(async (req, res) => {
    const session = sessions.read(req);
    if (!session) {
      return res.status(401).send('Silakan login terlebih dahulu.');
    }

    const user = await credentials.findOne({ username: session.username }, { projection: { _id: 0, email: 1, verified: 1, codeCreatedAt: 1 } });
    if (!user) {
      return res.status(401).send('Silakan login terlebih dahulu.');
    }
    if (user.verified === true) {
      return res.status(409).send('Akun sudah diverifikasi.');
    }

    const waitMs = (user.codeCreatedAt || 0) + RESEND_COOLDOWN_MS - Date.now();
    if (waitMs > 0) {
      const seconds = Math.ceil(waitMs / 1000);
      res.set('Retry-After', String(seconds));
      return res.status(429).send(`Tunggu ${seconds} detik sebelum meminta kode baru.`);
    }

    const verificationCode = generateCode();
    await credentials.updateOne({ username: session.username }, { $set: { verificationCode, codeCreatedAt: Date.now(), verifyAttempts: 0 } });

    // Dispatch email in background using Resend HTTPS API or Nodemailer SMTP fallback
    mailer.sendVerificationEmail(user.email, verificationCode)
      .then(() => console.log('Verification email dispatched successfully'))
      .catch((mailErr) => console.error('Error sending verification email in background:', mailErr));

    res.status(200).send('Berhasil mengirim ulang email verifikasi!');
  }));

  router.post('/api/login', asyncHandler(async (req, res) => {
    const user = await credentials.findOne({ username: req.body.username });
    if (!user || !(await passwordMatches(req.body.password, user.password))) {
      return res.status(404).send('Username atau kata sandi salah!');
    }
    const token = sessions.start(res, user.username);
    res.status(200).json({ verified: user.verified, token });
  }));

  router.post('/api/register', asyncHandler(async (req, res) => {
    const problem = signUpProblem(req.body);
    if (problem) {
      return res.status(400).send(problem);
    }

    const username = req.body.username.trim();
    const email = normalizeEmail(req.body.email);
    if (await credentials.findOne({ username }, { projection: { _id: 1 } })) {
      return res.status(409).send('Username sudah dipakai!');
    }
    if (await credentials.findOne({ email }, { projection: { _id: 1 } })) {
      return res.status(409).send('Email sudah terdaftar!');
    }

    const password = BCRYPT_HASH.test(req.body.password)
      ? req.body.password
      : await bcrypt.hash(req.body.password, PASSWORD_SALT_ROUNDS);
    const verificationCode = generateCode();

    try {
      // Only server-chosen fields are stored: a client cannot mark itself verified.
      // createdAt is removed once the email is verified.
      await credentials.insertOne({
        username,
        email,
        password,
        verified: false,
        createdAt: new Date(),
        history: [],
        verificationCode,
        codeCreatedAt: Date.now(),
        verifyAttempts: 0,
      });
    } catch (err) {
      // The unique indexes catch sign-ups racing each other for the same name or email.
      if (err.code === 11000) {
        return res.status(409).send(err.keyPattern && err.keyPattern.email ? 'Email sudah terdaftar!' : 'Username sudah dipakai!');
      }
      throw err;
    }

    try {
      await bloom.add(email);
    } catch (bloomErr) {
      console.log('Bloom filter add status:', bloomErr.message || bloomErr);
    }

    // Dispatch email in background using Resend HTTPS API or Nodemailer SMTP fallback
    mailer.sendVerificationEmail(email, verificationCode)
      .then(() => console.log('Registration email dispatched successfully'))
      .catch((mailErr) => console.error('Error sending registration email in background:', mailErr));

    const token = sessions.start(res, username);
    res.status(200).json({ message: 'Successful!', token });
  }));

  router.get('/api/verifyToken', asyncHandler(async (req, res) => {
    const authorizedData = sessions.read(req);
    if (!authorizedData) {
      return res.status(401).send('Sesi tidak valid, silakan login kembali.');
    }

    /* retrieve verified status of user */
    const found = await credentials.findOne({ username: authorizedData.username }, { projection: { _id: 0, verified: 1 } });
    if (!found) {
      return res.status(401).send('Sesi tidak valid, silakan login kembali.');
    }

    res.status(200).json({
      message: 'Successful log in',
      verified: found.verified,
      authorizedData,
    });
  }));

  // Checks the code against the signed-in user's own code. It used to match a
  // code against every account, and then replaced the session with a token
  // that had no username.
  router.post('/api/setVerified', asyncHandler(async (req, res) => {
    const session = sessions.read(req);
    if (!session) {
      return res.status(401).send('Silakan login terlebih dahulu.');
    }

    const { username } = session;
    const user = await credentials.findOne({ username }, { projection: { _id: 0, verified: 1, verificationCode: 1, codeCreatedAt: 1, verifyAttempts: 1 } });
    if (!user) {
      return res.status(401).send('Silakan login terlebih dahulu.');
    }
    if (user.verified === true) {
      return res.status(200).json({ verified: true });
    }
    if (!user.verificationCode || (user.verifyAttempts || 0) >= MAX_ATTEMPTS) {
      return res.status(429).send('Terlalu banyak percobaan. Minta kode baru lalu coba lagi.');
    }
    if (Date.now() > user.codeCreatedAt + CODE_TTL_MS) {
      return res.status(410).send('Kode verifikasi sudah kedaluwarsa. Minta kode baru.');
    }

    const code = String(req.body.verificationCode || '').trim();
    if (code !== user.verificationCode) {
      await credentials.updateOne({ username }, { $inc: { verifyAttempts: 1 } });
      return res.status(400).send('Kode verifikasi salah!');
    }

    await credentials.updateOne({ username }, {
      $set: { verified: true },
      $unset: { createdAt: '', verificationCode: '', codeCreatedAt: '', verifyAttempts: '' },
    });
    res.status(200).json({ verified: true });
  }));

  router.get('/api/logout', (req, res) => {
    sessions.end(res);
    res.status(202).send('cookie cleared');
  });

  return router;
}

module.exports = { authRoutes };
