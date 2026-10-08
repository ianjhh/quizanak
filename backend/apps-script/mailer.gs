// KuisAnak mail relay: a Google Apps Script web app that sends verification codes from
// the Gmail account it runs in. The API calls it over HTTPS (MAIL_RELAY_URL), which works
// on Render's free tier where SMTP is blocked. Setup: docs/email-setup.md.
//
// It only accepts an address and a 6-digit code and writes the email itself, so even with
// the secret nobody can use it to send other content.

// Must match MAIL_RELAY_SECRET on the API server.
const SECRET = 'PASTE_THE_SAME_SECRET_AS_MAIL_RELAY_SECRET';

function doGet() {
  // The API calls this at startup to check that the relay is reachable.
  return reply({ ok: true, service: 'kuisanak-mailer', remainingToday: MailApp.getRemainingDailyQuota() });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: 'the request is not JSON' });
  }
  if (!SECRET || SECRET.indexOf('PASTE_') === 0 || body.secret !== SECRET) {
    return reply({ ok: false, error: 'wrong secret' });
  }
  const to = String(body.to || '').trim();
  const code = String(body.code || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return reply({ ok: false, error: 'not an email address' });
  }
  if (!/^\d{6}$/.test(code)) {
    return reply({ ok: false, error: 'the code must be 6 digits' });
  }
  MailApp.sendEmail({
    to: to,
    name: 'KuisAnak',
    subject: 'Kode verifikasi KuisAnak: ' + code,
    body: 'Halo!\n\nKode verifikasi akun KuisAnak kamu adalah: ' + code + '\n\n'
      + 'Masukkan kode ini di halaman verifikasi. Kode berlaku selama 24 jam.\n'
      + 'Kalau kamu tidak mendaftar di KuisAnak, abaikan saja email ini.',
    htmlBody: '<p>Halo!</p><p>Kode verifikasi akun KuisAnak kamu adalah:</p>'
      + '<p style="font-size:28px;font-weight:bold;letter-spacing:6px">' + code + '</p>'
      + '<p>Masukkan kode ini di halaman verifikasi. Kode berlaku selama 24 jam.</p>'
      + '<p>Kalau kamu tidak mendaftar di KuisAnak, abaikan saja email ini.</p>',
  });
  return reply({ ok: true });
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
