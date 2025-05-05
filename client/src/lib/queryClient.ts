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
    
    const res = await fetch(urlWithCacheBusting, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Always include credentials for session cookies
      cache: "no-store" // Prevent caching
    });

    await throwIfResNotOk(res);
    
    // For non-GET methods or empty responses, just return the response object
    if (method !== 'GET' || res.status === 204) {
      return res;
    }
    
    // For GET requests, parse the JSON and return the data
    return await res.json();
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
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
      const urlWithCacheBusting = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      
      const res = await fetch(urlWithCacheBusting, {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: "no-store"
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.warn(`Auth error on ${url} - using fallback behavior`);
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`Query error (${queryKey[0]}):`, error);
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
