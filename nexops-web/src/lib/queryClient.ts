import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30 s padrão para todas as queries
      retry: 1,                   // 1 tentativa extra em falha de rede
      refetchOnWindowFocus: false, // não re-busca ao focar janela
    },
  },
})
