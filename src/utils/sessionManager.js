// Session Manager - Prevents multiple users from logging in simultaneously
// Tracks active sessions and enforces single-user-per-browser policy

const SESSION_STORAGE_KEY = 'active_session';

class SessionManager {
    constructor() {
        this.setupBeforeUnload();
    }

    // Get current active session
    getActiveSession() {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    }

    // Check if a user is currently logged in
    hasActiveSession() {
        return !!this.getActiveSession();
    }

    // Create a new session
    createSession(userType, userId, userName, userEmail) {
        const session = {
            userType, // 'guest', 'admin', or 'staff'
            userId,
            userName,
            userEmail,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        return session;
    }

    // Update last activity timestamp
    updateActivity() {
        const session = this.getActiveSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        }
    }

    // Clear the active session
    clearSession() {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    // Check if trying to login as different user
    isDifferentUser(userType, userId) {
        const active = this.getActiveSession();
        if (!active) return false;

        return active.userType !== userType || active.userId !== userId;
    }

    // Force logout current user and login new user
    forceLogout() {
        // Clear all auth tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');

        this.clearSession();
    }

    // Setup cleanup on browser close
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            // Optional: Clear session when browser closes
            // Uncomment if you want sessions to persist across browser restarts
            // this.clearSession();
        });
    }
}

// Singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
