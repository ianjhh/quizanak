const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Sign-up, email verification and login sessions.
function authRoutes({ config, db, bloom, mailer }) {
  const router = express.Router();
  const { credentials } = db;
  const { jwtSecret } = config;

  router.post('/api/validateEmail', async (req, res) => {
    try {
      /* check whether email exists in bloom filter */
      const emailExists = await bloom.exists(req.body.email);

      if (emailExists) {
        /* cross check with database since it could be false positive */
        let found = await credentials.findOne({ email: req.body.email }, { projection: { _id: 0, email: 1 } });

        if (found) {
          res.status(409).send('Email exists already!');
        } else {
          /* update bloom filter to make it up-to-date with db */
          res.status(200).send('Email does not exist! You can use that email!');
        }
      } else {
        res.status(200).send('Email does not exist! You can use that email!');
      }
    } catch (e) {
      if (e.message.endsWith('item exists')) {
        console.log('Bloom Filter already reserved.');
      } else {
        console.log('Error, maybe RedisBloom is not installed?:');
        console.log(e);
      }
    }
  });

  router.post('/api/resendCode', async (req, res) => {
    try {
      let targetUsername = req.body.username;
      if (!targetUsername && req.cookies && req.cookies.jwt) {
        try {
          const decoded = jwt.verify(req.cookies.jwt, jwtSecret);
          targetUsername = decoded.username;
        } catch (jwtErr) {}
      }

      if (!targetUsername) {
        return res.status(400).send('Username tidak ditemukan!');
      }

      let result = await credentials.findOne({ username: targetUsername }, { projection: { _id: 0, email: 1 } });

      if (result) {
        const verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');
        await credentials.updateOne({ username: targetUsername }, { $set: { verificationCode: verificationCode, codeCreatedAt: new Date().getTime() } });
        const foundEmail = result.email;

        // Dispatch email in background using Resend HTTPS API or Nodemailer SMTP fallback
        mailer.sendVerificationEmail(foundEmail, verificationCode)
          .then(() => console.log('Verification email dispatched successfully'))
          .catch((mailErr) => console.error('Error sending verification email in background:', mailErr));

        return res.status(200).send('Berhasil mengirim ulang email verifikasi!');
      } else {
        return res.status(404).send('Pengguna tidak ditemukan!');
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send('Error!');
    }
  });

  router.post('/api/login', async (req, res) => {
    try {
      let result = await credentials.findOne({ username: req.body.username });
      if (!result) {
        res.status(404).send('Username atau kata sandi salah!');
      } else {
        bcrypt.compare(req.body.password, result.password, function (err, result) {
          if (result !== true) {
            res.status(404).send('Username atau kata sandi salah!');
          } else {
            jwt.sign({ username: req.body.username }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
              if (err) {
                res.status.send('Error!');
                console.log(err);
              }
              res.status(200).cookie('jwt', token, { httpOnly: true, sameSite: 'none', secure: true }).json({ verified: result.verified });
            });
          }
        });
      }
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  router.post('/api/register', async (req, res) => {
    try {
      let data = req.body;
      let verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');

      // Dispatch email in background using Resend HTTPS API or Nodemailer SMTP fallback
      mailer.sendVerificationEmail(data.email, verificationCode)
        .then(() => console.log('Registration email dispatched successfully'))
        .catch((mailErr) => console.error('Error sending registration email in background:', mailErr));

      await credentials.insertOne({ username: data.username, password: data.password, email: data.email, verified: data.verified, createdAt: data.createdAt, verificationCode: verificationCode, codeCreatedAt: new Date().getTime() });
      try {
        await bloom.add(data.email);
      } catch (bloomErr) {
        console.log('Bloom filter add status:', bloomErr.message || bloomErr);
      }

      jwt.sign({ username: req.body.username }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          res.status.send('Error!');
        }
        res.status(200).cookie('jwt', token, { httpOnly: true, sameSite: 'none', secure: true }).send('Successful!');
      });
    } catch (e) {
      res.status(400).send('Error!');
      console.log(e);
    }
  });

  router.get('/api/homepage', async (req, res) => {
    if (!req.cookies.jwt) {
      res.status(400).send('Token otentikasi tidak valid, tolong coba lagi.');
    } else {
      jwt.verify(req.cookies.jwt, jwtSecret, async (err, authorizedData) => {
        if (err) {
          //If error send Forbidden (403)
          console.log(err);
          res.status(403);
        } else {
          let found = await credentials.findOne({ username: authorizedData.username }, { verified: 1, _id: 0 });
          if (found) {
            if (found.verified !== true) {
              res.status(400).send('Akun belum diverifikasi!');
            } else {
              console.log('verified!');
              //If token is successfully verified, we can send the authorized data
              res.status(200).json({
                message: 'Successful log in',
                authorizedData,
              });
            }
          }
        }
      });
    }
  });

  router.get('/api/verifyToken', async (req, res) => {
    try {
      if (!req.cookies.jwt) {
        res.status(400).send('error');
      } else {
        jwt.verify(req.cookies.jwt, jwtSecret, async (err, authorizedData) => {
          if (err) {
            //If error send Forbidden (403)
            console.log(err);
            res.status(403).send('error');
          } else {
            /* retrieve verified status of user */
            let found = await credentials.findOne({ username: authorizedData.username }, { verified: 1, _id: 0 });

            if (!found) {
              res.status(400).send('Oops! ada error.');
            }

            //If token is successfully verified, we can send the authorized data
            res.status(200).json({
              message: 'Successful log in',
              verified: found.verified,
              authorizedData,
            });
          }
        });
      }
    } catch (e) {
      res.status(400).send('Oops! ada error.');
    }
  });

  router.post('/api/setVerified', async (req, res) => {
    try {
      let verifySuccess = await credentials.findOne({ verificationCode: req.body.verificationCode }, { projection: { _id: 0, verificationCode: 1, codeCreatedAt: 1 } });

      if (verifySuccess) {
        /* if verification code expired */
        if ((verifySuccess.codeCreatedAt + 86400000) < new Date().getTime()) {
          return res.status(498).send('Code Expired!');
        }

        let result = await credentials.updateOne({ verificationCode: req.body.verificationCode }, { $set: { verified: true }, $unset: { createdAt: '', verificationCode: '', codeCreatedAt: '' } });
        if (!result) {
          res.status(404).send('Not found!');
        } else {
          jwt.sign({ username: req.body.username }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (err) {
              res.status.send('Error!');
            }
            res.status(200).cookie('jwt', token, { httpOnly: true, sameSite: 'none', secure: true }).send('Successful!');
          });
        }
      } else {
        res.status(404).send('Wrong verification code!');
      }
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  router.get('/api/logout', async (req, res) => {
    try {
      res.status(202).clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true }).send('cookie cleared');
    } catch (e) {
      res.status(400).send('error');
    }
  });

  return router;
}

module.exports = { authRoutes };
