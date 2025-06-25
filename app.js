const express = require('express');
const Imap = require('imap');
const inspect = require('util').inspect;

const app = express();
app.use(express.json());

const IMAP_CONFIG = {
  user: 'your-email@gmail.com',
  password: 'your-app-password',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};

function openInbox(imap, cb) {
  imap.openBox('INBOX', true, cb);
}

// Route: list latest 10 emails with basic headers
app.get('/emails', (req, res) => {
  const imap = new Imap(IMAP_CONFIG);

  imap.once('ready', () => {
    openInbox(imap, (err, box) => {
      if (err) {
        imap.end();
        return res.status(500).send('Failed to open inbox');
      }

      const fetchRange = box.messages.total > 10 ? `${box.messages.total - 9}:*` : '1:*';

      const f = imap.seq.fetch(fetchRange, {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        struct: true,
      });

      let emails = [];

      f.on('message', (msg, seqno) => {
        let email = { seqno };
        msg.on('body', (stream) => {
          let buffer = '';
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', () => {
            email.headers = Imap.parseHeader(buffer);
          });
        });
        msg.once('attributes', (attrs) => {
          email.attrs = attrs;
        });
        msg.once('end', () => {
          emails.push(email);
        });
      });

      f.once('error', (err) => {
        imap.end();
        return res.status(500).send('Fetch error: ' + err.message);
      });

      f.once('end', () => {
        imap.end();
        // Sort emails by seqno ascending (oldest first)
        emails.sort((a, b) => a.seqno - b.seqno);
        res.json(emails);
      });
    });
  });

  imap.once('error', (err) => {
    return res.status(500).send('IMAP connection error: ' + err.message);
  });

  imap.connect();
});

// Route: get full body of email by sequence number
app.get('/emails/:seqno', (req, res) => {
  const seqno = req.params.seqno;
  const imap = new Imap(IMAP_CONFIG);

  imap.once('ready', () => {
    openInbox(imap, (err, box) => {
      if (err) {
        imap.end();
        return res.status(500).send('Failed to open inbox');
      }

      const f = imap.seq.fetch(seqno, {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
        struct: true,
      });

      let email = { seqno };

      f.on('message', (msg) => {
        msg.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', () => {
            if (info.which === 'TEXT') {
              email.body = buffer;
            } else {
              email.headers = Imap.parseHeader(buffer);
            }
          });
        });

        msg.once('attributes', (attrs) => {
          email.attrs = attrs;
        });
      });

      f.once('error', (err) => {
        imap.end();
        return res.status(500).send('Fetch error: ' + err.message);
      });

      f.once('end', () => {
        imap.end();
        res.json(email);
      });
    });
  });

  imap.once('error', (err) => {
    return res.status(500).send('IMAP connection error: ' + err.message);
  });

  imap.connect();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Email manager app running on http://localhost:${PORT}`);
});
