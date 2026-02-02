import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_, res) => {
  res.json({
    status: 'ok',
    service: 'reports',
    timestamp: new Date().toISOString(),
  });
});
