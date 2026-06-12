import 'dotenv/config';
import express from 'express';
import { handleHistoryRequest } from './history-handler';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
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
