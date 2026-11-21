const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// ===== Paiements Pi Network (inchangé) =====
const PI_API = 'https://api.pi.network/v2';
const headers = () => ({
  'Authorization': `Key ${process.env.PI_API_KEY}`,
  'Content-Type': 'application/json'
});

app.post('/payment/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const r = await fetch(`${PI_API}/payments/${paymentId}/approve`, {
      method: 'POST', headers: headers()
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/payment/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    const r = await fetch(`${PI_API}/payments/${paymentId}/complete`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ txid })
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'agrossignol-backend' });
});

module.exports = app;

if (require.main === module) {
  app.listen(process.env.PORT || 3000);
}
