import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
    } finally {
      setLoading(false);
    }
  };

  const getAuthEndpoint = (action, audience = 'student') => {
    if (audience === 'admin') {
      return `/api/auth/admin/${action}`;
    }

    return `/api/auth/${action}`;
  };

  const login = async (identifier, password, audience = 'student') => {
    try {
      const payload = (audience === 'admin' || audience === 'headadmin')
        ? { email: identifier, password }
        : { rollNo: identifier, password };

      const endpoint = audience === 'admin' ? '/admin' : audience === 'headadmin' ? '/headadmin' : '';
      const response = await api.post(`/auth${endpoint}/login`, payload);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData, audience = 'student') => {
    try {
      const endpoint = audience === 'admin' ? '/admin' : audience === 'headadmin' ? '/headadmin' : '';
      const response = await api.post(`/auth${endpoint}/register`, userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'headadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
