import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface BackgroundProfile {
  python_level: "beginner" | "intermediate" | "advanced";
  ros_level: "beginner" | "intermediate" | "advanced";
  ml_ai_level: "beginner" | "intermediate" | "advanced";
  simulation_level: "beginner" | "intermediate" | "advanced";
  has_gpu: boolean;
  has_robot_kit: boolean;
  has_sensors: boolean;
}

interface SignupData {
  email: string;
  password: string;
  display_name: string;
  profile: BackgroundProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${api.baseUrl}/auth/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      // Backend unavailable — silently treat as not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User }>("/auth/signin", { email, password });
    setUser(data.user);
  }, []);

  const signup = useCallback(async (signupData: SignupData) => {
    const data = await api.post<{ user: User }>("/auth/signup", signupData);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/signout");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { User, BackgroundProfile, SignupData };
