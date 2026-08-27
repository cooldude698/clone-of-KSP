const fs = require('fs');
const path = require('path');

const apiDir = path.resolve(__dirname, '../nextjs/src/app/api');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (f === 'route.js' || f === 'route.ts') {
      let content = fs.readFileSync(p, 'utf-8');
      if (content.includes('require(') && content.includes('/functions/')) {
        console.log('Refactoring route:', p);
        
        // Add import if not present
        if (!content.includes('loadCatalystFunction')) {
          content = "import { loadCatalystFunction } from '@/lib/dynamic-fn-loader';\n" + content;
        }

        // Replace require('../...functions/{name}/index.js') with loadCatalystFunction('{name}')
        content = content.replace(/require\(['"][^'"]*functions\/([a-zA-Z0-9_-]+)\/index\.js['"]\)/g, "loadCatalystFunction('$1')");
        
        fs.writeFileSync(p, content, 'utf-8');
      }
    }
  }
}

walk(apiDir);
console.log('All API routes refactored with dynamic-fn-loader.');
