const fs = require('fs');
const path = require('path');

const nextDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(nextDir, '.next', 'standalone');
const staticSrc = path.join(nextDir, '.next', 'static');
const publicSrc = path.join(nextDir, 'public');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[AppSail Asset Sync] Checking standalone directory at:', standaloneDir);

if (fs.existsSync(standaloneDir)) {
  // 1. Direct standalone path
  const directStaticDest = path.join(standaloneDir, '.next', 'static');
  const directPublicDest = path.join(standaloneDir, 'public');

  if (fs.existsSync(staticSrc)) {
    console.log('[AppSail Asset Sync] Copying .next/static -> .next/standalone/.next/static...');
    copyDirRecursive(staticSrc, directStaticDest);
  }

  if (fs.existsSync(publicSrc)) {
    console.log('[AppSail Asset Sync] Copying public/ -> .next/standalone/public/ ...');
    copyDirRecursive(publicSrc, directPublicDest);
  }

  // 2. Nested standalone path (if Next.js creates .next/standalone/nextjs)
  const nestedNextjsDir = path.join(standaloneDir, 'nextjs');
  if (fs.existsSync(nestedNextjsDir)) {
    const nestedStaticDest = path.join(nestedNextjsDir, '.next', 'static');
    const nestedPublicDest = path.join(nestedNextjsDir, 'public');
    
    if (fs.existsSync(staticSrc)) {
      console.log('[AppSail Asset Sync] Copying .next/static -> .next/standalone/nextjs/.next/static...');
      copyDirRecursive(staticSrc, nestedStaticDest);
    }
    if (fs.existsSync(publicSrc)) {
      console.log('[AppSail Asset Sync] Copying public/ -> .next/standalone/nextjs/public/ ...');
      copyDirRecursive(publicSrc, nestedPublicDest);
    }
  }

  console.log('[AppSail Asset Sync] ✓ Static and public assets successfully synchronized for standalone server.');
} else {
  console.log('[AppSail Asset Sync] Standalone directory not found, skipping sync.');
}
