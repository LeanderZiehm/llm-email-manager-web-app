# Node.js Express Email Manager with IMAP

A simple Node.js web app using **Express** and **imap** to connect to your email inbox (e.g., Gmail), list emails, and read email content via IMAP.

---

## Features

- Connect to IMAP server (tested with Gmail)
- List latest 10 emails with basic headers (From, To, Subject, Date)
- Fetch full email body and headers by message sequence number

---

## Prerequisites

- Node.js v12+ and npm installed
- Valid email credentials (for Gmail, generate an [App Password](https://support.google.com/accounts/answer/185833) if 2FA is enabled)
- IMAP access enabled on your email account (Gmail: IMAP enabled in settings)

---

## Installation

1. Clone the repository or create a project folder.

2. Inside your project directory, create `app.js` with the app code.

3. Initialize npm and install dependencies:

```bash
npm install
````

---

## Configuration

Edit the `IMAP_CONFIG` object in `app.js`:

```js
const IMAP_CONFIG = {
  user: 'your-email@gmail.com',
  password: 'your-app-password',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};
```

* Replace `user` with your email address.
* Replace `password` with your email password or app password (recommended).
* Adjust host/port if using a different email provider.

---

## Running the app

Start the server:

```bash
node app.js
```

By default, it listens on port `3000`. You can change the port by setting the `PORT` environment variable.

---

## API Endpoints

* `GET /emails`
  Lists the latest 10 emails in the inbox with basic headers.

* `GET /emails/:seqno`
  Fetches full headers and body for the email with sequence number `seqno`.

---

## Example Usage with curl

List latest emails:

```bash
curl http://localhost:3000/emails
```

Fetch full email body by sequence number (e.g., 5):

```bash
curl http://localhost:3000/emails/5
```

---

## Notes

* This app uses simple authentication; OAuth2 is recommended for Gmail in production.
* It does not handle complex email parsing (attachments, encoded headers).
* Use with care to avoid exposing sensitive credentials.

---

