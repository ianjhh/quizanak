const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { asyncHandler } = require('../http');

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

  router.post('/api/resendCode', asyncHandler(async (req, res) => {
    let targetUsername = req.body.username;
    if (!targetUsername) {
      const session = sessions.read(req);
      targetUsername = session && session.username;
    }
    if (!targetUsername) {
      return res.status(400).send('Username tidak ditemukan!');
    }

    const result = await credentials.findOne({ username: targetUsername }, { projection: { _id: 0, email: 1 } });
    if (!result) {
      return res.status(404).send('Pengguna tidak ditemukan!');
    }

    const verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');
    await credentials.updateOne({ username: targetUsername }, { $set: { verificationCode, codeCreatedAt: new Date().getTime() } });

    // Dispatch email in background using Resend HTTPS API or Nodemailer SMTP fallback
    mailer.sendVerificationEmail(result.email, verificationCode)
      .then(() => console.log('Verification email dispatched successfully'))
      .catch((mailErr) => console.error('Error sending verification email in background:', mailErr));

    res.status(200).send('Berhasil mengirim ulang email verifikasi!');
  }));

  router.post('/api/login', asyncHandler(async (req, res) => {
    const user = await credentials.findOne({ username: req.body.username });
    if (!user || !(await passwordMatches(req.body.password, user.password))) {
      return res.status(404).send('Username atau kata sandi salah!');
    }
    sessions.start(res, user.username);
    res.status(200).json({ verified: user.verified });
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
    const verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');

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
        codeCreatedAt: new Date().getTime(),
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

    sessions.start(res, username);
    res.status(200).send('Successful!');
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

  router.post('/api/setVerified', asyncHandler(async (req, res) => {
    const verifySuccess = await credentials.findOne({ verificationCode: req.body.verificationCode }, { projection: { _id: 0, verificationCode: 1, codeCreatedAt: 1 } });
    if (!verifySuccess) {
      return res.status(404).send('Wrong verification code!');
    }

    /* if verification code expired */
    if ((verifySuccess.codeCreatedAt + 86400000) < new Date().getTime()) {
      return res.status(498).send('Code Expired!');
    }

    await credentials.updateOne({ verificationCode: req.body.verificationCode }, { $set: { verified: true }, $unset: { createdAt: '', verificationCode: '', codeCreatedAt: '' } });
    sessions.start(res, req.body.username);
    res.status(200).send('Successful!');
  }));

  router.get('/api/logout', (req, res) => {
    sessions.end(res);
    res.status(202).send('cookie cleared');
  });

  return router;
}

module.exports = { authRoutes };
