'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  currency: string;
  description?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  isLoading: boolean;
  login: (token: string, user: User, restaurant: Restaurant) => void;
  logout: () => void;
  refreshRestaurant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  restaurant: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshRestaurant: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tradeo_menu_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    Promise.all([api.me(), api.getRestaurant()])
      .then(([meRes, restRes]) => {
        setUser(meRes.user);
        setRestaurant(restRes);
      })
      .catch(() => {
        localStorage.removeItem('tradeo_menu_token');
        setUser(null);
        setRestaurant(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (token: string, loggedUser: User, loggedRestaurant: Restaurant) => {
    localStorage.setItem('tradeo_menu_token', token);
    setUser(loggedUser);
    setRestaurant(loggedRestaurant);
  };

  const logout = () => {
    localStorage.removeItem('tradeo_menu_token');
    setUser(null);
    setRestaurant(null);
  };

  const refreshRestaurant = async () => {
    try {
      const rest = await api.getRestaurant();
      setRestaurant(rest);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, restaurant, isLoading, login, logout, refreshRestaurant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
