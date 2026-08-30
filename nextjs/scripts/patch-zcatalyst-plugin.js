const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../../node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'),
  path.resolve(__dirname, '../node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'),
  '/catalyst/kspdatathon2026/node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'
];

console.log('--- STARTING VERBOSE ZCATALYST NEXTJS PLUGIN PATCH ---');

targetFiles.forEach((file) => {
  console.log(`[Patching] Checking path: ${file}`);
  if (fs.existsSync(file)) {
    console.log(`[Patching] Target file EXISTS: ${file}`);
    try {
      let content = fs.readFileSync(file, 'utf8');
      console.log(`[Patching] Current file content of ${file}:\n${content}`);
      
      if (content.includes('../image-optimization-function/index.mjs')) {
        content = content.replace(
          '../image-optimization-function/index.mjs',
          './index.mjs'
        );
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[Patching] Successfully updated wrapper file!`);
        
        // Print updated content to verify
        const updatedContent = fs.readFileSync(file, 'utf8');
        console.log(`[Patching] Verified patched content:\n${updatedContent}`);
      } else {
        console.log(`[Patching] String '../image-optimization-function/index.mjs' NOT found in content.`);
      }
    } catch (err) {
      console.error(`[Patching] Error handling file ${file}:`, err.message);
    }
  } else {
    console.log(`[Patching] Target file does NOT exist at: ${file}`);
  }
});

console.log('--- PATCH SYSTEM COMPLETE ---');
process.exit(0);
