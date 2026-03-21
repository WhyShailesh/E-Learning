import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";

export type UserRole = "admin" | "instructor" | "learner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "learnova_auth";

function getRoleRedirect(role: UserRole): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "instructor") return "/instructor/dashboard";
  return "/learner/dashboard";
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const { user: u, token: t } = JSON.parse(stored);
      if (u && t) {
        setUser(u);
        setToken(t);
        api.me(t).catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
          setToken(null);
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistAuth = (u: User, t: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
    setUser(u);
    setToken(t);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = "learner"
  ): Promise<boolean> => {
    try {
      const response = await api.signup({ name, email, password, role });
      const safeUser = { ...response.user, role: response.user.role || "learner" };
      persistAuth(safeUser, response.token);
      return true;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await api.login({ email, password });
      const safeUser = { ...response.user, role: response.user.role || "learner" };
      persistAuth(safeUser, response.token);
      return safeUser;
    } catch {
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { getRoleRedirect };
