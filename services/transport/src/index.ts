/**
 * Transport Service - Transport Monitoring Microservice
 * Port: 3004
 */

import express, { Express } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import Redis from 'redis';
import { transportRouter } from './routes/transport';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3004;

// Database connection
export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'safelink_africa',
  user: process.env.DB_USER || 'safelink',
  password: process.env.DB_PASSWORD || 'safelink_dev_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection
export const redis = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

redis.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redis.connect().catch((err) => {
  logger.error('Redis Connection Error:', err);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'transport-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/transport', transportRouter);

// Socket.IO for real-time location updates
io.on('connection', (socket) => {
  logger.info(`Transport socket connected: ${socket.id}`);

  socket.on('trip:location', (data) => {
    const { tripId, location } = data;
    socket.to(`trip:${tripId}`).emit('trip:location_update', { tripId, location });
  });

  socket.on('disconnect', () => {
    logger.info(`Transport socket disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚗 Transport Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    db.end();
    redis.quit();
    process.exit(0);
  });
});

export { io };
export default app;

