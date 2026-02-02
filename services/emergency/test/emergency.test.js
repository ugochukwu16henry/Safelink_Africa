/**
 * SafeLink Africa — Emergency service integration tests
 * Run after build: npm test
 * Starts the server in-process (no subprocess) for reliability on Windows.
 */

const http = require('http');
const path = require('path');

function request(port, method, pathName, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      path: pathName,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  // Load app from built output (does not call listen when required)
  const { app } = require(path.join(__dirname, '..', 'dist', 'index.js'));
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // Health
    const health = await request(port, 'GET', '/health');
    if (health.status !== 200 || health.body?.status !== 'ok') {
      throw new Error('Health failed: ' + JSON.stringify(health));
    }
    console.log('✓ GET /health');

    // Trigger
    const trigger = await request(port, 'POST', '/emergency/trigger', {
      userId: 'user-1',
      latitude: 6.5244,
      longitude: 3.3792,
    });
    if (trigger.status !== 201 || !trigger.body?.id || trigger.body?.status !== 'active') {
      throw new Error('Trigger failed: ' + JSON.stringify(trigger));
    }
    const alertId = trigger.body.id;
    console.log('✓ POST /emergency/trigger', alertId);

    // Location
    const location = await request(port, 'POST', '/emergency/location', {
      alertId,
      latitude: 6.525,
      longitude: 3.38,
    });
    if (location.status !== 200 || location.body?.ok !== true) {
      throw new Error('Location failed: ' + JSON.stringify(location));
    }
    console.log('✓ POST /emergency/location');

    // List alerts
    const list = await request(port, 'GET', '/emergency');
    if (list.status !== 200 || !Array.isArray(list.body?.alerts)) {
      throw new Error('GET /emergency list failed: ' + JSON.stringify(list));
    }
    if (list.body.alerts.length < 1 || list.body.alerts[0].id !== alertId) {
      throw new Error('Expected at least one alert in list: ' + JSON.stringify(list.body));
    }
    console.log('✓ GET /emergency (list)');

    // Get alert
    const getAlert = await request(port, 'GET', '/emergency/' + alertId);
    if (getAlert.status !== 200 || getAlert.body?.alert?.id !== alertId) {
      throw new Error('GET alert failed: ' + JSON.stringify(getAlert));
    }
    if (!getAlert.body.latestLocation) throw new Error('Expected latestLocation');
    console.log('✓ GET /emergency/:id');

    // Bad trigger (missing lat)
    const badTrigger = await request(port, 'POST', '/emergency/trigger', {
      userId: 'user-2',
      longitude: 3.38,
    });
    if (badTrigger.status !== 400) {
      throw new Error('Expected 400 for bad trigger: ' + badTrigger.status);
    }
    console.log('✓ POST /emergency/trigger validation');

    console.log('\nAll emergency service tests passed.');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
