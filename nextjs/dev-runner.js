const { spawn } = require('child_process');

// Parse CLI arguments passed by Catalyst
const args = process.argv.slice(2).map(arg => {
  // If Catalyst CLI passed the literal Windows environment string on Linux,
  // resolve it to the actual env variable or default to 3001.
  if (arg === '%ZC_SLATE_PORT%') {
    return process.env.ZC_SLATE_PORT || '3001';
  }
  return arg;
});

// Run next dev with sanitized arguments
const child = spawn('npx', ['next', 'dev', ...args], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});
