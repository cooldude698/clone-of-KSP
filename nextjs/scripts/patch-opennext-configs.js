const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('open-next.config.mjs')) {
        results.push(file);
      }
    }
  });
  return results;
}

const targetDir = path.resolve(__dirname, '..');
console.log('[Patch Config] Scanning target directory:', targetDir);
const configFiles = walk(targetDir);
console.log('[Patch Config] Found config files:', configFiles);

configFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('../image-optimization-function/index.mjs')) {
    console.log('[Patch Config] Patching:', file);
    content = content.replace(
      /["']\.\.\/image-optimization-function\/index\.mjs["']/g,
      '"./index.mjs"'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('[Patch Config] Patch successful for:', file);
  }
});
