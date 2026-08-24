import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { RepositoriesProvider } from './repositories/repositoriesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RepositoriesProvider>
        <App />            
        <Toaster
          position="top-right"
          toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
    </RepositoriesProvider>
    </BrowserRouter>
  </StrictMode>,
)
