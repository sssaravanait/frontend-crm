import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Remember where the user was going so login can send them back
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location}} />;
    }

    return <Outlet />
}