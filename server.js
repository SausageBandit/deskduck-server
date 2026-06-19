const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const ducks = {};

function ensureDuck(duckId) {
  if (!ducks[duckId]) {
    ducks[duckId] = { quackType: null, lastSeen: null };
  }
  return ducks[duckId];
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
  const duckId = req.body.duckId || req.query.duckId;
  if (!duckId) return res.status(400).send('Missing duckId');
  const duck = ensureDuck(duckId);
  duck.quackType = 'sent';
  console.log(`Sent quack (special tone) queued for ${duckId}`);
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

app.get('/test', (req, res) => {
  res.send('Server alive. Known ducks: ' + Object.keys(ducks).length);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DeskDuck relay server running on port ${PORT}`);
});
