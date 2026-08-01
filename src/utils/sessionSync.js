// Session synchronization across multiple tabs/windows
// Listens for localStorage changes and syncs authentication state

const SESSION_KEYS = {
    USER: 'user',
    TOKEN: 'token',
    ADMIN_USER: 'adminUser',
    ADMIN_TOKEN: 'adminToken',
    ADMIN_ROLE: 'adminRole',
    STAFF_USER: 'staffUser',
    STAFF_TOKEN: 'staffToken',
    ROLE: 'role'
};

// Event to trigger when session changes
const SESSION_CHANGE_EVENT = 'session-changed';

class SessionSync {
    constructor() {
        this.listeners = [];
        this.setupStorageListener();
    }

    setupStorageListener() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
            // Check if any session-related key changed
            if (Object.values(SESSION_KEYS).includes(e.key)) {
                console.log('Session changed in another tab:', e.key, e.newValue);

                // Notify all listeners
                this.notifyListeners({
                    key: e.key,
                    oldValue: e.oldValue,
                    newValue: e.newValue,
                    type: this.getChangeType(e.key, e.oldValue, e.newValue)
                });
            }
        });
    }

    getChangeType(key, oldValue, newValue) {
        if (!oldValue && newValue) return 'login';
        if (oldValue && !newValue) return 'logout';
        if (oldValue !== newValue) return 'update';
        return 'unknown';
    }

    // Subscribe to session changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(change) {
        this.listeners.forEach(callback => {
            try {
                callback(change);
            } catch (err) {
                console.error('Session sync listener error:', err);
            }
        });
    }


    // Broadcast session change to other tabs
    broadcastChange(key, value) {
        // Trigger storage event by setting a timestamp
        localStorage.setItem('_session_sync_timestamp', Date.now().toString());

        // Dispatch custom event for same tab
        window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, {
            detail: { key, value, type: this.getChangeType(key, localStorage.getItem(key), value) }
        }));
    }

    // Clear all session data
    clearAllSessions() {
        Object.values(SESSION_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.broadcastChange('all', null);
    }
}

// Singleton instance
const sessionSync = new SessionSync();

export default sessionSync;
export { SESSION_KEYS, SESSION_CHANGE_EVENT };
