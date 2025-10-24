import React, { useState, useMemo, useCallback } from 'react';
import { User } from '@shared/types';
import { AuthContext } from '@/contexts/AuthContext';
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('dentaflow_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const login = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('dentaflow_user', JSON.stringify(loggedInUser));
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('dentaflow_user');
  }, []);
  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    login,
    logout,
  }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};