/**
 * Auth Headers Utility
 * Provides authorization headers for API calls using tab sessions
 */

import { getTabToken } from './tabSession';

/**
 * Get authorization headers for API calls
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
    const token = getTabToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get authorization headers with Content-Type
 * @returns {Object} Headers object with Authorization and Content-Type
 */
export const getAuthHeadersJSON = () => {
    const token = getTabToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export default getAuthHeaders;
