import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sessionSync, { SESSION_KEYS } from '../utils/sessionSync';

/**
 * Hook to sync authentication state across multiple tabs
 * Automatically redirects when session changes in another tab
 */
export const useSessionSync = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionChange = (change) => {
            console.log('Session sync detected:', change);

            // Handle logout in another tab
            if (change.type === 'logout') {
                if (change.key === SESSION_KEYS.TOKEN || change.key === SESSION_KEYS.USER) {
                    // Guest logged out
                    console.log('Guest session ended in another tab, redirecting...');
                    navigate('/login', { replace: true });
                    window.location.reload();
                } else if (change.key === SESSION_KEYS.ADMIN_TOKEN || change.key === SESSION_KEYS.ADMIN_USER) {
                    // Admin logged out
                    console.log('Admin session ended in another tab, redirecting...');
                    navigate('/login', { replace: true });
                    window.location.reload();
                } else if (change.key === SESSION_KEYS.STAFF_TOKEN || change.key === SESSION_KEYS.STAFF_USER) {
                    // Staff logged out
                    console.log('Staff session ended in another tab, redirecting...');
                    navigate('/login/staff', { replace: true });
                    window.location.reload();
                }
            }

            // Handle login in another tab
            if (change.type === 'login') {
                if (change.key === SESSION_KEYS.TOKEN || change.key === SESSION_KEYS.USER) {
                    // Guest logged in
                    console.log('Guest logged in another tab, refreshing...');
                    window.location.reload();
                } else if (change.key === SESSION_KEYS.ADMIN_TOKEN || change.key === SESSION_KEYS.ADMIN_USER) {
                    // Admin logged in
                    console.log('Admin logged in another tab, refreshing...');
                    window.location.reload();
                } else if (change.key === SESSION_KEYS.STAFF_TOKEN || change.key === SESSION_KEYS.STAFF_USER) {
                    // Staff logged in
                    console.log('Staff logged in another tab, refreshing...');
                    window.location.reload();
                }
            }
        };

        // Subscribe to session changes
        const unsubscribe = sessionSync.subscribe(handleSessionChange);

        // Cleanup
        return () => {
            unsubscribe();
        };
    }, [navigate]);
};
