import 'dotenv/config';
import express from 'express';
import { handleHistoryRequest } from './history-handler';
import { reverseGeocode } from './geocode';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/geocode', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ error: 'Invalid coordinates' });
      return;
    }

    const placeName = await reverseGeocode(lat, lng);
    res.json({ placeName });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(400).json({ error: message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const result = await handleHistoryRequest(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(400).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`History API listening on http://localhost:${port}`);
});
