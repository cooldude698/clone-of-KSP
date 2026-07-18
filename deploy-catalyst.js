const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Catalyst Slate Fast Deployer ===');

const projectRoot = __dirname;
const parentRoot = path.join(__dirname, '..');

const nodeModulesPath = path.join(projectRoot, 'nextjs', 'node_modules');
const nextCachePath = path.join(projectRoot, 'nextjs', '.next');
const tempNodeModules = path.join(parentRoot, '_node_modules_temp');
const tempNextCache = path.join(parentRoot, '_next_temp');

try {
  if (fs.existsSync(nodeModulesPath) && !fs.existsSync(tempNodeModules)) {
    console.log('⚡ Stashing nextjs/node_modules to avoid HTTP 413 upload limit...');
    fs.renameSync(nodeModulesPath, tempNodeModules);
  }
  if (fs.existsSync(nextCachePath) && !fs.existsSync(tempNextCache)) {
    console.log('⚡ Stashing nextjs/.next cache...');
    fs.renameSync(nextCachePath, tempNextCache);
  }

  console.log('🚀 Executing catalyst deploy --only slate:nextjs...');
  execSync('catalyst deploy --only slate:nextjs', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Catalyst Slate deployment initiated successfully!');
} catch (err) {
  console.error('❌ Deployment status:', err.message);
} finally {
  try {
    if (fs.existsSync(tempNodeModules) && !fs.existsSync(nodeModulesPath)) {
      console.log('🔄 Restoring nextjs/node_modules...');
      fs.renameSync(tempNodeModules, nodeModulesPath);
    }
  } catch (e) {
    console.log('Note: node_modules restore skipped.');
  }

  try {
    if (fs.existsSync(tempNextCache)) {
      fs.rmSync(tempNextCache, { recursive: true, force: true });
    }
  } catch (e) {}

  console.log('🎉 Done!');
}
