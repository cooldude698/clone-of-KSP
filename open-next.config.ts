import fs from 'fs';
import path from 'path';

// Helper to recursively delete .bin directories
function removeBinDirs(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file === '.bin') {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`[Slate Hook] Deleted symlink directory: ${filePath}`);
      } else {
        removeBinDirs(filePath);
      }
    }
  }
}

// Hook into process exit to delete symbolic links from .open-next node_modules directories
process.on('exit', () => {
  try {
    const paths = [
      path.join(process.cwd(), '.open-next'),
      path.join(process.cwd(), 'nextjs', '.open-next')
    ];
    for (const openNextDir of paths) {
      if (fs.existsSync(openNextDir)) {
        removeBinDirs(openNextDir);
        console.log(`[Slate Hook] Cleaned up symlinks inside ${openNextDir}`);
      }
    }
  } catch (err) {
    console.error('[Slate Hook] Failed to clean symlinks:', err);
  }
});

const config = {
  default: {
    minify: true,
  },
};

export default config;
