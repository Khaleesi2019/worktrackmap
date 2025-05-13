import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isLoading: boolean;
  isInitialized: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  name: string;
  role?: string;
  jobTitle?: string;
  task?: string;
  emoji?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { connect, disconnect } = useWebSocket();

  // Fetch current user data from session
  const { data: user, isLoading: isUserLoading, refetch } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) return null;
          throw new Error('Failed to fetch user data');
        }
        return await res.json() as User;
      } catch (err) {
        console.error('Error fetching user data:', err);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Initialize the auth system
  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Connect to WebSocket when we have a logged-in user
        connect(user.id);
      }
      setIsInitialized(true);
    }
  }, [user, isUserLoading, connect]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid username or password. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      // Refetch user data after successful login
      await refetch();
      
      // If we have a user, connect to WebSocket
      if (user) {
        connect(user.id);
      }
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/register", userData);
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Registration Failed",
          description: errorData.message || "Could not create account. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      // Refetch user data after successful registration (user is auto-logged in)
      await refetch();
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created and you are now logged in."
      });
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      // Call the logout API endpoint
      const response = await apiRequest("POST", "/api/logout");
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      // Disconnect from WebSocket
      disconnect();
      
      // Clear all query cache
      queryClient.clear();
      
      // Refetch user (which will return null)
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: user || null, 
        login, 
        register,
        logout, 
        isLoading: isUserLoading,
        isInitialized
      }}
    >
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
