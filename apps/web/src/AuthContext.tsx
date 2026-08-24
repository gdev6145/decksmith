import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "./lib/config";
import { soundFx } from "./lib/soundFx";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrName: string) => Promise<boolean>;
  register: (name: string, email: string, role?: string) => Promise<boolean>;
  logout: () => void;
  quickSwitchBuilder: (builder: UserProfile) => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ds_auth_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/auth/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.token) {
            setToken(data.token);
            localStorage.setItem("ds_auth_token", data.token);
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (emailOrName: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailOrName.includes("@") ? emailOrName : undefined,
          name: !emailOrName.includes("@") ? emailOrName : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ds_auth_token", data.token);
        soundFx.playConfirm();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, role?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ds_auth_token", data.token);
        soundFx.playConfirm();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    soundFx.playClick();
    setUser(null);
    setToken(null);
    localStorage.removeItem("ds_auth_token");
    // Switch to clean guest session
    login("Guest Builder");
  };

  const quickSwitchBuilder = async (builder: UserProfile) => {
    soundFx.playConfirm();
    await login(builder.email || builder.name);
    setShowAuthModal(false);
  };

  const isAuthenticated = !!user && user.email !== "guest@decksmith.local";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        quickSwitchBuilder,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
