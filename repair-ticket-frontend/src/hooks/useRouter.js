import { useState, useEffect, useCallback } from 'react';

/**
 * useRouter
 * 
 * Lightweight client-side router using HTML5 History API.
 * Supports direct address bar navigation, bookmarking, and programmatic transitions.
 */
export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((toPath) => {
    if (typeof window !== 'undefined' && toPath !== window.location.pathname) {
      window.history.pushState({}, '', toPath);
      setCurrentPath(toPath);
      window.scrollTo(0, 0);
    }
  }, []);

  // Normalize path string (e.g. '/admin/' -> '/admin')
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';

  const isAdminRoute = normalizedPath === '/admin' || normalizedPath.startsWith('/admin-') || normalizedPath.startsWith('/admin/');
  const isTechRoute = normalizedPath === '/technician' || normalizedPath.startsWith('/technician-') || normalizedPath.startsWith('/technician/') || normalizedPath === '/worker';
  const isTrackerRoute = normalizedPath === '/track' || normalizedPath === '/tracker';
  const isCustomerRoute = normalizedPath === '/' || normalizedPath === '/customer' || normalizedPath === '/client' || normalizedPath === '/login';

  return {
    currentPath: normalizedPath,
    navigate,
    isAdminRoute,
    isTechRoute,
    isTrackerRoute,
    isCustomerRoute,
  };
}
