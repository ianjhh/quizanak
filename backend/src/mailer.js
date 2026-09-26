const nodemailer = require('nodemailer');

// Sends verification codes through the Resend HTTPS API when it is configured,
// falling back to Gmail through Nodemailer.
function createMailer(emailConfig) {
  const { user, pass, google, smtp, resend } = emailConfig;

  let transporter;
  if (pass) {
    // Option 1: Gmail App Password
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });
  } else if (google.refreshToken && google.clientId) {
    // Option 2: Google OAuth2
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId: google.clientId,
        clientSecret: google.clientSecret,
        refreshToken: google.refreshToken,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });
  } else {
    // Fallback SMTP
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user, pass },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });
  }

  const sendVerificationEmail = async (toEmail, verificationCode) => {
    const subject = 'Masukin kode 6-digit yang diberikan untuk verifikasi akun anda.';
    const textContent = `Kode verifikasi anda adalah:\n${verificationCode}`;

    console.log(`🔑 [VERIFICATION CODE] For ${toEmail}: ${verificationCode}`);

    // 1. Primary: Resend HTTPS API (Port 443 - Never blocked on Render free tier)
    if (resend.apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resend.apiKey}`,
          },
          body: JSON.stringify({
            from: resend.from,
            to: [toEmail],
            subject,
            text: textContent,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log('✅ Resend HTTPS email sent successfully:', data);
          return data;
        }
        console.error('❌ Resend HTTPS API error:', data);
      } catch (resendErr) {
        console.error('❌ Resend API fetch failed:', resendErr);
      }
    }

    // 2. Fallback: Nodemailer SMTP
    return transporter.sendMail({
      from: `"KuisAnak" <${user}>`,
      to: toEmail,
      subject,
      text: textContent,
    });
  };

  // Verify Nodemailer transporter connection on startup
  const verifyConnection = () => {
    transporter.verify((error) => {
      if (error) {
        console.error('❌ Nodemailer transporter connection failed:', error.message || error);
        console.log('💡 Tip: Render free tier blocks outbound SMTP ports 465/587. Add RESEND_API_KEY to Render to send via HTTPS (Port 443).');
      } else {
        console.log('✅ Nodemailer transporter connected successfully to Gmail SMTP!');
      }
    });
  };

  return { sendVerificationEmail, verifyConnection };
}

module.exports = { createMailer };
