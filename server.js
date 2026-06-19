const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pendingQuacks = {};
const lastSeen = {};

app.post('/', (req, res) => {
  console.log('Threshold received from extension:', req.body);
  const duckId = 'duck1';
  pendingQuacks[duckId] = true;
  res.send('Quack queued for duck!');
});

app.post('/manual-quack', (req, res) => {
  const duckId = 'duck1';
  pendingQuacks[duckId] = true;
  console.log('Manual quack queued');
  res.send('Quack queued!');
});

app.get('/poll', (req, res) => {
  const duckId = req.query.id || 'duck1';
  lastSeen[duckId] = Date.now();
  if (pendingQuacks[duckId]) {
    pendingQuacks[duckId] = false;
    console.log(`Duck ${duckId} polled — sending QUACK`);
    res.send('QUACK');
  } else {
    res.send('NONE');
  }
});

app.get('/status', (req, res) => {
  const duckId = req.query.id || 'duck1';
  const last = lastSeen[duckId];
  if (!last) {
    return res.json({ online: false, message: 'never seen' });
  }
  const secondsAgo = Math.round((Date.now() - last) / 1000);
  const online = secondsAgo < 10;
  res.json({ online: online, secondsAgo: secondsAgo });
});

app.get('/test', (req, res) => {
  res.send('Server is alive.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DeskDuck relay server running on port ${PORT}`);
});
