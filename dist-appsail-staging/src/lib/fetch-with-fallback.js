/**
 * nextjs/src/lib/fetch-with-fallback.js
 * Robust fetch wrapper with automatic timeout, in-memory cache, and demo data fallback.
 *
 * Performance improvements:
 * - Default timeout reduced from 6s → 2s (saves up to 4s per dead endpoint)
 * - In-memory response cache (TTL 30s) prevents redundant re-fetches on
 *   page navigation within the same session
 * - Dead-endpoint tracking: if a backend fails once, subsequent calls within
 *   15s skip the network entirely and return demo data immediately
 */

// ── In-memory caches (module-level, shared across the whole tab session) ────
const _responseCache = new Map(); // key → { data, ts }
const _deadEndpoints = new Map(); // key → ts (timestamp when it failed)

const CACHE_TTL_MS    = 60_000;  // Cache valid responses for 60 s
const DEAD_TTL_MS     = 30_000;  // Don't retry a dead/slow endpoint for 30s

export async function fetchWithFallback(endpoint, demoData, options = {}) {
  const timeoutMs     = options.timeoutMs || 8000; // Increased to 8000ms for Catalyst cold starts
  const bypassCache   = options.bypassCache || false;
  const method        = (options.method || 'GET').toUpperCase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
  const cacheKey      = `${method}:${cleanEndpoint}`;
  const now           = Date.now();

  // ── 1. Return cached response if fresh (GET only) ─────────────────────────
  if (!bypassCache && method === 'GET') {
    const cached = _responseCache.get(cacheKey);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return { data: cached.data, source: 'live' };
    }

    // ── 2. Skip dead endpoints (avoid the network wait entirely) ─────────────
    const deadTs = _deadEndpoints.get(cacheKey);
    if (deadTs && now - deadTs < DEAD_TTL_MS) {
      return { data: demoData, source: 'demo' };
    }
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal,
      ...(options.body ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {})
    };

    const res = await fetch(cleanEndpoint, fetchOptions);
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[fetchWithFallback] ${cleanEndpoint} → HTTP ${res.status}. Demo fallback.`);
      _deadEndpoints.set(cacheKey, now);
      return { data: demoData, source: 'demo' };
    }

    const json = await res.json();

    // Degraded proxy wrapper check
    if (json && json.status === 'degraded' && (!json.firs || json.firs.length === 0)) {
      console.warn(`[fetchWithFallback] ${cleanEndpoint} → degraded wrapper. Demo fallback.`);
      _deadEndpoints.set(cacheKey, now);
      return { data: demoData, source: 'demo' };
    }

    // Store in cache
    if (method === 'GET') {
      _responseCache.set(cacheKey, { data: json, ts: now });
      _deadEndpoints.delete(cacheKey); // endpoint is healthy again
    }

    return { data: json, source: 'live' };
  } catch (err) {
    clearTimeout(timeoutId);
    const reason = err.name === 'AbortError' ? `timed out after ${timeoutMs}ms` : err.message;
    console.warn(`[fetchWithFallback] ${cleanEndpoint} → ${reason}. Demo fallback.`);
    _deadEndpoints.set(cacheKey, now);
    return { data: demoData, source: 'demo' };
  }
}

/** Manually invalidate a cached endpoint (call after mutations) */
export function invalidateCache(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
  _responseCache.delete(`GET:${cleanEndpoint}`);
}
