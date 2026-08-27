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
  login: (emailOrName: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitchBuilder: (builder: UserProfile) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
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

  const login = async (emailOrName: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailOrName.includes("@") ? emailOrName.trim() : undefined,
          name: !emailOrName.includes("@") ? emailOrName.trim() : undefined,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ds_auth_token", data.token);
        soundFx.playConfirm();
        return { success: true };
      }
      return { success: false, error: data.error || "Authentication failed" };
    } catch {
      return { success: false, error: "Cannot connect to auth gateway" };
    }
  };

  const register = async (name: string, email: string, password?: string, role?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          password: password || "decksmith2026",
          role: role || "Hardware Hacker",
        }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ds_auth_token", data.token);
        soundFx.playConfirm();
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch {
      return { success: false, error: "Cannot connect to auth gateway" };
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser((prev) => (prev ? { ...prev, ...updated } : updated));
        soundFx.playConfirm();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const quickSwitchBuilder = async (builder: UserProfile) => {
    setUser(builder);
    soundFx.playConfirm();
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: builder.email }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("ds_auth_token", data.token);
        }
      }
    } catch {
      // ignore
    }
  };

  const logout = () => {
    soundFx.playClick();
    setUser(null);
    setToken(null);
    localStorage.removeItem("ds_auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && user.email !== "guest@decksmith.local",
        isLoading,
        login,
        register,
        logout,
        quickSwitchBuilder,
        updateUserProfile,
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
