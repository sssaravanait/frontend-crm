import type { AuthUser } from "../types/user.types";

const STORAGE_KEY = "crm_auth";

export interface StoredAuth {
    token: string;
    user: AuthUser;
}

export const authStorage = {
    load(): StoredAuth | null {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as StoredAuth) : null;
        } catch {
            // Corrupted JSON should not crash the app
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    },
    save(auth: StoredAuth) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    },
    clear() {
        localStorage.removeItem(STORAGE_KEY);
    },
};