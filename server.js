const express = require('express');
const axios = require('axios');
const app = express();

const DUCK_IP = '172.20.10.7';
const PORT = 3000;

app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/', async (req, res) => {
  console.log('Threshold received from extension:', req.body);
  try {
    const response = await axios.get(`http://${DUCK_IP}/quack`);
    console.log('Duck responded:', response.data);
    res.send('Quack sent to duck!');
  } catch (err) {
    console.error('Failed to reach duck:', err.message);
    res.status(500).send('Could not reach duck');
  }
});

app.get('/test', async (req, res) => {
  try {
    const response = await axios.get(`http://${DUCK_IP}/quack`);
    res.send('Test quack sent! Duck said: ' + response.data);
  } catch (err) {
    res.status(500).send('Could not reach duck: ' + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DeskDuck relay server running on port ${PORT}`);
  console.log(`Duck IP: ${DUCK_IP}`);
});
