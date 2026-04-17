import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Detect platform once
function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
}

// Generate a session ID once per browser session
const SESSION_ID = (() => {
  const key = 'sa_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
})();

const PLATFORM = detectPlatform();

/**
 * Fire-and-forget event tracker.
 * Call trackEvent(userEmail, eventName, eventData) anywhere.
 * Never throws — analytics must never break the UX.
 */
export function trackEvent(userEmail, eventName, eventData = {}) {
  if (!userEmail || !eventName) return;
  base44.entities.AnalyticsEvent.create({
    user_email: userEmail,
    event_name: eventName,
    event_data: eventData,
    session_id: SESSION_ID,
    timestamp: new Date().toISOString(),
    platform: PLATFORM,
  }).catch(() => { /* silent */ });
}

/**
 * React hook that binds trackEvent to the current user email.
 * Returns a stable `track(eventName, eventData)` function.
 */
export function useAnalytics(userEmail) {
  const track = useCallback(
    (eventName, eventData = {}) => trackEvent(userEmail, eventName, eventData),
    [userEmail]
  );
  return { track };
}