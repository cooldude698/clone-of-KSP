const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 3000;
process.env.PORT = String(port);
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';

console.log(`[AppSail] Initializing AppSail Next.js production server on assigned port: ${port}`);

const nextDir = path.join(__dirname, '.next');
const buildManifest = path.join(nextDir, 'build-manifest.json');

// If .next production build does not exist on the container, build it automatically on startup
if (!fs.existsSync(nextDir) || !fs.existsSync(buildManifest)) {
  console.log('[AppSail] .next build directory not detected. Building Next.js application...');
  try {
    execSync('npx next build', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      cwd: __dirname
    });
    console.log('[AppSail] Next.js build completed successfully.');
  } catch (err) {
    console.error('[AppSail] Error during startup build:', err);
  }
}

console.log(`[AppSail] Launching Next.js server on 0.0.0.0:${port}...`);

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
