/**
 * Database Migration Script
 * Runs the database initialization SQL script
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use explicit password from environment or default
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'safelink_africa',
  user: process.env.DB_USER || 'safelink',
  password: process.env.DB_PASSWORD || 'safelink_dev_password',
};

console.log('Database Configuration:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Password: ${dbConfig.password ? '***' : 'NOT SET'}`);
console.log('');

const db = new Pool(dbConfig);

async function migrate() {
  let client;
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection first
    console.log('Testing database connection...');
    client = await db.connect();
    await client.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    client.release();
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'init-db.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found: ${sqlFile}`);
    }
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    console.log('Executing migration script...');
    await db.query(sql);
    
    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - users');
    console.log('  - emergency_contacts');
    console.log('  - emergency_alerts');
    console.log('  - emergency_responders');
    console.log('  - incident_reports');
    console.log('  - transport_trips');
    console.log('  - notifications');
    console.log('  - iot_devices');
    console.log('');
    console.log('Extensions enabled:');
    console.log('  - uuid-ossp');
    console.log('  - postgis');
    
    process.exit(0);
  } catch (error) {
    if (client) {
      client.release();
    }
    
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === '28P01') {
      console.error('');
      console.error('🔐 Password authentication failed!');
      console.error('');
      console.error('This usually means:');
      console.error('  1. The PostgreSQL container was created with a different password');
      console.error('  2. The .env file has the wrong password');
      console.error('');
      console.error('🔧 To fix this, run:');
      console.error('  npm run reset:db');
      console.error('');
      console.error('This will:');
      console.error('  - Create/update .env file with correct password');
      console.error('  - Recreate PostgreSQL container with correct password');
      console.error('  - Wait for database to be ready');
      console.error('');
      console.error('Then run: npm run migrate');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('🔌 Connection refused!');
      console.error('');
      console.error('Make sure PostgreSQL is running:');
      console.error('  docker-compose up -d postgres');
      console.error('  Wait 15-20 seconds for it to start');
    } else if (error.message.includes('SQL file not found')) {
      console.error('');
      console.error('📄 SQL file not found!');
      console.error('Make sure scripts/init-db.sql exists');
    }
    
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
