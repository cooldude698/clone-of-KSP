import fs from 'fs';
import path from 'path';

// Hook into process exit to delete heavy unused functions from .open-next output directory
process.on('exit', () => {
  try {
    const paths = [
      path.join(process.cwd(), '.open-next'),
      path.join(process.cwd(), 'nextjs', '.open-next')
    ];
    for (const openNextDir of paths) {
      if (fs.existsSync(openNextDir)) {
        const targets = [
          'image-optimization-function',
          'warmer-function',
          'revalidation-function'
        ];
        for (const target of targets) {
          const targetPath = path.join(openNextDir, target);
          if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
            console.log(`[Slate Hook] Purged ${target} successfully from ${openNextDir}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Slate Hook] Failed to clean .open-next:', err);
  }
});

const config = {
  default: {
    minify: true,
  },
};

export default config;
