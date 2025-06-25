import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import api from '../lib/api';
import { getMe, logoutUser } from '../features/auth/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null); // Start with default settings
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const response = await api.get('/admin/settings');
      setSettings(response);
    } catch (error) {
      console.error('Failed to fetch settings, using default.', error);
      // Defaults are already set, so we just log the error.
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        setLoadingSettings(false);
        return;
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const response = await getMe(); // The raw response from the interceptor
        // The actual user data is nested inside the 'result' property
        if (response && response.result) {
          setUser(response.result); 
        } else {
          // Handle cases where API succeeds but doesn't return the expected structure
          setUser(response); 
        }
        await fetchSettings();
      } catch (error) {
        console.error('Auth check failed, logging out:', error);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [fetchSettings]);

  const login = useCallback((accessToken, refreshToken, userData) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);
    fetchSettings();
  }, [fetchSettings]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await logoutUser(refreshToken); // Call API to invalidate token on backend
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Still proceed with client-side logout even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      // Reset to default settings on logout
      setSettings({ siteName: 'Report System', announcementActive: false });
    }
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    settings,
    loadingSettings,
  }), [user, loading, settings, loadingSettings, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 