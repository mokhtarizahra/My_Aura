import api from "@/lib/client";
import {
    AuthResponse,
    MessageResponse,
    SessionsResponse,
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

export const logout = async (refreshToken: string | null): Promise<MessageResponse> => {
    try {
        const { data } = await api.post("/auth/logout", { refreshToken });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی در خروج از حساب رخ داد";
        throw new Error(message);
    }
};

export const setPassword = async (password: string, resetToken: string): Promise<AuthResponse> => {
    try {
        const { data } = await api.post(
            "/auth/set-password",
            { password },
            { headers: { Authorization: `Bearer ${resetToken}` } }
        );
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی در تنظیم رمز عبور رخ داد";
        throw new Error(message);
    }
};

export const getSessions = async (): Promise<SessionsResponse> => {
    try {
        const { data } = await api.get("/auth/sessions");
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی در دریافت لیست نشست‌ها رخ داد";
        throw new Error(message);
    }
};


export const revokeSession = async (id: string): Promise<MessageResponse> => {
    try {
        const { data } = await api.delete(`/auth/sessions/${id}`);
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطایی در بستن نشست رخ داد";
        throw new Error(message);
    }
};
