/**
 * on-fir-insert — Catalyst Event Function (Cap #21: Catalyst Event-Driven Functions)
 *
 * Triggered on: Catalyst DataStore Row Insert on table 'FIRs'
 *
 * Logic:
 * 1. Reads newly inserted FIR record payload
 * 2. Checks if accused name matches High-Risk Repeat Offenders list
 * 3. If high-risk match found, publishes 'HIGH_RISK_FIR_ALERT' to Catalyst Signals event bus
 */

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (eventData, context) => {
  console.log('[on-fir-insert] ⚡ Event received on FIR DataStore insert');

  try {
    const adminApp = catalyst.initialize(context, { scope: 'admin' });
    const firRecord = eventData?.data || eventData || {};

    const caseNumber = firRecord.case_number || 'KAR/2026/AUTO';
    const crimeType = firRecord.crime_type || 'General Offence';
    const accused = (firRecord.accused_name || '').toLowerCase();
    const district = firRecord.district_name || 'Bengaluru Urban';

    console.log(`[on-fir-insert] Processing Case: ${caseNumber} | Type: ${crimeType} | Accused: ${accused}`);

    // Check repeat offender watchlist keywords
    const watchlist = ['ramesh', 'suresh', 'imran', 'bullet', 'naidu', 'shafi'];
    const isWatchlistMatch = watchlist.some(w => accused.includes(w));

    if (isWatchlistMatch || crimeType.toLowerCase().includes('dacoity') || crimeType.toLowerCase().includes('murder')) {
      console.log(`[on-fir-insert] 🚨 HIGH RISK EVENT DETECTED for Case ${caseNumber}`);

      try {
        const signals = adminApp.signals();
        await signals.publish('HIGH_RISK_FIR_ALERT', {
          case_number: caseNumber,
          crime_type: crimeType,
          accused_name: firRecord.accused_name,
          district: district,
          severity: 'CRITICAL',
          timestamp: new Date().toISOString()
        });
        console.log('[on-fir-insert] Published HIGH_RISK_FIR_ALERT to Signals bus.');
      } catch (sigErr) {
        console.warn('[on-fir-insert] Signals publish failed:', sigErr.message);
      }
    }

    if (context && typeof context.closeWithSuccess === 'function') {
      context.closeWithSuccess();
    }
  } catch (err) {
    console.error('[on-fir-insert] Error:', err.message);
    if (context && typeof context.closeWithFailure === 'function') {
      context.closeWithFailure();
    }
  }
};
