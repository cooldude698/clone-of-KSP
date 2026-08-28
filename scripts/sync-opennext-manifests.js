const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, 'nextjs');

for (const base of [rootDir, nextDir]) {
  const dotNext = path.join(base, '.next');
  if (!fs.existsSync(dotNext)) continue;

  const targetServerDirs = [
    path.join(dotNext, 'server'),
    path.join(dotNext, 'standalone', '.next', 'server'),
    path.join(dotNext, 'standalone', 'nextjs', '.next', 'server'),
    path.join(dotNext, 'standalone', 'kspdatathon2026', 'nextjs', '.next', 'server')
  ];

  for (const dir of targetServerDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

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
}
