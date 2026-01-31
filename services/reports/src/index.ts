/**
 * SafeLink Africa — Reports Service
 * Community safety reports: create, list, get, update status.
 */

import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { reportsRouter } from './routes/reports';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/reports', reportsRouter);

app.get('/', (_, res) => {
  res.json({
    service: 'reports',
    message: 'SafeLink Africa Reports Service',
    version: '1.0.0',
    endpoints: ['GET /reports', 'POST /reports', 'GET /reports/:id', 'PATCH /reports/:id'],
  });
});

export { app };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[reports] Listening on http://localhost:${PORT}`);
  });
}
