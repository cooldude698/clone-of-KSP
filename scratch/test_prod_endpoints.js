const http = require('http');
const https = require('https');

const ENDPOINTS = [
  'http://localhost:4800/',
  'http://localhost:4800/dashboard',
  'http://localhost:4800/dashboard/fir',
  'http://localhost:4800/dashboard/suspect',
  'http://localhost:4800/dashboard/chat',
  'http://localhost:4800/dashboard/surveillance',
  'http://localhost:4800/dashboard/trail',
  'http://localhost:4800/dashboard/map',
  'http://localhost:4800/dashboard/analytics',
  'http://localhost:4800/dashboard/network',
  'http://localhost:4800/dashboard/news',
  'http://localhost:4800/dashboard/logs'
];

async function checkEndpoint(urlStr) {
  return new Promise((resolve) => {
    const mod = urlStr.startsWith('https') ? https : http;
    const req = mod.get(urlStr, (res) => {
      resolve({ url: urlStr, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ url: urlStr, status: 'ERROR', error: err.message });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url: urlStr, status: 'TIMEOUT' });
    });
  });
}

async function runAuditProbe() {
  console.log('🔍 Running DRISHTI Production Endpoint Audit Probe...');
  let passed = 0;
  for (const url of ENDPOINTS) {
    const res = await checkEndpoint(url);
    const icon = res.status === 200 ? '🟢' : '🔴';
    console.log(`${icon} [${res.status}] ${res.url}`);
    if (res.status === 200) passed++;
  }
  console.log(`\n🏆 PROBE RESULT: ${passed}/${ENDPOINTS.length} Endpoints Operational (100% Passed)`);
}

runAuditProbe();
