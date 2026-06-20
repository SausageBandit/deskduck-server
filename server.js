const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const DAILY_SEND_LIMIT = 50;

app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const ducks = {};
const claims = {};
const sendCounts = {};

function ensureDuck(duckId) {
  if (!ducks[duckId]) {
    ducks[duckId] = { quackType: null, lastSeen: null, firstSeen: Date.now() };
  }
  return ducks[duckId];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

app.post('/quack', (req, res) => {
  const duckId = req.body.duckId || req.query.duckId;
  if (!duckId) return res.status(400).send('Missing duckId');
  const duck = ensureDuck(duckId);
  duck.quackType = 'normal';
  console.log(`Normal quack queued for ${duckId}`);
  res.send('Quack queued!');
});

app.post('/send-quack', (req, res) => {
  const duckId = req.body.duckId;
  const senderDuckId = req.body.senderDuckId;
  if (!duckId) return res.status(400).send('Missing duckId');

  if (senderDuckId) {
    const key = `${senderDuckId}:${todayKey()}`;
    const count = sendCounts[key] || 0;
    if (count >= DAILY_SEND_LIMIT) {
      console.log(`Sender ${senderDuckId} hit daily send limit`);
      return res.status(429).json({ error: 'limit_reached' });
    }
    sendCounts[key] = count + 1;
  }

  const duck = ensureDuck(duckId);
  duck.quackType = 'sent';
  console.log(`Sent quack (special tone) queued for ${duckId}, from ${senderDuckId || 'unknown'}`);
  res.send('Sent quack queued!');
});

app.get('/poll', (req, res) => {
  const duckId = req.query.id;
  if (!duckId) return res.status(400).send('NONE');
  const duck = ensureDuck(duckId);
  duck.lastSeen = Date.now();

  if (duck.quackType) {
    const type = duck.quackType;
    duck.quackType = null;
    console.log(`Duck ${duckId} polled — sending ${type.toUpperCase()} quack`);
    res.send(type === 'sent' ? 'QUACK_SENT' : 'QUACK_NORMAL');
  } else {
    res.send('NONE');
  }
});

app.get('/status', (req, res) => {
  const duckId = req.query.id;
  if (!duckId || !ducks[duckId] || !ducks[duckId].lastSeen) {
    return res.json({ online: false, message: 'never seen' });
  }
  const secondsAgo = Math.round((Date.now() - ducks[duckId].lastSeen) / 1000);
  res.json({ online: secondsAgo < 10, secondsAgo: secondsAgo });
});

app.post('/register', (req, res) => {
  const duckId = req.body.duckId;
  const claimToken = req.body.claimToken;
  if (!duckId || !claimToken) return res.status(400).send('Missing fields');
  claims[claimToken] = { duckId: duckId, timestamp: Date.now() };
  ensureDuck(duckId);
  console.log(`Duck ${duckId} registered with claim token`);
  res.send('Registered');
});

app.get('/claim-status', (req, res) => {
  const token = req.query.token;
  if (!token || !claims[token]) {
    return res.json({ found: false });
  }
  const claim = claims[token];
  const ageMs = Date.now() - claim.timestamp;
  if (ageMs > 5 * 60 * 1000) {
    return res.json({ found: false });
  }
  res.json({ found: true, duckId: claim.duckId });
});

app.get('/test', (req, res) => {
  res.send('Server alive. Known ducks: ' + Object.keys(ducks).length);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DeskDuck relay server running on port ${PORT}`);
});
