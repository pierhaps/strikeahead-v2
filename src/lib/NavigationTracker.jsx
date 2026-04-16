import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';

/**
 * NavigationTracker — posts URL changes to the Base44 editor parent frame
 * and logs page visits for analytics.
 */
export default function NavigationTracker() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Post navigation changes to parent window (Base44 editor)
  useEffect(() => {
    window.parent?.postMessage({
      type: "app_changed_url",
      url: window.location.href
    }, '*');
  }, [location]);

  // Log user activity when navigating to a page
  useEffect(() => {
    const pathname = location.pathname;
    let pageName;

    if (pathname === '/' || pathname === '') {
      pageName = 'Home';
    } else {
      // Remove leading slash and get the first segment
      pageName = pathname.replace(/^\//, '').split('/')[0];
    }

    if (isAuthenticated && pageName) {
      base44.appLogs?.logUserInApp?.(pageName).catch(() => {
        // Silently fail — logging shouldn't break the app
      });
    }
  }, [location, isAuthenticated]);

  return null;
}
