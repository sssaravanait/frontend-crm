import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/AuthProvider';
import AppRouter from "./routes/index";
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    </StrictMode>,
)
