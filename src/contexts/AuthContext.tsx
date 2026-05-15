import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiPost, apiGet, setAuthToken, removeAuthToken, getAuthToken } from "@/lib/api";

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: "renter" | "landlord";
  verification_status?: string;
  current_package?: {
    package_id: number | null;
    package_name: string;
    package_price: string;
    status: string;
    end_date: string | null;
  };
  created_at?: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    phone: string,
    type: "renter" | "landlord"
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiGet<{ status: string; data: { user: UserData } }>('/user/profile');
        const user = res.data.user;
        setCurrentUser(user);
        localStorage.setItem('user_data', JSON.stringify(user));
      } catch {
        removeAuthToken();
        localStorage.removeItem('user_data');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    type: "renter" | "landlord"
  ) => {
    const res = await apiPost<{
      status: string;
      message: string;
      data: { user: UserData; token?: string };
    }>('/auth/register', {
      name,
      email,
      password,
      password_confirmation: password,
      phone,
      type,
    });

    // If register returns a token, use it; otherwise user needs to login
    if (res.data.token) {
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
    }
  };

  const login = async (email: string, password: string) => {
    const res = await apiPost<{
      status: string;
      message: string;
      data: { user: UserData; token: string; token_type: string; expires_in: number };
    }>('/auth/login', { email, password });

    setAuthToken(res.data.token);
    setCurrentUser(res.data.user);
    localStorage.setItem('user_data', JSON.stringify(res.data.user));
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {});
    } catch {
      // Ignore logout errors
    }
    removeAuthToken();
    localStorage.removeItem('user_data');
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await apiGet<{ status: string; data: { user: UserData } }>('/user/profile');
      const user = res.data.user;
      setCurrentUser(user);
      localStorage.setItem('user_data', JSON.stringify(user));
    } catch {
      // silently fail
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData: currentUser,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
