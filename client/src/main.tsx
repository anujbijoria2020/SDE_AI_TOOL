import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/queryClient'
import mermaid from 'mermaid'
import './index.css'
import App from './App.tsx'

mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'default',
  securityLevel: 'loose'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
