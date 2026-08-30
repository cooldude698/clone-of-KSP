const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 3000;
process.env.PORT = String(port);
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';

console.log(`[AppSail] Launching Next.js production server on 0.0.0.0:${port}...`);

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const directStandaloneDir = path.join(__dirname, '.next', 'standalone');
const nestedStandaloneDir = path.join(directStandaloneDir, 'nextjs');

let targetServer = null;
let targetDir = null;

if (fs.existsSync(path.join(directStandaloneDir, 'server.js'))) {
  targetServer = path.join(directStandaloneDir, 'server.js');
  targetDir = directStandaloneDir;
} else if (fs.existsSync(path.join(nestedStandaloneDir, 'server.js'))) {
  targetServer = path.join(nestedStandaloneDir, 'server.js');
  targetDir = nestedStandaloneDir;
}

if (targetServer && targetDir) {
  // Ensure .next/static and public are present in target standalone directory
  const srcStatic = path.join(__dirname, '.next', 'static');
  const destStatic = path.join(targetDir, '.next', 'static');
  if (fs.existsSync(srcStatic) && !fs.existsSync(destStatic)) {
    console.log(`[AppSail] Syncing .next/static into ${destStatic}...`);
    copyDirSync(srcStatic, destStatic);
  }

  const srcPublic = path.join(__dirname, 'public');
  const destPublic = path.join(targetDir, 'public');
  if (fs.existsSync(srcPublic) && !fs.existsSync(destPublic)) {
    console.log(`[AppSail] Syncing public assets into ${destPublic}...`);
    copyDirSync(srcPublic, destPublic);
  }

  console.log(`[AppSail] Starting standalone server from ${targetServer} on http://0.0.0.0:${port}...`);
  const child = spawn(process.execPath, [targetServer], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: '0.0.0.0',
      NODE_ENV: 'production'
    },
    cwd: targetDir
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  console.log(`[AppSail] Starting standard next start on http://0.0.0.0:${port}...`);
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
}
