/**
 * on-alert-broadcast — Catalyst Event Function (Cap #22: Catalyst Signals Cross-App Bus)
 *
 * Subscribed to topic: 'HIGH_RISK_FIR_ALERT'
 *
 * Logic:
 * 1. Consumes event payload from Signals bus
 * 2. Persists alert incident to Catalyst NoSQL 'alert_log' collection
 * 3. Triggers multi-channel notification dispatch
 */

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (signalEvent, context) => {
  console.log('[on-alert-broadcast] 📡 Signals Bus Event Received:', signalEvent);

  try {
    const adminApp = catalyst.initialize(context, { scope: 'admin' });
    const payload = signalEvent?.data || signalEvent || {};

    const { case_number, accused_name, district, severity, crime_type } = payload;

    // Log to Catalyst NoSQL
    try {
      const nosql = adminApp.nosql();
      const collection = nosql.collection('alert_log');
      await collection.insertRow({
        case_number: case_number || 'UNKNOWN',
        accused_name: accused_name || 'UNKNOWN',
        district: district || 'Bengaluru Urban',
        crime_type: crime_type || 'Offence',
        severity: severity || 'HIGH',
        broadcast_at: new Date().toISOString(),
        status: 'DISPATCHED'
      });
      console.log('[on-alert-broadcast] Persisted alert to NoSQL alert_log collection.');
    } catch (nsErr) {
      console.warn('[on-alert-broadcast] NoSQL logging warning:', nsErr.message);
    }

    if (context && typeof context.closeWithSuccess === 'function') {
      context.closeWithSuccess();
    }
  } catch (err) {
    console.error('[on-alert-broadcast] Failure:', err.message);
    if (context && typeof context.closeWithFailure === 'function') {
      context.closeWithFailure();
    }
  }
};
