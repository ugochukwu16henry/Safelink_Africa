/**
 * SafeLink Africa — Emergency Service
 * SOS trigger, location updates, alert status.
 */

import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { emergencyRouter } from './routes/emergency';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/emergency', emergencyRouter);

app.get('/', (_, res) => {
  res.json({
    service: 'emergency',
    message: 'SafeLink Africa Emergency Service',
    version: '1.0.0',
    endpoints: ['GET /emergency', 'POST /emergency/trigger', 'POST /emergency/location', 'GET /emergency/:id'],
  });
});

export { app };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[emergency] Listening on http://localhost:${PORT}`);
  });
}
