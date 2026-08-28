const fs = require('fs');
const path = require('path');

const nextDir = path.resolve(__dirname, '..');
const dotNext = path.join(nextDir, '.next');

console.log('[OpenNext Sync] Syncing manifests for Catalyst Slate across all potential standalone paths...');

// Clean cache first to keep artifacts lean
const cacheDir = path.join(dotNext, 'cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

// All target server directories where OpenNext / Catalyst plugin might search
const targetServerDirs = [
  path.join(dotNext, 'server'),
  path.join(dotNext, 'standalone', '.next', 'server'),
  path.join(dotNext, 'standalone', 'nextjs', '.next', 'server'),
  path.join(dotNext, 'standalone', 'kspdatathon2026', 'nextjs', '.next', 'server')
];

for (const dir of targetServerDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Find source pages-manifest.json and app-paths-manifest.json
const sourceServerDir = path.join(dotNext, 'server');
const filesToSync = [
  'pages-manifest.json',
  'app-paths-manifest.json',
  'middleware-manifest.json',
  'next-font-manifest.json',
  'client-reference-manifest.json',
  'server-reference-manifest.json'
];

for (const file of filesToSync) {
  const src = path.join(sourceServerDir, file);
  const content = fs.existsSync(src) ? fs.readFileSync(src, 'utf-8') : '{}';

  for (const dir of targetServerDirs) {
    const dest = path.join(dir, file);
    fs.writeFileSync(dest, content, 'utf-8');
  }
}

// Sync root manifests (BUILD_ID, images-manifest.json, required-server-files.json)
const rootManifestTargets = [
  dotNext,
  path.join(dotNext, 'standalone', '.next'),
  path.join(dotNext, 'standalone', 'nextjs', '.next')
];

for (const target of rootManifestTargets) {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const buildIdPath = path.join(target, 'BUILD_ID');
  if (!fs.existsSync(buildIdPath)) {
    fs.writeFileSync(buildIdPath, Date.now().toString(), 'utf-8');
  }

  const imPath = path.join(target, 'images-manifest.json');
  if (!fs.existsSync(imPath)) {
    fs.writeFileSync(imPath, JSON.stringify({
      version: 1,
      images: {
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        domains: [],
        path: '/_next/image',
        loader: 'default'
      }
    }, null, 2), 'utf-8');
  }

  const reqPath = path.join(target, 'required-server-files.json');
  if (!fs.existsSync(reqPath)) {
    fs.writeFileSync(reqPath, JSON.stringify({
      version: 1,
      config: { basePath: '', distDir: '.next' },
      files: [],
      ignore: []
    }, null, 2), 'utf-8');
  }
}

console.log('[OpenNext Sync] All OpenNext manifests successfully synced to all paths.');
