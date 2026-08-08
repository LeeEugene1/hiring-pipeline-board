import {
  QueryClient,
  QueryClientProvider,
  type QueryClientProviderProps,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

type AppProvidersProps = {
  children: ReactNode
  client?: QueryClientProviderProps['client']
}

export function AppProviders({ children, client = queryClient }: AppProvidersProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
