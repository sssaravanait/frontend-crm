import { apiClient } from "../api/axiosClient";
import type { RegisterFormData } from "../types/auth.types";

export type RegisterPayload = Omit<RegisterFormData, "accept">;

export interface RegisterResponse {
    message: string;
    user: { id: string; name: string; email: string };
}

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
    return data;
};