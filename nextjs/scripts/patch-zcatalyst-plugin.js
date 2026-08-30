const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../../node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'),
  path.resolve(__dirname, '../node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'),
  '/catalyst/kspdatathon2026/node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'
];

console.log('--- STARTING GLOBAL REGEX ZCATALYST NEXTJS PLUGIN PATCH ---');

targetFiles.forEach((file) => {
  console.log(`[Patching] Checking path: ${file}`);
  if (fs.existsSync(file)) {
    console.log(`[Patching] Target file EXISTS: ${file}`);
    try {
      let content = fs.readFileSync(file, 'utf8');
      console.log(`[Patching] Original file content of ${file}:\n${content}`);
      
      let modified = false;
      
      // Global regex replace to update ALL occurrences
      if (content.includes('../image-optimization-function/index.mjs')) {
        content = content.replace(
          /\.\.\/image-optimization-function\/index\.mjs/g,
          './index.mjs'
        );
        modified = true;
      }
      
      if (content.includes('../revalidation-function/index.mjs')) {
        content = content.replace(
          /\.\.\/revalidation-function\/index\.mjs/g,
          './index.mjs'
        );
        modified = true;
      }
      
      if (content.includes('../warmer-function/index.mjs')) {
        content = content.replace(
          /\.\.\/warmer-function\/index\.mjs/g,
          './index.mjs'
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[Patching] Successfully updated wrapper file!`);
        
        // Print updated content to verify
        const updatedContent = fs.readFileSync(file, 'utf8');
        console.log(`[Patching] Verified patched content:\n${updatedContent}`);
      } else {
        console.log(`[Patching] No matching paths found in wrapper file.`);
      }
    } catch (err) {
      console.error(`[Patching] Error handling file ${file}:`, err.message);
    }
  } else {
    console.log(`[Patching] Target file does NOT exist at: ${file}`);
  }
});

console.log('--- PATCH SYSTEM COMPLETE ---');

// CLEANUP: Terminate background file watcher PID so the build process can exit immediately
try {
  const pidFile = path.resolve(__dirname, '../../.watcher.pid');
  if (fs.existsSync(pidFile)) {
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
    console.log(`[Cleanup] Terminating background watcher process (PID: ${pid})...`);
    process.kill(pid, 'SIGTERM');
    fs.unlinkSync(pidFile);
    console.log('[Cleanup] Background watcher terminated successfully!');
  } else {
    console.log('[Cleanup] No background watcher PID file found.');
  }
} catch (err) {
  console.log('[Cleanup] Warning during background watcher termination:', err.message);
}

process.exit(0);
