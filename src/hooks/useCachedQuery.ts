"use client";

import { useEffect, useState } from "react";

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Simple in-memory cache with TTL support
const queryCache = new Map<string, CachedData<any>>();

/**
 * Hook for caching query results to reduce redundant API calls
 * @param key Unique cache key for this query
 * @param queryFn Async function that fetches the data
 * @param ttl Time-to-live in milliseconds (default: 5 minutes)
 * @returns Query state with data, loading, and error
 */
export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Check cache first
      const cached = queryCache.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < ttl) {
        if (isMounted) {
          setState({ data: cached.data, loading: false, error: null });
        }
        return;
      }

      // Cache miss or expired - fetch fresh data
      try {
        const data = await queryFn();
        
        if (isMounted) {
          // Update cache
          queryCache.set(key, { data, timestamp: now });
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [key, queryFn, ttl]);

  return state;
}

/**
 * Clear a specific cache entry or all cache entries
 * @param key Cache key to clear (if not provided, clears all)
 */
export function clearQueryCache(key?: string): void {
  if (key) {
    queryCache.delete(key);
  } else {
    queryCache.clear();
  }
}

/**
 * Manually set cache data (useful for optimistic updates)
 * @param key Cache key
 * @param data Data to cache
 */
export function setCachedData<T>(key: string, data: T): void {
  queryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get cached data without triggering a fetch
 * @param key Cache key
 * @returns Cached data or null
 */
export function getCachedData<T>(key: string): T | null {
  const cached = queryCache.get(key);
  return cached ? cached.data : null;
}
