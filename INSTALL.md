# Installation Guide

## Step-by-Step Installation

Due to dependency conflicts between backend services and the mobile app, they need to be installed separately.

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Install Backend Services
```bash
npm run install:services
```

Or install individually:
```bash
npm install --workspace=services/auth
npm install --workspace=services/emergency
npm install --workspace=services/reporting
npm install --workspace=services/transport
npm install --workspace=services/notifications
npm install --workspace=services/iot-gateway
```

### 3. Install Mobile App Dependencies
```bash
cd mobile
npm install --legacy-peer-deps
cd ..
```

Or use the npm script:
```bash
npm run install:mobile
```

## Why Separate Installation?

The mobile app uses React Native/Expo dependencies that conflict with Node.js backend dependencies. Installing them separately avoids version conflicts.

## Troubleshooting

### If you get peer dependency warnings:
- For backend services: These are usually safe to ignore
- For mobile app: Use `--legacy-peer-deps` flag

### If installation fails:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` folders
3. Delete `package-lock.json` files
4. Try installation again

### Mobile app specific issues:
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Quick Install (All Steps)
```bash
# Backend
npm install
npm run install:services

# Mobile (separate terminal or after backend)
cd mobile
npm install --legacy-peer-deps
cd ..
```

