import { useState, useEffect } from 'react';
import { 
  getTabToken, 
  getTabUser, 
  getTabSessionType,
  initializeTabSession,
  logoutTab,
  SESSION_TYPES
} from '../utils/tabSession';

/**
 * Custom hook for tab-specific authentication
 */
export const useTabAuth = (requiredType = null) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionType, setSessionType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session
    const type = initializeTabSession(requiredType);
    setSessionType(type);
    setToken(getTabToken());
    setUser(getTabUser());
    setLoading(false);
  }, [requiredType]);

  const logout = () => {
    logoutTab();
    setToken(null);
    setUser(null);
    setSessionType(null);
  };

  const isAuthenticated = !!token && !!user;
  const isCorrectType = !requiredType || sessionType === requiredType;

  return {
    token,
    user,
    sessionType,
    loading,
    isAuthenticated,
    isCorrectType,
    logout
  };
};

export default useTabAuth;
