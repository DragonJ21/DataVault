import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth-token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('auth-token', data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, email, password }: { username: string; email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', { username, email, password });
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('auth-token', data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (username: string, email: string, password: string) => {
    await registerMutation.mutateAsync({ username, email, password });
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth-token');
    queryClient.clear();
  };

  // Set Authorization header for requests
  useEffect(() => {
    if (token) {
      const originalFetch = window.fetch;
      window.fetch = function(input, init = {}) {
        return originalFetch(input, {
          ...init,
          headers: {
            ...init.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
      };
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user: user?.user || null,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
