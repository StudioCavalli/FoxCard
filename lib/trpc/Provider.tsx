'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { trpc } from './client'
import superjson from 'superjson'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  }))

  const [trpcClient] = useState(() => {
    // Determine the base URL
    // In browser: use current origin
    // In SSR: use NEXT_PUBLIC_APP_URL or fallback to localhost
    const getBaseUrl = () => {
      if (typeof window !== 'undefined') {
        // Browser: use current origin
        return window.location.origin
      }

      // SSR: use env variable or fallback
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL
      }

      // Development fallback
      return 'http://localhost:3000'
    }

    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  })

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}
