import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { router } from '@/routes'
import { queryClient } from '@/lib/queryClient'
import { LocalizationProvider } from '@/context/LocalizationContext'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <RouterProvider router={router} />
      </LocalizationProvider>
    </QueryClientProvider>
  </StrictMode>
)
