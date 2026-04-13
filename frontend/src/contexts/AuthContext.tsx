import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMeApi, loginApi, registerApi, logoutApi } from '../services/api';

type User = {
  user_id: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await getMeApi();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const userData = await loginApi(email, password);
    setUser(userData);
  };

  const register = async (email: string, password: string, name: string) => {
    const userData = await registerApi(email, password, name);
    setUser(userData);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const refresh = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
