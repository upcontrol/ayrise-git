"use client"

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  email: string;
  avatar: string;
} | null;

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    if (!isLoading && isAuthenticated) return true;
    try {
      const response = await fetch('/api/auth/check', { credentials: 'include' });
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user ? { ...data.user, avatar: data.user.avatar || '/images/default-avatar.png' } : null);
      return data.isAuthenticated;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    checkAuth().catch(console.error);
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const authResult = await checkAuth();
        if (authResult) {
          return true;
        } else {
          throw new Error('Başarılı girişten sonra kimlik doğrulama başarısız oldu');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        throw new Error('Çıkış başarısız oldu');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
