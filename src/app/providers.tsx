// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh
        staleTime: 2 * 60 * 1000, // 2 minutes
        // Cache time: how long data stays in cache when not used
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        // Retry failed requests
        retry: (failureCount, error) => {
          // Don't retry on 404s
          if (error instanceof Error && error.message.includes('404')) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        // Background refetch when window regains focus
        refetchOnWindowFocus: true,
        // Background refetch when reconnecting
        refetchOnReconnect: true,
        // Refetch stale data on mount
        refetchOnMount: true,
      },
      mutations: {
        // Global error handling for mutations
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
