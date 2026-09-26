# Sending verification emails

The API emails a 6-digit code to every new account. It can send through three
services and tries them in this order, using the first one that works:

| Option | Works on Render's free tier | Delivers to any address | Needs your own domain |
| --- | --- | --- | --- |
| Gmail API (recommended) | Yes, it uses HTTPS | Yes | No |
| Resend | Yes, it uses HTTPS | Only after you verify a domain | Yes |
| SMTP (Gmail App Password) | No, Render blocks outgoing SMTP | Yes | No |

If none is configured, the API prints each code to its log instead, which is
all you need for local development.

At startup the API logs whether each configured option works, for example
`Email transport ready: Gmail API`, and every failed send is logged with the
reason. Check the Render logs first when codes don't arrive.

## Gmail API (recommended)

You need a Gmail account to send from, and about 15 minutes.

1. Open the [Google Cloud console](https://console.cloud.google.com/) and create
   a project, for example "KuisAnak".
2. Go to **APIs & Services → Library**, search for **Gmail API** and enable it.
3. Go to **APIs & Services → OAuth consent screen** (called **Google Auth
   Platform** in newer consoles):
   - Choose the **External** user type and fill in the app name and emails.
   - Under **Data access** (or **Scopes**), add
     `https://www.googleapis.com/auth/gmail.send`.
   - Under **Audience**, click **Publish app** so the status is
     **In production**. While an app is in *Testing*, Google expires its
     refresh tokens after 7 days, and emails stop again a week later.
4. Go to **APIs & Services → Credentials → Create credentials → OAuth client
   ID**. Choose **Web application** and add this authorized redirect URI:
   `https://developers.google.com/oauthplayground`. Copy the client ID and
   client secret.
5. Open the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground):
   - Click the gear icon, tick **Use your own OAuth credentials**, and paste
     the client ID and secret.
   - In **Step 1**, type `https://www.googleapis.com/auth/gmail.send` into the
     scope box and click **Authorize APIs**. Sign in with the Gmail account
     that should send the codes. Google warns that it hasn't verified the app;
     that's expected for your own app, so choose **Advanced → Go to …**.
   - In **Step 2**, click **Exchange authorization code for tokens** and copy
     the **Refresh token**.
6. In the Render dashboard, open the API service's **Environment** tab and set:

   ```
   EMAIL_USER=the-sending-account@gmail.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REFRESH_TOKEN=...
   ```

   Save, let the service redeploy, and look for `Email transport ready: Gmail API`
   in the logs.

## Resend

Set `RESEND_API_KEY`. Until you verify a domain in Resend, it only delivers to
the address that owns the Resend account; other recipients are refused. To
email everyone, verify a domain you own at [resend.com/domains](https://resend.com/domains)
and set `RESEND_FROM` to an address on it, for example
`KuisAnak <kode@your-domain.com>`.

## SMTP

Set `EMAIL_USER` and a Gmail [App Password](https://myaccount.google.com/apppasswords)
in `EMAIL_PASS`, or point `EMAIL_HOST`, `EMAIL_PORT` and `EMAIL_SECURE` at
another SMTP server. This is convenient locally, but Render's free tier blocks
outgoing SMTP connections, so use the Gmail API there.

## Troubleshooting

| Log message | Meaning and fix |
| --- | --- |
| `Google rejected the OAuth credentials (400 invalid_grant)` | The refresh token expired or was revoked. Make sure the app is published (step 3), then create a new token (step 5). |
| `Gmail API refused the message (403)` | The Gmail API is not enabled for the project (step 2), or the token lacks the `gmail.send` scope. |
| `Resend refused the message (403) … testing emails` | Resend is still in test mode. Verify a domain and set `RESEND_FROM`. |
| `… via Gmail SMTP: Connection timeout` | The host blocks SMTP. On Render, use the Gmail API instead. |
