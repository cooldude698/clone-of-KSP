/**
 * Zoho OAuth Token Manager
 * Auto-refreshes QUICKML_OAUTH_TOKEN using client_credentials grant
 * when the current token expires (TTL: 3600 seconds).
 */

let cachedToken = null;
let tokenExpiry = 0;

export async function getZohoOAuthToken() {
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  // Fall back to env if client credentials not configured
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Use statically configured token
    const staticToken = process.env.QUICKML_OAUTH_TOKEN;
    if (!staticToken) throw new Error('QUICKML_OAUTH_TOKEN not configured');
    return staticToken;
  }

  // Request fresh token from Zoho OAuth
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'ZohoAnalytics.modeling.ALL',
    });

    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();

    if (!data.access_token) {
      console.error('Zoho OAuth refresh failed:', data);
      // Fall back to static env token
      return process.env.QUICKML_OAUTH_TOKEN || '';
    }

    cachedToken = data.access_token;
    tokenExpiry = now + (data.expires_in || 3600) * 1000;

    return cachedToken;
  } catch (err) {
    console.error('Zoho OAuth token refresh error:', err);
    return process.env.QUICKML_OAUTH_TOKEN || '';
  }
}
