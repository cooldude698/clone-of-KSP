const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || '3000', 10);
const dev = false;
const hostname = '0.0.0.0';
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

console.log(`[AppSail] Initializing Next.js custom server on port: ${port}`);

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      if (req.url === '/healthz' || req.url === '/_health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
      }
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    console.error('[AppSail] Server failed to bind port:', err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`[AppSail] Ready and listening on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('[AppSail] Failed during app.prepare():', err);
  process.exit(1);
});
