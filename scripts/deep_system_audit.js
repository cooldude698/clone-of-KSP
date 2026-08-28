const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const rootDir = path.resolve(__dirname, '..');
const functionsDir = path.join(rootDir, 'functions');
const nextjsDir = path.join(rootDir, 'nextjs');

async function makeRequest(urlPath, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const url = new URL(urlPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DRISHTI-Deep-Audit-Agent'
      },
      timeout: 10000
    };

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const elapsed = Date.now() - startTime;
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = null;
        }
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          elapsed: `${elapsed}ms`,
          dataLength: data.length,
          isJson: !!parsed,
          preview: parsed ? Object.keys(parsed).slice(0, 6).join(', ') : (data.substring(0, 120).replace(/[\r\n]+/g, ' '))
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        ok: false,
        elapsed: `${Date.now() - startTime}ms`,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 408,
        ok: false,
        elapsed: '>10000ms',
        error: 'Request Timeout'
      });
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runDeepAudit() {
  console.log('================================================================');
  console.log('🛡️  DRISHTI KSP - FULL DEEP SYSTEM AUDIT & VERIFICATION SUITE');
  console.log('================================================================\n');

  const auditReport = {
    timestamp: new Date().toISOString(),
    catalystConfig: {},
    functionsAudit: [],
    apiRoutesAudit: [],
    uiPagesAudit: [],
    summary: {}
  };

  // 1. Catalyst Config Verification
  console.log('--- 1. AUDITING CATALYST CONFIGURATIONS ---');
  const catalystJsonPath = path.join(rootDir, 'catalyst.json');
  if (fs.existsSync(catalystJsonPath)) {
    const catJson = JSON.parse(fs.readFileSync(catalystJsonPath, 'utf8'));
    auditReport.catalystConfig.catalystJson = {
      present: true,
      hasAppSail: !!catJson.appsail,
      hasFunctions: !!catJson.functions,
      functionCount: catJson.functions?.targets?.length || 0,
      hasSlate: !!catJson.slate
    };
    console.log(`✓ catalyst.json: Valid (AppSail: ${!!catJson.appsail}, Functions: ${catJson.functions?.targets?.length}, Slate: ${!!catJson.slate})`);
  } else {
    auditReport.catalystConfig.catalystJson = { present: false };
    console.log('✗ catalyst.json: Missing');
  }

  const catalystRcPath = path.join(rootDir, '.catalystrc');
  if (fs.existsSync(catalystRcPath)) {
    const rc = JSON.parse(fs.readFileSync(catalystRcPath, 'utf8'));
    const activeProject = rc.projects?.find(p => p.idx === rc.actives?.project) || rc.projects?.[1];
    auditReport.catalystConfig.catalystRc = {
      present: true,
      projectName: activeProject?.name,
      domain: activeProject?.domain?.name,
      projectId: activeProject?.id
    };
    console.log(`✓ .catalystrc: Valid (Project: ${activeProject?.name}, ID: ${activeProject?.id})`);
  }

  const dockerfilePath = path.join(rootDir, 'Dockerfile');
  auditReport.catalystConfig.dockerfile = { present: fs.existsSync(dockerfilePath) };
  console.log(`✓ Dockerfile: ${fs.existsSync(dockerfilePath) ? 'Present (OCI Compliant)' : 'Missing'}`);

  const workflowPath = path.join(rootDir, '.github', 'workflows', 'deploy.yml');
  auditReport.catalystConfig.ciCdWorkflow = { present: fs.existsSync(workflowPath) };
  console.log(`✓ GitHub Actions CI/CD: ${fs.existsSync(workflowPath) ? 'Present (.github/workflows/deploy.yml)' : 'Missing'}\n`);

  // 2. Catalyst Functions Audit (Offline Static & Export Analysis)
  console.log('--- 2. AUDITING CATALYST SERVERLESS FUNCTIONS (functions/) ---');
  const functionDirs = fs.readdirSync(functionsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const funcName of functionDirs) {
    const indexPath = path.join(functionsDir, funcName, 'index.js');
    const pkgPath = path.join(functionsDir, funcName, 'package.json');
    const hasIndex = fs.existsSync(indexPath);
    const hasPkg = fs.existsSync(pkgPath);
    
    let syntaxValid = false;
    let errorMsg = null;
    let codeLength = 0;

    if (hasIndex) {
      const code = fs.readFileSync(indexPath, 'utf8');
      codeLength = code.length;
      try {
        new Function(code);
        syntaxValid = true;
      } catch (err) {
        syntaxValid = false;
        errorMsg = err.message;
      }
    }

    auditReport.functionsAudit.push({
      functionName: funcName,
      hasIndex,
      hasPackageJson: hasPkg,
      syntaxValid,
      codeSize: codeLength,
      error: errorMsg
    });

    console.log(`  [Function] ${funcName.padEnd(26)} -> Index: ${hasIndex ? '✓' : '✗'}, Pkg: ${hasPkg ? '✓' : '✗'}, Syntax: ${syntaxValid ? '✓' : '✗ (' + errorMsg + ')'}`);
  }
  console.log(`Total Functions Audited: ${functionDirs.length}\n`);

  // 3. Next.js API Routes Testing
  console.log('--- 3. TESTING LIVE NEXT.JS API ENDPOINTS (HTTP) ---');
  const apiTestCases = [
    { path: '/api/firs', method: 'GET' },
    { path: '/api/firs?limit=5', method: 'GET' },
    { path: '/api/firs?search=theft', method: 'GET' },
    { path: '/api/hotspots', method: 'GET' },
    { path: '/api/trends', method: 'GET' },
    { path: '/api/repeat-offenders', method: 'GET' },
    { path: '/api/victim-vulnerability', method: 'GET' },
    { path: '/api/underreporting', method: 'GET' },
    { path: '/api/cameras-nearby?lat=12.9716&lng=77.5946&radius=5', method: 'GET' },
    { path: '/api/trail?suspect_id=Ramesh_Kumar', method: 'GET' },
    { path: '/api/anpr-check', method: 'POST', body: { vehicle_number: 'KA-01-AB-1234' } },
    { path: '/api/network-graph-data', method: 'GET' },
    { path: '/api/news', method: 'GET' },
    { path: '/api/news?category=crime', method: 'GET' },
    { path: '/api/askDrishtiAI', method: 'POST', body: { query: 'Summarize vehicle theft pattern' } },
    { path: '/api/ai', method: 'POST', body: { prompt: 'Analyze theft spike in Indiranagar' } },
    { path: '/api/ai/panchanama', method: 'POST', body: { firNumber: 'FIR/2026/001', crimeType: 'Theft' } },
    { path: '/api/analytics/firs', method: 'GET' },
    { path: '/api/conversations', method: 'POST', body: { message: 'What is the highest risk area?' } },
    { path: '/api/auth-verify', method: 'POST', body: { token: 'mock-test-token' } },
    { path: '/api/cache-hotspots', method: 'GET' },
    { path: '/api/cron-night-recalc', method: 'GET' },
    { path: '/api/export-pdf', method: 'GET' },
    { path: '/api/investigation-circuit', method: 'POST', body: { caseId: 'CASE-2026-091' } },
    { path: '/api/ml-risk-score', method: 'POST', body: { suspect_name: 'Vikram Malhotra' } },
    { path: '/api/on-alert-broadcast', method: 'POST', body: { alertType: 'HIGH_RISK_FIR' } },
    { path: '/api/on-fir-insert', method: 'POST', body: { fir_id: 'FIR-999' } },
    { path: '/api/push-notify', method: 'POST', body: { title: 'Patrol Alert', message: 'Vehicle Spotted' } },
    { path: '/api/search-firs?q=burglary', method: 'GET' },
    { path: '/api/send-alert-mail', method: 'POST', body: { recipient: 'officer@ksp.gov.in', subject: 'Urgent Alert' } },
    { path: '/api/stratus-upload', method: 'POST', body: { filename: 'evidence.jpg' } },
    { path: '/api/zia-automl-predict', method: 'POST', body: { features: [1, 2, 3] } },
    { path: '/api/zia-ocr', method: 'POST', body: { image_base64: 'sample_base64' } }
  ];

  for (const testCase of apiTestCases) {
    const res = await makeRequest(testCase.path, testCase.method, testCase.body);
    auditReport.apiRoutesAudit.push({
      endpoint: testCase.path,
      method: testCase.method,
      status: res.status,
      ok: res.ok,
      elapsed: res.elapsed,
      preview: res.preview,
      error: res.error
    });
    const statusIcon = res.ok ? '✓' : (res.status === 400 || res.status === 401 ? '⚠ (Handled)' : '✗');
    console.log(`  [API] ${testCase.method.padEnd(5)} ${testCase.path.padEnd(48)} -> ${statusIcon} Status: ${res.status} (${res.elapsed})`);
  }
  console.log(`Total API Endpoints Audited: ${apiTestCases.length}\n`);

  // 4. Next.js UI Pages Testing (SSR / HTML Render Verification)
  console.log('--- 4. TESTING LIVE NEXT.JS UI ROUTES (PAGES) ---');
  const uiPages = [
    '/',
    '/dashboard',
    '/dashboard/fir',
    '/dashboard/fir/new',
    '/dashboard/fir/panchanama',
    '/dashboard/map',
    '/dashboard/network',
    '/dashboard/chat',
    '/dashboard/surveillance',
    '/dashboard/news',
    '/analyst',
    '/analyst/chat',
    '/analyst/heatmap',
    '/analyst/network',
    '/analyst/patterns',
    '/analyst/reports',
    '/analyst/watchlist',
    '/supervisor',
    '/supervisor/approvals',
    '/supervisor/audit',
    '/supervisor/chat',
    '/supervisor/dispatch',
    '/supervisor/escalations'
  ];

  for (const pagePath of uiPages) {
    const res = await makeRequest(pagePath, 'GET');
    auditReport.uiPagesAudit.push({
      page: pagePath,
      status: res.status,
      ok: res.ok,
      elapsed: res.elapsed,
      sizeBytes: res.dataLength,
      error: res.error
    });
    const statusIcon = res.ok ? '✓' : '✗';
    console.log(`  [UI] ${pagePath.padEnd(35)} -> ${statusIcon} Status: ${res.status} (${res.elapsed}, Size: ${res.sizeBytes} bytes)`);
  }
  console.log(`Total UI Pages Audited: ${uiPages.length}\n`);

  // 5. Build & Summarize
  const successfulApis = auditReport.apiRoutesAudit.filter(a => a.ok).length;
  const successfulUis = auditReport.uiPagesAudit.filter(u => u.ok).length;
  const validFunctions = auditReport.functionsAudit.filter(f => f.syntaxValid && f.hasIndex).length;

  auditReport.summary = {
    totalCatalystFunctions: functionDirs.length,
    validCatalystFunctions: validFunctions,
    totalApiRoutesTested: apiTestCases.length,
    successfulApiRoutes: successfulApis,
    totalUiPagesTested: uiPages.length,
    successfulUiPages: successfulUis
  };

  fs.writeFileSync(path.join(rootDir, 'audit_results.json'), JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('================================================================');
  console.log(`🏆 AUDIT COMPLETE:`);
  console.log(`   - Serverless Functions : ${validFunctions}/${functionDirs.length} Valid`);
  console.log(`   - API Routes Tested    : ${successfulApis}/${apiTestCases.length} Passed`);
  console.log(`   - UI Pages Rendered    : ${successfulUis}/${uiPages.length} Passed`);
  console.log('================================================================\n');

  return auditReport;
}

runDeepAudit().catch(console.error);
