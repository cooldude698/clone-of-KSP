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
const serverDirs = [
  path.join(rootNext, 'server'),
  path.join(standaloneNext, 'server')
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

// 5. Sync public directory
const rootPublic = path.join(rootDir, 'public');
const standalonePublic = path.join(rootNext, 'standalone', 'public');
const nextPublic = path.join(nextDir, 'public');
if (fs.existsSync(nextPublic)) {
  if (!fs.existsSync(rootPublic)) fs.mkdirSync(rootPublic, { recursive: true });
  if (!fs.existsSync(standalonePublic)) fs.mkdirSync(standalonePublic, { recursive: true });
  fs.cpSync(nextPublic, rootPublic, { recursive: true });
  fs.cpSync(nextPublic, standalonePublic, { recursive: true });
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

// 7. Clean caches to ensure lean zip packaging
const caches = [
  path.join(rootNext, 'cache'),
  path.join(standaloneNext, 'cache'),
  path.join(nextDir, '.next', 'cache')
];
for (const c of caches) {
  if (fs.existsSync(c)) {
    fs.rmSync(c, { recursive: true, force: true });
  }
}

console.log('--- Slate Build Prepared Successfully with all OpenNext Manifests ---');

