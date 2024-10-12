import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'chart.js/auto'
import 'chartjs-adapter-luxon'
import App from './App.tsx'


import 'normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
// import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import '@blueprintjs/select/lib/css/blueprint-select.css'
import './index.css'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
