import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Check authentication status on initial load with more resilience
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['/api/user'],
    // Improved configuration for authentication persistence
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false, // Avoid interrupting user experience
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh session every 10 minutes
    refetchIntervalInBackground: true // Keep refreshing even when tab is not active
  });

  useEffect(() => {
    if (data) {
      const authData = data as { isAuthenticated: boolean; user?: any; sessionExpires?: number };
      
      if (authData.isAuthenticated && authData.user) {
        // If authenticated, update auth state and localStorage
        setIsAuthenticated(true);
        setUser(authData.user);
        localStorage.setItem('ethics_workshop_auth', 'true');
        
        // Store session expiration if available
        if (authData.sessionExpires) {
          localStorage.setItem('ethics_workshop_session_expires', authData.sessionExpires.toString());
        }
      } else {
        // If not authenticated, clear auth state and localStorage
        setIsAuthenticated(false);
        setUser(null);
        
        // Only clear localStorage if we're sure authentication failed (not during loading)
        if (!isLoading) {
          localStorage.removeItem('ethics_workshop_auth');
          localStorage.removeItem('ethics_workshop_session_expires');
        }
      }
    }
  }, [data, isLoading]);

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/logout', {}),
    onSuccess: () => {
      setIsAuthenticated(false);
      setUser(null);
    },
  });

  // Check for stored auth on component mount
  useEffect(() => {
    const checkStoredAuth = async () => {
      // If we have a stored auth flag but aren't authenticated yet, trigger a refetch
      const hasStoredAuth = localStorage.getItem('ethics_workshop_auth') === 'true';
      if (hasStoredAuth && !isAuthenticated && !isLoading) {
        await refetch();
      }
    };
    
    checkStoredAuth();
  }, [isAuthenticated, isLoading, refetch]);

  const login = () => {
    // Set a flag in localStorage for better persistence
    localStorage.setItem('ethics_workshop_auth', 'true');
    refetch();
  };

  const logout = async () => {
    // Remove the auth flag on logout
    localStorage.removeItem('ethics_workshop_auth');
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
