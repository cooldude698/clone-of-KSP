const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nextjsDir = path.join(rootDir, 'nextjs');
const stagingDir = path.join(rootDir, 'dist-appsail-staging');
const zipOutput = path.join(rootDir, 'appsail-deploy.zip');

console.log('--- 1. Cleaning old staging files ---');
fs.rmSync(stagingDir, { recursive: true, force: true });
fs.rmSync(zipOutput, { force: true });
fs.mkdirSync(stagingDir, { recursive: true });

console.log('--- 2. Copying essential AppSail deployment files ---');
const itemsToCopy = [
  'server.js',
  'start-appsail.js',
  'app-config.json',
  'package.json',
  'next.config.mjs',
  'public',
  'src',
  '.next'
];

for (const item of itemsToCopy) {
  const srcPath = path.join(nextjsDir, item);
  const destPath = path.join(stagingDir, item);
  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${item}...`);
    fs.cpSync(srcPath, destPath, { recursive: true });
  }
}

// Clean cache inside staging .next
const cacheDir = path.join(stagingDir, '.next', 'cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('Removed .next/cache from staging.');
}

console.log('--- 3. Creating appsail-deploy.zip using fast native archiver ---');
try {
  execSync(`tar.exe -a -c -f "${zipOutput}" -C "${stagingDir}" .`, { stdio: 'inherit' });
  const stats = fs.statSync(zipOutput);
  console.log(`\n🎉 Success! appsail-deploy.zip created (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Location: ${zipOutput}`);
} catch (err) {
  console.error('Error creating zip archive:', err);
} finally {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
