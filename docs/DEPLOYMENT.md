# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)
- Node.js 18+
- AWS/GCP account (for production)

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Start services: `docker-compose up -d`
4. Run migrations: `npm run migrate`
5. Start services: `npm run dev`

## Production Deployment

### Backend Services

1. Build Docker images: `docker-compose build`
2. Push to container registry
3. Deploy to cloud (AWS ECS, GCP Cloud Run, etc.)
4. Configure environment variables
5. Set up load balancer
6. Configure SSL certificates

### Mobile App

1. Build Android APK: `cd mobile && expo build:android`
2. Build iOS IPA: `cd mobile && expo build:ios`
3. Submit to app stores
4. Configure push notifications (FCM/APNS)

## Environment Variables

See `.env.example` for required environment variables.

## Monitoring

- Set up logging (CloudWatch, Stackdriver)
- Configure monitoring (Grafana, Prometheus)
- Set up alerts for critical errors

