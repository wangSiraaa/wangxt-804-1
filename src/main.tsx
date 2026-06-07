import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorkstationStore } from '@/store/useWorkstationStore'

useAuthStore.getState().initUsers()
useWorkstationStore.getState().initData(useAuthStore.getState().users)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
