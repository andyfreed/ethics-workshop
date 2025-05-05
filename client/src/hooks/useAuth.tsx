import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Check authentication status on initial load
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['/api/user'],
    // Will be authenticated if the user is logged in
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  useEffect(() => {
    if (data) {
      const authData = data as { isAuthenticated: boolean; user?: any };
      setIsAuthenticated(authData.isAuthenticated);
      setUser(authData.user || null);
    }
  }, [data]);

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/logout', {}),
    onSuccess: () => {
      setIsAuthenticated(false);
      setUser(null);
    },
  });

  const login = () => {
    refetch();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
