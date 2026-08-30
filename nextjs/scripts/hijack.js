const fs = require('fs');
const path = require('path');

const binDir = path.resolve(__dirname, '../node_modules/.bin');
const binFile = path.join(binDir, 'zcatalyst-nextjs');

console.log('[Hijack] Creating custom zcatalyst-nextjs binary...');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const scriptContent = `#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Hijack Wrapper] Running real zcatalyst-nextjs...');

// 1. Remove this hijacked binary to prevent recursion
const selfPath = __filename;
try {
  fs.unlinkSync(selfPath);
} catch (e) {}

// 2. Execute the real zcatalyst-nextjs
try {
  execSync('npx zcatalyst-nextjs', { stdio: 'inherit' });
} catch (err) {
  console.error('[Hijack Wrapper] Real zcatalyst-nextjs failed:', err);
  process.exit(1);
}

// 3. Run our patch script
console.log('[Hijack Wrapper] Real build complete. Running patch script...');
try {
  execSync('node ' + path.resolve(__dirname, '../../scripts/patch-opennext-configs.js'), { stdio: 'inherit' });
} catch (err) {
  console.error('[Hijack Wrapper] Patch script failed:', err);
  process.exit(1);
}

console.log('[Hijack Wrapper] Hijack wrapper completed successfully!');
process.exit(0);
`;

fs.writeFileSync(binFile, scriptContent, 'utf8');
fs.chmodSync(binFile, '755');
console.log('[Hijack] Custom binary created and marked executable.');
process.exit(0);
