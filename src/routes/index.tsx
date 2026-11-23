import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

// Lazy-load pages so each one ships as its own chunk
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const CustomersPage = lazy(() => import("../pages/CustomersPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

const router = createBrowserRouter([
    // Public, guest-only routes 
    {
        element: <GuestRoute />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> }
        ],
    },

    // Protected routes: the layout only mounts after the auth check passes
    {
        element: <ProtectedRoute />,
        children: [
            { 
                element: <AppLayout />,
                children: [
                    { path: '/dashboard', element: <DashboardPage /> },
                    { path: '/customers', element: <CustomersPage /> },
                    { path: '/settings', element: <SettingsPage /> },
                ],
            }
        ],
    },

    { path: "/", element: <Navigate to="/dashboard" replace /> }
]);

// The only export: a component
export default function AppRouter() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    );
}