/**
 * SafeLink Africa — Auth service register/login/me tests
 * Run after build: node test/auth.test.js
 */

const http = require('http');
const path = require('path');

function request(port, method, pathName, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      path: pathName,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
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
    // Register
    const reg = await request(port, 'POST', '/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    if (reg.status !== 201 || !reg.body?.user?.id || !reg.body?.token) {
      throw new Error('Register failed: ' + JSON.stringify(reg));
    }
    const token = reg.body.token;
    const userId = reg.body.user.id;
    console.log('✓ POST /auth/register');

    // Login
    const login = await request(port, 'POST', '/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    if (login.status !== 200 || !login.body?.token) {
      throw new Error('Login failed: ' + JSON.stringify(login));
    }
    console.log('✓ POST /auth/login');

    // GET /auth/me
    const me = await request(port, 'GET', '/auth/me', null, token);
    if (me.status !== 200 || me.body?.user?.id !== userId) {
      throw new Error('GET /auth/me failed: ' + JSON.stringify(me));
    }
    console.log('✓ GET /auth/me');

    // Duplicate email
    const dup = await request(port, 'POST', '/auth/register', {
      email: 'test@example.com',
      password: 'other123',
      name: 'Other',
    });
    if (dup.status !== 409) {
      throw new Error('Expected 409 for duplicate email: ' + dup.status);
    }
    console.log('✓ POST /auth/register duplicate (409)');

    // Wrong password
    const badLogin = await request(port, 'POST', '/auth/login', {
      email: 'test@example.com',
      password: 'wrong',
    });
    if (badLogin.status !== 401) {
      throw new Error('Expected 401 for wrong password: ' + badLogin.status);
    }
    console.log('✓ POST /auth/login wrong password (401)');

    console.log('\nAll auth service tests passed.');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
