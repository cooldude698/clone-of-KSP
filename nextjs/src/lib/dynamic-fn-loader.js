export function loadCatalystFunction(name) {
  try {
    const dynamicRequire = eval('require');
    const path = dynamicRequire('path');
    const fs = dynamicRequire('fs');
    
    // Check candidate paths for local development or Catalyst Cloud
    const candidates = [
      path.resolve(process.cwd(), '..', 'functions', name, 'index.js'),
      path.resolve(process.cwd(), 'functions', name, 'index.js'),
      path.resolve(__dirname, '..', '..', '..', '..', 'functions', name, 'index.js')
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return dynamicRequire(p);
      }
    }
  } catch (err) {
    // Dynamic loader fallback
  }
  return null;
}
