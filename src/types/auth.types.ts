import type { AuthUser } from './user.types';

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    data?: {
        token: string;
        user: AuthUser;
    };
    error?: {
        code: string;
        message: string;
    }
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data?: {
        token: string;
        user: AuthUser;
    };
    error?: {
        code: string;
        message: string;
    }
}