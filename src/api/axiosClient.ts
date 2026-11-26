import axios from "axios";
import { authStorage } from "../utils/authStorage";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// Expired or invalid token: clear the session and return to login
apiClient.interceptors.response.use(
    response => response,
    error => {
        const isLoginRequest = error.config?.url?.endsWith("/auth/login");
        // Skip the redirect for login itself, so wrong passwords show a form error
        if (axios.isAxiosError(error) && error.response?.status === 401 && !isLoginRequest) {
            authStorage.clear();
            window.location.assign("/login");
        }
        return Promise.reject(error);
    },
);