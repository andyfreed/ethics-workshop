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
    // Add error handling to prevent failures when backend is not available
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: false, // Don't run this query automatically since our backend isn't running
    queryFn: async () => {
      try {
        return await apiRequest('GET', '/api/user');
      } catch (error) {
        console.warn('Auth API unavailable, using offline mode');
        return { isAuthenticated: false, user: null };
      }
    }
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
    mutationFn: async () => {
      try {
        return await apiRequest('POST', '/api/logout', {});
      } catch (error) {
        console.warn('Logout API unavailable, using offline mode');
        return null;
      }
    },
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
