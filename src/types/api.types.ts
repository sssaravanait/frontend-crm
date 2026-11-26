/**
 * Envelope every successful backend response is wrapped in ({ success, data }).
 * Error responses are NOT wrapped: they send { message, code, statusCode, errors? }
 * directly (see backend error.middleware.ts) — handled in utils/apiError.ts.
 */
export interface ApiEnvelope<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}
