'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from './api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  token: string | null;
  login: (token: string, user: User, workspace: Workspace) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  workspace: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('api_testing_token');
    if (savedToken) {
      setToken(savedToken);
      apiClient
        .get('/auth/me')
        .then((res) => {
          setUser({ id: res.data.id, email: res.data.email, name: res.data.name });
          if (res.data.workspaces && res.data.workspaces.length > 0) {
            setWorkspace(res.data.workspaces[0]);
          }
        })
        .catch(() => {
          localStorage.removeItem('api_testing_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, newWorkspace: Workspace) => {
    localStorage.setItem('api_testing_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setWorkspace(newWorkspace);
  };

  const logout = () => {
    localStorage.removeItem('api_testing_token');
    setToken(null);
    setUser(null);
    setWorkspace(null);
  };

  return (
    <AuthContext.Provider value={{ user, workspace, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
