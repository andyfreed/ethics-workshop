import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | null | undefined,
): Promise<any> {
  try {
    const headers: Record<string, string> = {};
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    
    // Add cache-busting for GET requests to prevent browser caching
    const urlWithCacheBusting = method === 'GET' 
      ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` 
      : url;
    
    // Use the environment variable if available, otherwise default to localhost:5002
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    const fullUrl = `${baseUrl}${urlWithCacheBusting}`;
    
    // Add detailed logging for auth-related requests
    if (url.includes('/api/login') || url.includes('/api/user')) {
      console.log(`API Request: ${method} ${fullUrl}`, data ? { data } : '');
    }
    
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      mode: 'cors'
    });

    // Log the response headers for debugging CORS issues
    if (url.includes('/api/login') || url.includes('/api/user')) {
      console.log('Response headers:', {
        'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': res.headers.get('access-control-allow-credentials')
      });
    }
    
    await throwIfResNotOk(res);
    
    const responseData = res.status === 204 ? null : await res.json();
    
    // Log auth-related responses
    if (url.includes('/api/login') || url.includes('/api/user')) {
      console.log(`API Response: ${method} ${url}`, responseData);
    }
    
    return responseData;
  } catch (err) {
    console.error(`API request failed: ${method} ${url}`, err);
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Add cache-busting to prevent browser caching
      const url = queryKey[0] as string;
      
      // Handle development mode without backend
      if (process.env.NODE_ENV === 'development' && url.startsWith('/api')) {
        console.warn(`Development mode: Simulating query to ${url}`);
        
        // Return mock data that will be cast to T by TypeScript
        const mockData = url === '/api/user' 
          ? { isAuthenticated: false, user: null }
          : { message: "Query endpoint not available in development mode" };
          
        return mockData as any;
      }
      
      const urlWithCacheBusting = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      
      const res = await fetch(urlWithCacheBusting, {
        credentials: "include",
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: "no-store"
      });

      // Log the response headers for debugging CORS issues
      if (url.includes('/api/user')) {
        console.log('Query Response headers:', {
          'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
          'access-control-allow-credentials': res.headers.get('access-control-allow-credentials')
        });
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.warn(`Auth error on ${url} - using fallback behavior`);
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`Query error (${queryKey[0]}):`, error);
      
      // In development mode, return mock data instead of throwing errors
      if (process.env.NODE_ENV === 'development') {
        const url = queryKey[0] as string;
        const mockData = url === '/api/user'
          ? { isAuthenticated: false, user: null }
          : { mock: true };
          
        return mockData as any;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Changed to true to refresh on focus
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
      retry: 1, // Allow one retry
    },
    mutations: {
      retry: 1, // Allow one retry
    },
  },
});
