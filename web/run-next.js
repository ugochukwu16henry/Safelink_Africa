/**
 * Run Next.js CLI from web folder.
 * Resolves 'next' from web/node_modules or repo root node_modules (workspace hoisting).
 */
const path = require('path');
const { spawn } = require('child_process');

let nextBin;
try {
  const nextPkg = require.resolve('next/package.json', { paths: [__dirname, path.join(__dirname, '..')] });
  nextBin = path.join(path.dirname(nextPkg), 'dist', 'bin', 'next');
} catch {
  console.error('Next.js not found. Run "npm install" from the repo root or from the web folder.');
  process.exit(1);
}

const args = process.argv.slice(2);
const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, PORT: process.env.PORT || '3000' },
});
child.on('exit', (code) => process.exit(code ?? 0));
