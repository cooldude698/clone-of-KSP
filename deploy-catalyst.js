const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Catalyst Optimized Deployer ===');

const projectRoot = __dirname;
const parentRoot = path.join(__dirname, '..');

const nodeModulesPath = path.join(projectRoot, 'nextjs', 'node_modules');
const nextCachePath = path.join(projectRoot, 'nextjs', '.next');
const tempNodeModules = path.join(parentRoot, '_node_modules_temp');

// Always just DELETE .next (Catalyst cloud builds its own)
// Only STASH node_modules so we can restore them for local dev

function safeDelete(p) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`🗑  Removed ${path.relative(projectRoot, p)}`);
    }
  } catch (e) {
    console.warn(`Warning: Could not remove ${p}:`, e.message);
  }
}

function safeMove(src, dst) {
  try {
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      fs.renameSync(src, dst);
      console.log(`⚡ Stashed ${path.relative(projectRoot, src)}`);
      return true;
    }
  } catch (e) {
    console.warn(`Warning: Could not stash ${src}:`, e.message);
  }
  return false;
}

let movedNodeModules = false;

try {
  // Delete .next entirely (cloud rebuilds it)
  safeDelete(nextCachePath);

  // Stash node_modules outside repo
  movedNodeModules = safeMove(nodeModulesPath, tempNodeModules);

  console.log('🚀 Executing catalyst deploy --non-interactive...');
  execSync('catalyst deploy --non-interactive', { stdio: 'inherit', cwd: projectRoot });
  console.log('\n✅ Catalyst deployment complete!');
} catch (err) {
  console.error('\n❌ Deployment error:', err.message);
} finally {
  // Restore node_modules
  if (movedNodeModules && fs.existsSync(tempNodeModules) && !fs.existsSync(nodeModulesPath)) {
    try {
      fs.renameSync(tempNodeModules, nodeModulesPath);
      console.log('🔄 Restored nextjs/node_modules');
    } catch (e) {
      console.log('Note: Could not restore node_modules automatically. Run: npm install in nextjs/');
    }
  }
  console.log('🎉 Done!');
}
