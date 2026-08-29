const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, 'nextjs');
const rootNext = path.join(rootDir, '.next');
const standaloneNext = path.join(rootNext, 'standalone', '.next');

console.log('--- 0. Checking dependencies in /nextjs ---');
const tailwindPath = path.join(nextDir, 'node_modules', 'tailwindcss');
const lucidePath = path.join(nextDir, 'node_modules', 'lucide-react');
if (!fs.existsSync(tailwindPath) || !fs.existsSync(lucidePath)) {
  console.log('Installing dependencies inside /nextjs...');
  execSync('npm install --legacy-peer-deps', { cwd: nextDir, stdio: 'inherit' });
}

console.log('--- 1. Building Next.js inside /nextjs ---');
execSync('npm run build', { cwd: nextDir, stdio: 'inherit' });

console.log('--- 2. Syncing .next to Root ---');
if (fs.existsSync(rootNext)) {
  fs.rmSync(rootNext, { recursive: true, force: true });
}
fs.mkdirSync(rootNext, { recursive: true });
fs.mkdirSync(standaloneNext, { recursive: true });

// Copy all items from nextjs/.next to root .next and standalone (excluding cache and standalone)
const nextItems = fs.readdirSync(path.join(nextDir, '.next'));
for (const item of nextItems) {
  if (item === 'cache' || item === 'standalone') continue;
  const src = path.join(nextDir, '.next', item);
  const destRoot = path.join(rootNext, item);
  const destStandalone = path.join(standaloneNext, item);
  fs.cpSync(src, destRoot, { recursive: true });
  fs.cpSync(src, destStandalone, { recursive: true });
}

console.log('--- 3. Ensuring OpenNext Required Manifests & BUILD_ID ---');
const buildId = Date.now().toString();

// 1. BUILD_ID
const buildIdPaths = [
  path.join(rootNext, 'BUILD_ID'),
  path.join(standaloneNext, 'BUILD_ID'),
  path.join(nextDir, '.next', 'BUILD_ID')
];
for (const p of buildIdPaths) {
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, buildId, 'utf-8');
  }
}

// 2. server/pages-manifest.json & app-paths-manifest.json
const nextStandalone = path.join(nextDir, '.next', 'standalone', '.next');
const serverDirs = [
  path.join(rootNext, 'server'),
  path.join(standaloneNext, 'server'),
  path.join(nextDir, '.next', 'server'),
  path.join(nextStandalone, 'server')
];
for (const sDir of serverDirs) {
  if (!fs.existsSync(sDir)) fs.mkdirSync(sDir, { recursive: true });
  const pm = path.join(sDir, 'pages-manifest.json');
  if (!fs.existsSync(pm)) fs.writeFileSync(pm, '{}', 'utf-8');
}

// 3. images-manifest.json
const imagesManifestContent = JSON.stringify({
  version: 1,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    path: '/_next/image',
    loader: 'default'
  }
}, null, 2);

for (const target of [rootNext, standaloneNext]) {
  const imPath = path.join(target, 'images-manifest.json');
  if (!fs.existsSync(imPath)) fs.writeFileSync(imPath, imagesManifestContent, 'utf-8');
}

// 4. required-server-files.json
const reqServerFiles = JSON.stringify({
  version: 1,
  config: {
    basePath: '',
    distDir: '.next'
  },
  files: [],
  ignore: []
}, null, 2);

for (const target of [rootNext, standaloneNext]) {
  const rsPath = path.join(target, 'required-server-files.json');
  if (!fs.existsSync(rsPath)) fs.writeFileSync(rsPath, reqServerFiles, 'utf-8');
}

// 5. Sync public directory into standalone/nextjs/public (Next.js standalone requirement)
const rootPublic = path.join(rootDir, 'public');
const nextPublic = path.join(nextDir, 'public');
// The ACTUAL standalone server.js lives at nextjs/.next/standalone/nextjs/
const standalonePkg = path.join(nextDir, '.next', 'standalone', 'nextjs');
const standalonePublic = path.join(standalonePkg, 'public');
const standaloneStatic = path.join(standalonePkg, '.next', 'static');
const nextStatic = path.join(nextDir, '.next', 'static');

// Copy public → standalone/nextjs/public
if (fs.existsSync(nextPublic)) {
  if (!fs.existsSync(rootPublic)) fs.mkdirSync(rootPublic, { recursive: true });
  fs.cpSync(nextPublic, rootPublic, { recursive: true });
  fs.cpSync(nextPublic, standalonePublic, { recursive: true });
  console.log('  ✔ public copied to standalone/nextjs/public');
}

// Copy .next/static → standalone/nextjs/.next/static (required for CSS/JS assets)
if (fs.existsSync(nextStatic)) {
  if (fs.existsSync(standaloneStatic)) {
    fs.rmSync(standaloneStatic, { recursive: true, force: true });
  }
  fs.cpSync(nextStatic, standaloneStatic, { recursive: true });
  console.log('  ✔ .next/static copied to standalone/nextjs/.next/static');
}

// 6. Sync root config files for Catalyst tools
const configs = ['postcss.config.mjs', 'tailwind.config.js', 'tsconfig.json', 'jsconfig.json', 'next.config.mjs'];
for (const cfg of configs) {
  const src = path.join(nextDir, cfg);
  const dest = path.join(rootDir, cfg);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
}

// 7. Clean caches, traces, and source maps to ensure lean zip packaging
const caches = [
  path.join(rootNext, 'cache'),
  path.join(standaloneNext, 'cache'),
  path.join(nextDir, '.next', 'cache'),
  path.join(rootNext, 'trace'),
  path.join(standaloneNext, 'trace')
];
for (const c of caches) {
  if (fs.existsSync(c)) {
    fs.rmSync(c, { recursive: true, force: true });
  }
}

function removeSourceMaps(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeSourceMaps(fullPath);
    } else if (entry.name.endsWith('.map')) {
      fs.unlinkSync(fullPath);
    }
  }
}
removeSourceMaps(rootNext);
removeSourceMaps(standaloneNext);

console.log('--- Slate Build Prepared Successfully with all OpenNext Manifests ---');

// 8. Create Catalyst AppSail port bridge (maps X_ZOHO_CATALYST_LISTEN_PORT → PORT)
const standalonePkgDir = path.join(nextDir, '.next', 'standalone', 'nextjs');
const catalystStartPath = path.join(standalonePkgDir, 'catalyst-start.js');
const catalystStartContent = `// Catalyst AppSail port bridge — maps X_ZOHO_CATALYST_LISTEN_PORT → PORT
// for the auto-generated Next.js standalone server.js
if (process.env.X_ZOHO_CATALYST_LISTEN_PORT) {
  process.env.PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;
}
if (!process.env.HOSTNAME) {
  process.env.HOSTNAME = '0.0.0.0';
}
console.log('[Catalyst] Starting on port:', process.env.PORT || 3000);
require('./server.js');
`;
fs.writeFileSync(catalystStartPath, catalystStartContent, 'utf-8');
console.log('  ✔ catalyst-start.js (port bridge) written to standalone/nextjs');

// 9. Patch hardcoded local machine paths in standalone outputs → /home/runner
//    (Catalyst containers use /home/runner as the working directory)
const LOCAL_MACHINE_PATH = rootDir; // e.g. /Users/.../kspdatathon2026-main
const CATALYST_RUNTIME_PATH = '/home/runner';

function patchFilePaths(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes(LOCAL_MACHINE_PATH)) {
    content = content.split(LOCAL_MACHINE_PATH).join(CATALYST_RUNTIME_PATH);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✔ Patched local path in ${path.basename(filePath)}`);
  }
}

patchFilePaths(path.join(standalonePkgDir, 'server.js'));
patchFilePaths(path.join(standalonePkgDir, '.next', 'required-server-files.json'));

console.log('--- All done! AppSail-ready standalone build complete ---');
