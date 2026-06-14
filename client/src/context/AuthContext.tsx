import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const checkAuth = async () => {
    if (window.location.pathname.startsWith('/auth')) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (err) {
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setStatus('loading');
    try {
      await authApi.loginUser(email, password);
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authApi.registerUser(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    status,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
