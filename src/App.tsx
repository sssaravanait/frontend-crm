import { lazy, Suspense } from "react";
import { Route, Routes } from 'react-router-dom';

const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export default function App() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
            <Routes>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage /> } />
            </Routes>
        </Suspense>
    )
}