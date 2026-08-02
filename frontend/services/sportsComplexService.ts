import api from "@/lib/client";
import {
    CategoryDisplay,
    SportsComplex,
    SportsComplexFilters,
    PaginationParams,
    PaginatedResult,
    Review,
    Coach,
    Service
} from "@/types/sportsComplex";
import { CATEGORIES } from "@/lib/constants/categories";

// ─── Get categories for homepage display ─────────────────────
export const getCategories = async (): Promise<CategoryDisplay[]> => {
    try {
        // 🔴 در آینده با API واقعی جایگزین می‌شود:
        // const { data } = await api.get("/categories");
        // return data;

        await new Promise((resolve) => setTimeout(resolve, 400));
        return CATEGORIES;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در دریافت دسته‌بندی‌ها";
        throw new Error(message);
    }
};

// ─── Get a list of sports collections with filters and pagination ─────────────────────
export const getSportsComplexes = async (
    filters: SportsComplexFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResult<SportsComplex>> => {
    try {
        const { data } = await api.get("/sports-complexes", {
            params: { ...filters, ...pagination }
        });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در دریافت لیست مجموعه‌های ورزشی";
        throw new Error(message);
    }
};

// ─── Get details of a sports complex based on slug ─────────────────────
export const getSportsComplexesSlug = async (slug: string): Promise<SportsComplex> => {
    try {
        const { data } = await api.get(`/sports-complexes/${slug}`);
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در دریافت اطلاعات مجموعه ورزشی";
        throw new Error(message);
    }
};

// ─── Get a list of coaches for a sports complex ─────────────────────
export const getCoaches = async (complexId: string): Promise<Coach[]> => {
    try {
        const { data } = await api.get(`/sports-complexes/${complexId}/coaches`);
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در دریافت لیست مربیان";
        throw new Error(message);
    }
};

// ─── Get a list of services for a sports complex ─────────────────────
export const getServices = async (complexId: string): Promise<Service[]> => {
    try {
        const { data } = await api.get(`/sports-complexes/${complexId}/services`);
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در دریافت لیست سرویس‌ها";
        throw new Error(message);
    }
};

// ─── Get opinions about a sports complex ─────────────────────
export const getReviews = async (
    complexId: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResult<Review>> => {
    try {
        const { data } = await api.get(`/sports-complexes/${complexId}/reviews`, {
            params: pagination
        });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در دریافت لیست سرویس‌ها";
        throw new Error(message);
    }
};

// ─── Post a new comment ─────────────────────
export const submitReviews = async (
    complexId: string,
    review: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResult<Review>> => {
    try {
        const { data } = await api.post(`/sports-complexes/${complexId}/reviews`, review);
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در ثبت نظر";
        throw new Error(message);
    }
};

// ─── Search for sports complexes  ─────────────────────
export const searchSportsComplexes = async (query: string): Promise<SportsComplex[]> => {
    try {
        const { data } = await api.post("/sports-complexes/search", {
            params: { q: query }
        });
        if (data.success === false) throw new Error(data.message);
        return data;
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "خطا در جستجو";
        throw new Error(message);
    }
};