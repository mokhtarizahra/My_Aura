import api from "@/lib/api";
import {
    AuthResponse,
    MessageResponse,
    SessionsResponse,
    RefreshTokenResponse,
    VerifyOTPResponse
} from "@/types/auth";

export const requestOTP = async (phone: string): Promise<MessageResponse> => {
    try {
        const { data } = await api.post("/auth/request-otp", { phone });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی رخ داد";
        throw new Error(message);
    }
};

export const verifyOTP = async (phone: string, otp: string): Promise<VerifyOTPResponse> => {
    try {
        const { data } = await api.post("/auth/verify-otp", { phone, otp });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی رخ داد";
        throw new Error(message);
    }
};

export const loginWithPassword = async (phone: string, password: string): Promise<AuthResponse> => {
    try {
        const { data } = await api.post("/auth/login", { phone, password });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی در ورود رخ داد";
        throw new Error(message);
    }
};


export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await api.post("/auth/refresh-token", { refreshToken });
    return data;
};

export const logout = async (refreshToken: string | null): Promise<MessageResponse> => {
    const { data } = await api.post("/auth/logout", { refreshToken });
    return data;
};

export const setPassword = async (password: string, resetToken: string): Promise<AuthResponse> => {
    const { data } = await api.post(
        "/auth/set-password",
        { password },
        { headers: { Authorization: `Bearer ${resetToken}` } }
    );
    return data;
};

export const getSessions = async (): Promise<SessionsResponse> => {
    const { data } = await api.get("/auth/sessions");
    return data;
};

export const revokeSession = async (id: string): Promise<MessageResponse> => {
    const { data } = await api.delete(`/auth/sessions/${id}`);
    return data;
};
