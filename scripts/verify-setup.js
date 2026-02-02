/**
 * Verification Script
 * Verifies that database, backend services, and APIs are working correctly
 */

const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  return async () => {
    try {
      await fn();
      log(`✓ ${name}`, 'green');
      passed++;
      return true;
    } catch (error) {
      log(`✗ ${name}: ${error.message}`, 'red');
      failed++;
      return false;
    }
  };
}

async function verifyDatabase() {
  log('\n📊 Verifying Database...', 'cyan');
  
  const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'safelink_africa',
    user: process.env.DB_USER || 'safelink',
    password: process.env.DB_PASSWORD || 'safelink_dev_password',
  });

  await test('Database connection', async () => {
    await db.query('SELECT NOW()');
  })();

  await test('PostGIS extension', async () => {
    const result = await db.query("SELECT * FROM pg_extension WHERE extname = 'postgis'");
    if (result.rows.length === 0) {
      throw new Error('PostGIS extension not installed');
    }
  })();

  await test('UUID extension', async () => {
    const result = await db.query("SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'");
    if (result.rows.length === 0) {
      throw new Error('uuid-ossp extension not installed');
    }
  })();

  const tables = [
    'users',
    'emergency_contacts',
    'emergency_alerts',
    'incident_reports',
    'transport_trips',
    'notifications',
    'iot_devices'
  ];

  for (const table of tables) {
    await test(`Table '${table}' exists`, async () => {
      const result = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      if (!result.rows[0].exists) {
        throw new Error(`Table ${table} does not exist`);
      }
    })();
  }

  await db.end();
}

async function verifyServices() {
  log('\n🔌 Verifying Backend Services...', 'cyan');
  
  const services = [
    { port: 3001, name: 'Auth Service' },
    { port: 3002, name: 'Emergency Service' },
    { port: 3003, name: 'Reporting Service' },
    { port: 3004, name: 'Transport Service' },
    { port: 3005, name: 'Notifications Service' }
  ];

  for (const service of services) {
    await test(`${service.name} (port ${service.port}) health check`, async () => {
      const response = await axios.get(`http://localhost:${service.port}/health`, {
        timeout: 5000
      });
      if (response.data.status !== 'healthy') {
        throw new Error('Service not healthy');
      }
    })();
  }
}

async function verifyAPIs() {
  log('\n🌐 Verifying API Endpoints...', 'cyan');
  
  // Test Auth API
  await test('POST /api/auth/register', async () => {
    await axios.post('http://localhost:3001/api/auth/register', {
      phoneNumber: '+2349999999999',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      country: 'NG'
    });
  })();

  // Login to get token
  let authToken = '';
  await test('POST /api/auth/login', async () => {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      phoneNumber: '+2349999999999',
      password: 'password123'
    });
    if (!response.data.data.accessToken) {
      throw new Error('No access token received');
    }
    authToken = response.data.data.accessToken;
  })();

  // Test authenticated endpoints
  await test('GET /api/users/me', async () => {
    await axios.get('http://localhost:3001/api/users/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  })();

  await test('POST /api/emergency/trigger', async () => {
    await axios.post('http://localhost:3002/api/emergency/trigger', {
      type: 'security',
      latitude: 6.5244,
      longitude: 3.3792
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  })();

  await test('POST /api/reports', async () => {
    await axios.post('http://localhost:3003/api/reports', {
      category: 'crime',
      title: 'Test Report',
      description: 'Test description',
      latitude: 6.5244,
      longitude: 3.3792
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  })();
}

async function main() {
  log('🚀 SafeLink Africa Setup Verification', 'cyan');
  log('=====================================\n', 'cyan');

  try {
    await verifyDatabase();
    await verifyServices();
    await verifyAPIs();

    log('\n📈 Summary:', 'cyan');
    log(`  Passed: ${passed}`, 'green');
    log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    
    if (failed === 0) {
      log('\n✅ All checks passed! System is ready.', 'green');
      process.exit(0);
    } else {
      log('\n❌ Some checks failed. Please review the errors above.', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

