/**
 * SafeLink Africa — Auth service health check test
 * Run after build: node test/health.test.js
 * Uses in-process server (no spawn) for reliability on Windows.
 */

const http = require('http');
const path = require('path');

function request(port, pathName) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${pathName}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  const { app } = require(path.join(__dirname, '..', 'dist', 'index.js'));
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const result = await request(port, '/health');
    if (result.status !== 200 || result.body?.status !== 'ok') {
      throw new Error('Health check failed: ' + JSON.stringify(result));
    }
    console.log('Auth health check passed:', result.body);
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
