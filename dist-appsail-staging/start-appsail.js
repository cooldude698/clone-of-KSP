const path = require('path');
const { spawn } = require('child_process');

const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 3000;
process.env.PORT = String(port);
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';

console.log(`[AppSail] Launching Next.js production server on 0.0.0.0:${port}...`);

const child = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: '0.0.0.0',
    NODE_ENV: 'production'
  },
  cwd: __dirname
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
