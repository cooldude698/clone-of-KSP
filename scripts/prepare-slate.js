const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, 'nextjs');

console.log('--- 1. Building Next.js inside /nextjs ---');
execSync('npm run build', { cwd: nextDir, stdio: 'inherit' });

console.log('--- All done! Clean build complete ---');
process.exit(0);
