/**
 * Database Migration Script
 * Runs the database initialization SQL script
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'safelink_africa',
  user: process.env.DB_USER || 'safelink',
  password: process.env.DB_PASSWORD || 'safelink_dev_password',
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
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
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();

