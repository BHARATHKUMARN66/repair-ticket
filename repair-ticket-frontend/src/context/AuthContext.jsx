import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('omni_token');
      const savedUser = localStorage.getItem('omni_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to restore auth state:', e);
      localStorage.removeItem('omni_token');
      localStorage.removeItem('omni_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    const userInfo = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    };
    setToken(data.token);
    setUser(userInfo);
    localStorage.setItem('omni_token', data.token);
    localStorage.setItem('omni_user', JSON.stringify(userInfo));
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    const userInfo = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    };
    setToken(data.token);
    setUser(userInfo);
    localStorage.setItem('omni_token', data.token);
    localStorage.setItem('omni_user', JSON.stringify(userInfo));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('omni_token');
    localStorage.removeItem('omni_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ROLE_ADMIN',
    isTechnician: user?.role === 'ROLE_TECHNICIAN',
    isUser: user?.role === 'ROLE_USER',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
