const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '..');
console.log('[Watcher] Starting file watcher at:', targetDir);

function patchFile(file) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('../image-optimization-function/index.mjs')) {
      console.log('[Watcher] Patching file:', file);
      content = content.replace(
        /\.\.\/image-optimization-function\/index\.mjs/g,
        './index.mjs'
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log('[Watcher] Patch successful!');
    }
  } catch (err) {}
}

// Recursively walk and patch
setInterval(() => {
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        if (!file.includes('node_modules')) {
          walk(file);
        }
      } else {
        if (file.endsWith('open-next.config.mjs')) {
          patchFile(file);
        }
      }
    });
  }
  walk(targetDir);
}, 200);

console.log('[Watcher] Watcher is active.');
