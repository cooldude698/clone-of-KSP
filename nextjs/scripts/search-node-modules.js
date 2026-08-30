const fs = require('fs');
const path = require('path');

function search(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      search(file);
    } else {
      if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('image-optimization-function')) {
            console.log(`[FOUND MATCH] File: ${file}`);
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes('image-optimization-function')) {
                console.log(`  Line ${index + 1}: ${line.trim()}`);
              }
            });
          }
        } catch (e) {}
      }
    }
  });
}

console.log('--- STARTING NODE_MODULES SEARCH FOR image-optimization-function ---');
const nodeModulesPath = path.resolve(__dirname, '../../node_modules');
console.log('Searching in:', nodeModulesPath);
search(nodeModulesPath);
console.log('--- SEARCH COMPLETE ---');
