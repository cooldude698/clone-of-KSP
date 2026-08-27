const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, 'nextjs');
const rootNext = path.join(rootDir, '.next');
const standaloneNext = path.join(rootNext, 'standalone', '.next');

console.log('--- 1. Building Next.js inside /nextjs ---');
execSync('npm run build', { cwd: nextDir, stdio: 'inherit' });

console.log('--- 2. Syncing .next to Root ---');
if (fs.existsSync(rootNext)) {
  fs.rmSync(rootNext, { recursive: true, force: true });
}
fs.mkdirSync(rootNext, { recursive: true });

// Copy all items from nextjs/.next to root .next (excluding cache and standalone)
const nextItems = fs.readdirSync(path.join(nextDir, '.next'));
for (const item of nextItems) {
  if (item === 'cache' || item === 'standalone') continue;
  const src = path.join(nextDir, '.next', item);
  const dest = path.join(rootNext, item);
  fs.cpSync(src, dest, { recursive: true });
}

console.log('--- 3. Formatting .next/standalone for Catalyst OpenNext ---');
fs.mkdirSync(standaloneNext, { recursive: true });

// Copy server and static manifests to .next/standalone/.next
const requiredForOpenNext = ['server', 'static', 'app-build-manifest.json', 'build-manifest.json', 'prerender-manifest.json', 'routes-manifest.json', 'react-loadable-manifest.json'];
for (const item of requiredForOpenNext) {
  const src = path.join(rootNext, item);
  const dest = path.join(standaloneNext, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

// Ensure pages-manifest.json exists in .next/standalone/.next/server
const pagesManifestPath = path.join(standaloneNext, 'server', 'pages-manifest.json');
if (!fs.existsSync(pagesManifestPath)) {
  fs.mkdirSync(path.join(standaloneNext, 'server'), { recursive: true });
  fs.writeFileSync(pagesManifestPath, '{}', 'utf-8');
}

// Sync public directory
const rootPublic = path.join(rootDir, 'public');
const nextPublic = path.join(nextDir, 'public');
if (fs.existsSync(nextPublic)) {
  if (!fs.existsSync(rootPublic)) fs.mkdirSync(rootPublic, { recursive: true });
  fs.cpSync(nextPublic, rootPublic, { recursive: true });
}

console.log('--- Slate Build Prepared Successfully ---');
