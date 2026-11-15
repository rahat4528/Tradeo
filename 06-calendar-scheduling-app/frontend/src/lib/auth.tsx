'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from './api';

export interface HostUser {
  id: string;
  username: string;
  name: string;
  email: string;
  timezone: string;
  bio?: string | null;
}

interface AuthContextType {
  user: HostUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: HostUser) => void;
  logout: () => void;
  updateUser: (updatedUser: HostUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HostUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('timesync_token');
    const storedUser = localStorage.getItem('timesync_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('timesync_token');
        localStorage.removeItem('timesync_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: HostUser) => {
    localStorage.setItem('timesync_token', newToken);
    localStorage.setItem('timesync_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('timesync_token');
    localStorage.removeItem('timesync_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: HostUser) => {
    localStorage.setItem('timesync_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
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
