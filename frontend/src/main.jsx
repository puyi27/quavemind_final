import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos: la info se considera fresca
      gcTime: 1000 * 60 * 10,   // 10 minutos de vida en la memoria
      refetchOnWindowFocus: false, // para que no recargue al cambiar de pestaña
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
