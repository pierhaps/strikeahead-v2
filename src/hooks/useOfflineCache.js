/**
 * useOfflineCache
 * Manages localStorage caching for offline-capable data.
 * Cache TTL: 24 hours.
 */

const TTL_MS = 24 * 60 * 60 * 1000; // 24 h

export function getCached(key) {
  try {
    const raw = localStorage.getItem(`sa_cache_${key}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null; // stale
    return data;
  } catch {
    return null;
  }
}

export function setCached(key, data) {
  try {
    localStorage.setItem(`sa_cache_${key}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // quota exceeded — ignore
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(`sa_cache_${key}`);
  } catch {}
}

/**
 * fetchWithCache
 * Tries to fetch fresh data from `fetcher()`.
 * Falls back to cached version when offline or fetcher throws.
 * Always updates cache on success.
 */
export async function fetchWithCache(key, fetcher) {
  if (!navigator.onLine) {
    return getCached(key) ?? [];
  }
  try {
    const data = await fetcher();
    setCached(key, data);
    return data;
  } catch {
    return getCached(key) ?? [];
  }
}

// Offline pending-catches queue
const PENDING_KEY = 'sa_pending_catches';

export function getPendingCatches() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addPendingCatch(catchData) {
  const queue = getPendingCatches();
  queue.push({ ...catchData, _pendingId: Date.now() });
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

export function removePendingCatch(pendingId) {
  const queue = getPendingCatches().filter(c => c._pendingId !== pendingId);
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

export function clearPendingCatches() {
  localStorage.removeItem(PENDING_KEY);
}