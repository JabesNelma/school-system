"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { getStorage, setStorage, removeStorage, isClient } from "@/lib/utils";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const token = getStorage("access_token");
      const storedUser = getStorage("user");
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      // Try to get current user from API
      try {
        const response = await authApi.getCurrentUser();
        if (response.success) {
          setUser(response.data);
          setStorage("user", response.data);
          setIsLoading(false);
          return true;
        }
      } catch (error) {
        // API call failed, try using stored user
        if (storedUser) {
          setUser(storedUser);
          setIsLoading(false);
          return true;
        }
      }
      
      setUser(null);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(username, password);
      
      if (response.success) {
        setUser(response.data.user);
        setIsLoading(false);
        return { success: true, message: response.message };
      }
      
      setIsLoading(false);
      return { success: false, message: response.message };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        message: error.message || "Login failed. Please try again." 
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      setIsLoading(false);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      removeStorage("access_token");
      removeStorage("refresh_token");
      removeStorage("user");
      setUser(null);
      setIsLoading(false);
      router.push("/admin/login");
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/admin/login");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}