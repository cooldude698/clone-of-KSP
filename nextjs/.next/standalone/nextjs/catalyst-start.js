// Catalyst AppSail port bridge — maps X_ZOHO_CATALYST_LISTEN_PORT → PORT
// for the auto-generated Next.js standalone server.js
if (process.env.X_ZOHO_CATALYST_LISTEN_PORT) {
  process.env.PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;
}
if (!process.env.HOSTNAME) {
  process.env.HOSTNAME = '0.0.0.0';
}
console.log('[Catalyst] Starting on port:', process.env.PORT || 3000);
require('./server.js');
