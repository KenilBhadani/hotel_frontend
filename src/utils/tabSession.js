/**
 * Tab-Specific Session Management
 * Allows multiple user types (Guest, Admin, Staff) to be logged in simultaneously in different tabs
 */

// Generate unique tab ID
const getTabId = () => {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
};

// Session types
const SESSION_TYPES = {
    GUEST: 'guest',
    ADMIN: 'admin',
    STAFF: 'staff'
};

// Validate if token is a valid JWT (not "session" string or other invalid values)
const isValidToken = (token) => {
    if (!token || typeof token !== 'string') return false;
    // JWT tokens have 3 parts separated by dots and are longer than 20 chars
    if (token === 'session' || token.length < 20) return false;
    // Basic JWT format check (should have 2 dots)
    const parts = token.split('.');
    return parts.length === 3;
};

// Clean up invalid tokens from localStorage
const cleanupInvalidTokens = () => {
    const tokenKeys = ['token', 'adminToken', 'staffToken'];
    tokenKeys.forEach(key => {
        const token = localStorage.getItem(key);
        if (token && !isValidToken(token)) {
            console.warn(`Removing invalid ${key} from localStorage`);
            localStorage.removeItem(key);
            // Also remove associated user data
            const userKey = key === 'token' ? 'user' : key.replace('Token', 'User');
            localStorage.removeItem(userKey);
        }
    });
};

// Get current tab's session type
const getTabSessionType = () => {
    return sessionStorage.getItem('sessionType');
};

// Set current tab's session type
const setTabSessionType = (type) => {
    sessionStorage.setItem('sessionType', type);
};

// Clear current tab's session
const clearTabSession = () => {
    sessionStorage.removeItem('sessionType');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};

// Check if current tab has a session
const hasTabSession = () => {
    return !!sessionStorage.getItem('sessionType');
};

// Get token for current tab
const getTabToken = () => {
    const sessionType = getTabSessionType();
    if (!sessionType) return null;

    // First check sessionStorage (tab-specific)
    const tabToken = sessionStorage.getItem('token');
    if (tabToken && isValidToken(tabToken)) return tabToken;

    // Fallback to localStorage (persistent)
    let token;
    switch (sessionType) {
        case SESSION_TYPES.GUEST:
            token = localStorage.getItem('token');
            break;
        case SESSION_TYPES.ADMIN:
            token = localStorage.getItem('adminToken');
            break;
        case SESSION_TYPES.STAFF:
            token = localStorage.getItem('staffToken');
            break;
        default:
            return null;
    }

    // Validate token before returning
    return (token && isValidToken(token)) ? token : null;
};

// Get user for current tab
const getTabUser = () => {
    const sessionType = getTabSessionType();
    if (!sessionType) return null;

    // First check sessionStorage (tab-specific)
    const tabUser = sessionStorage.getItem('user');
    if (tabUser) {
        try {
            return JSON.parse(tabUser);
        } catch {
            return null;
        }
    }

    // Fallback to localStorage (persistent)
    let userKey;
    switch (sessionType) {
        case SESSION_TYPES.GUEST:
            userKey = 'user';
            break;
        case SESSION_TYPES.ADMIN:
            userKey = 'adminUser';
            break;
        case SESSION_TYPES.STAFF:
            userKey = 'staffUser';
            break;
        default:
            return null;
    }

    const user = localStorage.getItem(userKey);
    if (user) {
        try {
            return JSON.parse(user);
        } catch {
            return null;
        }
    }

    return null;
};

// Set session for current tab
const setTabSession = (type, token, user) => {
    setTabSessionType(type);

    // Store in sessionStorage (tab-specific)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));

    // Also store in localStorage (persistent across tabs)
    switch (type) {
        case SESSION_TYPES.GUEST:
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            break;
        case SESSION_TYPES.ADMIN:
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            break;
        case SESSION_TYPES.STAFF:
            localStorage.setItem('staffToken', token);
            localStorage.setItem('staffUser', JSON.stringify(user));
            break;
    }
};

// Logout from current tab
const logoutTab = () => {
    const sessionType = getTabSessionType();

    // Clear sessionStorage (tab-specific)
    clearTabSession();

    // Optionally clear localStorage (affects all tabs)
    // Uncomment if you want logout to affect all tabs
    /*
    switch (sessionType) {
      case SESSION_TYPES.GUEST:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        break;
      case SESSION_TYPES.ADMIN:
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        break;
      case SESSION_TYPES.STAFF:
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        break;
    }
    */
};

// Initialize tab session from localStorage if available
const initializeTabSession = (preferredType = null) => {
    // Clean up any invalid tokens first
    cleanupInvalidTokens();

    // If tab already has a session, keep it
    if (hasTabSession()) {
        return getTabSessionType();
    }

    // If preferred type is specified and available, use it
    if (preferredType) {
        let token, user;
        switch (preferredType) {
            case SESSION_TYPES.GUEST:
                token = localStorage.getItem('token');
                user = localStorage.getItem('user');
                break;
            case SESSION_TYPES.ADMIN:
                token = localStorage.getItem('adminToken');
                user = localStorage.getItem('adminUser');
                break;
            case SESSION_TYPES.STAFF:
                token = localStorage.getItem('staffToken');
                user = localStorage.getItem('staffUser');
                break;
        }

        // Only initialize if token is valid
        if (token && user && isValidToken(token)) {
            setTabSession(preferredType, token, user);
            return preferredType;
        }
    }

    // Auto-detect from localStorage (only if tokens are valid)
    const guestToken = localStorage.getItem('token');
    if (guestToken && isValidToken(guestToken)) {
        const user = localStorage.getItem('user');
        if (user) {
            setTabSession(SESSION_TYPES.GUEST, guestToken, user);
            return SESSION_TYPES.GUEST;
        }
    }

    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && isValidToken(adminToken)) {
        const user = localStorage.getItem('adminUser');
        if (user) {
            setTabSession(SESSION_TYPES.ADMIN, adminToken, user);
            return SESSION_TYPES.ADMIN;
        }
    }

    const staffToken = localStorage.getItem('staffToken');
    if (staffToken && isValidToken(staffToken)) {
        const user = localStorage.getItem('staffUser');
        if (user) {
            setTabSession(SESSION_TYPES.STAFF, staffToken, user);
            return SESSION_TYPES.STAFF;
        }
    }

    return null;
};

// Check if user is logged in (in current tab)
const isLoggedIn = () => {
    return hasTabSession() && !!getTabToken();
};

// Get session info for debugging
const getSessionInfo = () => {
    return {
        tabId: getTabId(),
        sessionType: getTabSessionType(),
        hasSession: hasTabSession(),
        token: getTabToken() ? '***' : null,
        user: getTabUser()
    };
};

export {
    SESSION_TYPES,
    getTabId,
    getTabSessionType,
    setTabSessionType,
    clearTabSession,
    hasTabSession,
    getTabToken,
    getTabUser,
    setTabSession,
    logoutTab,
    initializeTabSession,
    isLoggedIn,
    getSessionInfo,
    isValidToken,
    cleanupInvalidTokens
};
