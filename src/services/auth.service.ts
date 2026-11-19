import { apiClient } from "../api/axiosClient";
import type { LoginFormData, RegisterFormData, RegisterResponse, LoginResponse } from "../types/auth.types";

export type RegisterPayload = Omit<RegisterFormData, "accept">;
export type LoginPayload = Omit<LoginFormData, "accept">;

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
    return data;
};

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
    return data;
}