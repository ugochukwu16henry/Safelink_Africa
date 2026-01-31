/**
 * SafeLink Africa — Auth service health check test
 * Run after build: node test/health.test.js
 */

const { spawn } = require('child_process');
const http = require('http');

function request(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
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
  const port = 4001;
  const server = spawn('node', ['dist/index.js'], {
    cwd: __dirname + '/..',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port) },
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));
  const result = await request(port, '/health');
  server.kill('SIGTERM');

  if (result.status !== 200 || result.body.status !== 'ok') {
    console.error('Health check failed:', result);
    process.exit(1);
  }
  console.log('Auth health check passed:', result.body);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
