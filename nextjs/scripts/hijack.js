const fs = require('fs');
const path = require('path');

// We write to both the local nextjs node_modules and the root node_modules
const binDirs = [
  path.resolve(__dirname, '../node_modules/.bin'),
  path.resolve(__dirname, '../../node_modules/.bin')
];

console.log('[Hijack] Creating custom zcatalyst-nextjs binaries...');

const scriptContent = `#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Hijack Wrapper] Running real zcatalyst-nextjs...');

// 1. Remove all hijacked binaries to prevent recursion
const selfPath = __filename;
try {
  fs.unlinkSync(selfPath);
} catch (e) {}

const pathsToDelete = [
  path.join(__dirname, 'zcatalyst-nextjs'),
  path.resolve(__dirname, '../../nextjs/node_modules/.bin/zcatalyst-nextjs'),
  path.resolve(__dirname, '../../../node_modules/.bin/zcatalyst-nextjs')
];
pathsToDelete.forEach((p) => {
  try {
    fs.unlinkSync(p);
  } catch (e) {}
});

// 2. Execute the real zcatalyst-nextjs (this will now fetch from Zoho's registry or use global fallback)
try {
  execSync('npx zcatalyst-nextjs', { stdio: 'inherit' });
} catch (err) {
  console.error('[Hijack Wrapper] Real zcatalyst-nextjs failed:', err);
  process.exit(1);
}

// 3. Find and run our patch script
let patchScript = path.resolve(__dirname, '../../scripts/patch-opennext-configs.js');
if (!fs.existsSync(patchScript)) {
  patchScript = path.resolve(__dirname, '../../nextjs/scripts/patch-opennext-configs.js');
}

console.log('[Hijack Wrapper] Real build complete. Running patch script at:', patchScript);
try {
  execSync('node ' + patchScript, { stdio: 'inherit' });
} catch (err) {
  console.error('[Hijack Wrapper] Patch script failed:', err);
  process.exit(1);
}

console.log('[Hijack Wrapper] Hijack wrapper completed successfully!');
process.exit(0);
`;

binDirs.forEach((binDir) => {
  const binFile = path.join(binDir, 'zcatalyst-nextjs');
  try {
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    fs.writeFileSync(binFile, scriptContent, 'utf8');
    fs.chmodSync(binFile, '755');
    console.log(`[Hijack] Custom binary created at: ${binFile}`);
  } catch (err) {
    console.warn(`[Hijack] Failed to write binary to ${binFile}:`, err.message);
  }
});

process.exit(0);
