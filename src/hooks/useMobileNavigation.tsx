
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useMobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      // Check if we're at the root route
      if (window.location.pathname === '/' || window.location.pathname === '/profiles') {
        // Show exit confirmation
        const shouldExit = window.confirm('Möchtest du die App wirklich verlassen?');
        if (!shouldExit) {
          // Push current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    // Handle page unload/refresh
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show confirmation if navigating away from the app
      if (window.location.pathname === '/' || window.location.pathname === '/profiles') {
        event.preventDefault();
        event.returnValue = 'Möchtest du die App wirklich verlassen?';
        return 'Möchtest du die App wirklich verlassen?';
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, location]);

  // Push initial state to history if we're on root
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', '/profiles');
    }
  }, []);
};
