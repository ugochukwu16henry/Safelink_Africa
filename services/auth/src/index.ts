/**
 * SafeLink Africa — Auth Service
 * User registration, login, JWT, trusted contacts.
 */

import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);

app.get('/', (_, res) => {
  res.json({
    service: 'auth',
    message: 'SafeLink Africa Auth Service',
    version: '1.0.0',
    endpoints: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
  });
});

export { app };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[auth] Listening on http://localhost:${PORT}`);
  });
}
