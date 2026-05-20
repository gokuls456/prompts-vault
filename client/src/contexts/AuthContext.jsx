import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — try to restore session from stored token
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('pv_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
      } catch {
        localStorage.removeItem('pv_token');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem('pv_token', data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('pv_token');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' || user?.role === 'superadmin', isSuperAdmin: user?.role === 'superadmin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
