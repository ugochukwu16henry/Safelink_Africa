/**
 * SafeLink Africa — Reports service integration tests
 * Run after build: npm test
 * Starts the server in-process for reliability.
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

    // Create report
    const create = await request(port, 'POST', '/reports', {
      type: 'safety',
      description: 'Unlit street near market',
      latitude: 6.5244,
      longitude: 3.3792,
      reporterId: 'user-1',
    });
    if (create.status !== 201 || !create.body?.id || create.body?.status !== 'pending') {
      throw new Error('Create failed: ' + JSON.stringify(create));
    }
    const reportId = create.body.id;
    console.log('✓ POST /reports', reportId);

    // List reports
    const list = await request(port, 'GET', '/reports');
    if (list.status !== 200 || !Array.isArray(list.body?.reports)) {
      throw new Error('GET /reports list failed: ' + JSON.stringify(list));
    }
    if (list.body.reports.length < 1 || list.body.reports[0].id !== reportId) {
      throw new Error('Expected at least one report in list: ' + JSON.stringify(list.body));
    }
    console.log('✓ GET /reports (list)');

    // Get report
    const getReport = await request(port, 'GET', '/reports/' + reportId);
    if (getReport.status !== 200 || getReport.body?.id !== reportId) {
      throw new Error('GET report failed: ' + JSON.stringify(getReport));
    }
    console.log('✓ GET /reports/:id');

    // Update status
    const patch = await request(port, 'PATCH', '/reports/' + reportId, { status: 'reviewed' });
    if (patch.status !== 200 || patch.body?.status !== 'reviewed') {
      throw new Error('PATCH failed: ' + JSON.stringify(patch));
    }
    console.log('✓ PATCH /reports/:id (status)');

    // Bad create (missing description)
    const badCreate = await request(port, 'POST', '/reports', {
      type: 'safety',
      latitude: 6.52,
      longitude: 3.38,
    });
    if (badCreate.status !== 400) {
      throw new Error('Expected 400 for bad create: ' + badCreate.status);
    }
    console.log('✓ POST /reports validation');

    // 404 get
    const notFound = await request(port, 'GET', '/reports/00000000-0000-0000-0000-000000000000');
    if (notFound.status !== 404) {
      throw new Error('Expected 404 for unknown id: ' + notFound.status);
    }
    console.log('✓ GET /reports/:id 404');

    console.log('\nAll reports service tests passed.');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
