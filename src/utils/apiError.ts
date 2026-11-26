import axios from "axios";

/**
 * Normalized error thrown by every service call, so UI code never has to
 * dig through Axios internals. Mirrors the backend error envelope
 * ({ message, code, statusCode, errors? }) plus a network flag.
 */
export interface ApiError {
    status?: number;
    code?: string;
    message: string;
    /** Field -> messages, sent by the backend on 422 (and 409 duplicates) */
    fieldErrors?: Record<string, string[]>;
    /** true when the request never reached the server (offline, timeout, CORS) */
    isNetworkError: boolean;
}

interface BackendErrorBody {
    message?: string;
    code?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export const toApiError = (error: unknown): ApiError => {
    if (!axios.isAxiosError(error)) {
        return { message: "Something went wrong. Please try again.", isNetworkError: false };
    }

    const body = error.response?.data as BackendErrorBody | undefined;

    return {
        status: error.response?.status,
        code: body?.code,
        message: body?.message
            ?? (error.response ? "Request failed." : "Network error. Check your connection."),
        fieldErrors: body?.errors,
        isNetworkError: !error.response,
    };
};
