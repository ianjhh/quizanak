const nodemailer = require('nodemailer');

// Verification emails can go out four ways, tried in this order:
//
// 1. A Google Apps Script web app in the sender's Gmail account (the "mail
//    relay", backend/apps-script/mailer.gs). HTTPS, so it works on hosts that
//    block SMTP (such as Render's free tier), and it never expires.
// 2. Gmail API over HTTPS, using a Google OAuth refresh token. Also works on
//    Render, but tokens of an OAuth app in "Testing" mode expire after 7 days.
// 3. Resend's HTTPS API. Until a domain is verified in Resend, it only
//    delivers to the Resend account owner's own address.
// 4. SMTP through Nodemailer: Gmail with an App Password, or a custom relay.
//
// When none is configured (local development) the code is printed to the log.

const SEND_TIMEOUT_MS = 8000;
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const RESEND_URL = 'https://api.resend.com/emails';

function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} did not answer within ${ms / 1000} s`)), ms);
    }),
  ]);
}

// "dewi@example.com" -> "d***@example.com", to keep addresses out of the logs.
function maskEmail(email) {
  const [name, domain] = String(email).split('@');
  return domain ? `${name.slice(0, 1)}***@${domain}` : '***';
}

function verificationEmail(code) {
  return {
    subject: `Kode verifikasi KuisAnak: ${code}`,
    text: [
      'Halo!',
      '',
      `Kode verifikasi akun KuisAnak kamu adalah: ${code}`,
      '',
      'Masukkan kode ini di halaman verifikasi. Kode berlaku selama 24 jam.',
      'Kalau kamu tidak mendaftar di KuisAnak, abaikan saja email ini.',
    ].join('\n'),
    html: `<p>Halo!</p>
<p>Kode verifikasi akun KuisAnak kamu adalah:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
<p>Masukkan kode ini di halaman verifikasi. Kode berlaku selama 24 jam.</p>
<p>Kalau kamu tidak mendaftar di KuisAnak, abaikan saja email ini.</p>`,
  };
}

// Renders a message to the raw RFC 5322 format the Gmail API expects.
const messageComposer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' });

function gmailApiTransport({ user, google }, fetchImpl) {
  let cachedToken = null;

  async function accessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60 * 1000) {
      return cachedToken.value;
    }
    const response = await fetchImpl(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: google.clientId,
        client_secret: google.clientSecret,
        refresh_token: google.refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const hint = data.error === 'invalid_grant'
        ? ' The refresh token was revoked or expired. Tokens from an OAuth app in "Testing" mode expire after 7 days; publish the app and create a new token.'
        : '';
      throw new Error(`Google rejected the OAuth credentials (${response.status} ${data.error || ''}).${hint}`);
    }
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
    return cachedToken.value;
  }

  return {
    name: 'Gmail API',
    check: accessToken,
    async send(message) {
      const { message: raw } = await messageComposer.sendMail({
        ...message,
        // Gmail fills in the account's own address when From is omitted.
        from: user ? { name: 'KuisAnak', address: user } : undefined,
      });
      const response = await fetchImpl(GMAIL_SEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: raw.toString('base64url') }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const reason = (data.error && data.error.message) || response.statusText;
        throw new Error(`Gmail API refused the message (${response.status}): ${reason}`);
      }
    },
  };
}

// The relay only takes an address and a code and writes the email itself, so even
// someone who learned the secret could not send other content from the account.
function relayTransport({ relay }, fetchImpl) {
  async function call(options) {
    const response = await fetchImpl(relay.url, { redirect: 'follow', ...options });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      throw new Error(`the mail relay answered ${response.status} without JSON. Check MAIL_RELAY_URL: it must be `
        + 'the web app URL ending in /exec, deployed with access "Anyone".');
    }
    return data;
  }
  return {
    name: 'Mail relay (Apps Script)',
    async check() {
      const data = await call({ method: 'GET' });
      if (!data.ok) {
        throw new Error(`the mail relay is not ready: ${data.error || 'unknown error'}`);
      }
    },
    async send({ to, code }) {
      const data = await call({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ secret: relay.secret, to, code }),
      });
      if (!data.ok) {
        throw new Error(`the mail relay refused the message: ${data.error || 'unknown error'}`);
      }
    },
  };
}

function resendTransport({ resend }, fetchImpl) {
  return {
    name: 'Resend',
    async check() {
      // A sending-only API key cannot list domains; that is not an error.
      const response = await fetchImpl('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${resend.apiKey}` } });
      if (response.status === 401 || response.status === 403) {
        return;
      }
      const data = await response.json().catch(() => ({}));
      const verified = (data.data || []).filter((domain) => domain.status === 'verified');
      if (verified.length === 0) {
        throw new Error('no verified domain, so Resend only delivers to the account owner. Verify a domain and set RESEND_FROM to an address on it.');
      }
    },
    async send({ to, subject, text, html }) {
      const response = await fetchImpl(RESEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resend.apiKey}` },
        body: JSON.stringify({ from: resend.from, to: [to], subject, text, html }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const sandbox = /testing emails|verify a domain/i.test(data.message || '');
        const hint = sandbox ? ' Resend only delivers to your own address until you verify a domain and set RESEND_FROM to an address on it.' : '';
        throw new Error(`Resend refused the message (${response.status}): ${data.message || response.statusText}.${hint}`);
      }
    },
  };
}

function smtpTransport({ user, pass, smtp }) {
  const timeouts = { connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 5000 };
  const transporter = pass
    ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass }, ...timeouts })
    : nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.secure, ...timeouts });
  return {
    name: pass ? 'Gmail SMTP' : `SMTP (${smtp.host})`,
    check: () => transporter.verify(),
    send: (message) => transporter.sendMail({ ...message, from: user ? { name: 'KuisAnak', address: user } : undefined }),
  };
}

function createMailer(emailConfig, { fetch: fetchImpl = fetch, timeoutMs = SEND_TIMEOUT_MS } = {}) {
  const { relay, google, resend, pass, smtp } = emailConfig;
  const transports = [];
  if (relay.url && relay.secret) {
    transports.push(relayTransport(emailConfig, fetchImpl));
  }
  if (google.clientId && google.clientSecret && google.refreshToken) {
    transports.push(gmailApiTransport(emailConfig, fetchImpl));
  }
  if (resend.apiKey) {
    transports.push(resendTransport(emailConfig, fetchImpl));
  }
  if (pass || smtp.host) {
    transports.push(smtpTransport(emailConfig));
  }

  return {
    transports: transports.map((transport) => transport.name),

    // Tries each transport in turn. Resolves to true once one delivers the
    // email, false when none could; it never rejects.
    async sendVerificationCode(to, code) {
      if (transports.length === 0) {
        console.log(`No email transport is configured. Verification code for ${maskEmail(to)}: ${code}`);
        return false;
      }
      const message = { to, code, ...verificationEmail(code) };
      for (const transport of transports) {
        try {
          await withTimeout(transport.send(message), timeoutMs, transport.name);
          console.log(`Verification email sent to ${maskEmail(to)} via ${transport.name}.`);
          return true;
        } catch (err) {
          console.error(`Could not send the verification email via ${transport.name}: ${err.message}`);
        }
      }
      return false;
    },

    // Logs, at startup, which transports are configured and whether their
    // credentials work, so delivery problems show up in the server log early.
    async checkConfiguration() {
      if (transports.length === 0) {
        console.log('No email transport is configured; verification codes will be printed to this log.');
        return;
      }
      for (const transport of transports) {
        try {
          await withTimeout(transport.check(), timeoutMs, transport.name);
          console.log(`Email transport ready: ${transport.name}`);
        } catch (err) {
          console.error(`Email transport ${transport.name} is not working: ${err.message}`);
        }
      }
    },
  };
}

module.exports = { createMailer, verificationEmail };
