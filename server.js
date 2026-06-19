const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory store: which ducks have a quack waiting
const pendingQuacks = {};

// Extension calls this when a threshold is hit
app.post('/', (req, res) => {
  console.log('Threshold received from extension:', req.body);
  const duckId = 'duck1'; // single duck for now
  pendingQuacks[duckId] = true;
  res.send('Quack queued for duck!');
});

// Duck calls this repeatedly asking "anything for me?"
app.get('/poll', (req, res) => {
  const duckId = req.query.id || 'duck1';
  if (pendingQuacks[duckId]) {
    pendingQuacks[duckId] = false;
    console.log(`Duck ${duckId} polled — sending QUACK`);
    res.send('QUACK');
  } else {
    res.send('NONE');
  }
});

// Manual quack from the app, also queues it
app.post('/manual-quack', (req, res) => {
  const duckId = 'duck1';
  pendingQuacks[duckId] = true;
  console.log('Manual quack queued');
  res.send('Quack queued!');
});

app.get('/test', (req, res) => {
  res.send('Server is alive. Ducks connected: ' + Object.keys(pendingQuacks).length);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DeskDuck relay server running on port ${PORT}`);
});
