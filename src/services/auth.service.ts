import { apiClient } from "../api/axiosClient";
import type { RegisterFormData, RegisterResponse } from "../types/auth.types";

export type RegisterPayload = Omit<RegisterFormData, "accept">;

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
    return data;
};