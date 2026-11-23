import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../types/user.types";
import { authStorage, type StoredAuth } from "../utils/authStorage";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    // Lazy initializer reads storage once, on mount
    const [auth, setAuth] = useState<StoredAuth | null>(() => authStorage.load());

    const login = useCallback((token: string, user: AuthUser) => {
        const next = { token, user };
        authStorage.save(next);
        setAuth(next);
    }, []);

    const logout = useCallback(() => {
        authStorage.clear();
        setAuth(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: auth?.user ?? null,
            token: auth?.token ?? null,
            isAuthenticated: auth !== null,
            login,
            logout,
        }),
        [auth, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}