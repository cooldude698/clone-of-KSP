const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../../node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js'),
  path.resolve(__dirname, '../node_modules/@zcatalyst/nextjs-plugin/dist/adapters/wrapper.js')
];

console.log('--- STARTING ZCATALYST NEXTJS PLUGIN PATCH ---');

targetFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`[Patching] Found target file: ${file}`);
    try {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('../image-optimization-function/index.mjs')) {
        content = content.replace(
          '../image-optimization-function/index.mjs',
          './index.mjs'
        );
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[Patching] Successfully patched wrapper file: ${file}`);
      } else {
        console.log(`[Patching] No matching string found in wrapper file: ${file}`);
      }
    } catch (err) {
      console.error(`[Patching] Failed to patch wrapper file ${file}:`, err.message);
    }
  } else {
    console.log(`[Patching] Target file not found at: ${file}`);
  }
});

console.log('--- PATCH SYSTEM COMPLETE ---');
