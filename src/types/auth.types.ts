export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    data?: {
        user?: {
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt: string;
            updatedAt: string;
        }
    };
    error?: {
        code: string;
        message: string;
    }
}