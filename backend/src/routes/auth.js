const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { asyncHandler } = require('../http');

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
    /* check whether email exists in bloom filter */
    const emailExists = await bloom.exists(req.body.email);

    if (emailExists) {
      /* cross check with database since it could be false positive */
      const found = await credentials.findOne({ email: req.body.email }, { projection: { _id: 0, email: 1 } });
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
    const data = req.body;
    const verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');

    // Dispatch email in background using Resend HTTPS API or Nodemailer SMTP fallback
    mailer.sendVerificationEmail(data.email, verificationCode)
      .then(() => console.log('Registration email dispatched successfully'))
      .catch((mailErr) => console.error('Error sending registration email in background:', mailErr));

    await credentials.insertOne({ username: data.username, password: data.password, email: data.email, verified: data.verified, createdAt: data.createdAt, verificationCode, codeCreatedAt: new Date().getTime() });
    try {
      await bloom.add(data.email);
    } catch (bloomErr) {
      console.log('Bloom filter add status:', bloomErr.message || bloomErr);
    }

    sessions.start(res, data.username);
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
