import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { showToast } from '../utils/toast';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on app start
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast.success('Đăng xuất thành công!');
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...data } : null;
      if (next) localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};