import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ROUTES } from '@/constants/routes';
import { storage } from './storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueuedRequest {
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// ─── Queue for concurrent requests ────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

     if (error.response?.status === 403) {
      // Run only in a browser environment
      if (typeof window !== 'undefined') {
        // Clearing tokens (optional – since the user does not have access)
        storage.removeAccessToken();
        storage.removeRefreshToken();
        
        // Go to page 403
        window.location.href = ROUTES.FORBIDDEN;
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = storage.getRefreshToken();

      // If no refresh token, logout immediately
      if (!storedRefreshToken) {
        sessionStorage.clear();
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(error);
      }

      try {
        // Create a temporary axios instance without interceptors to avoid infinite loop
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken } = refreshResponse.data;

        // Update tokens in storage
        storage.setAccessToken(accessToken);
        storage.setRefreshToken(refreshToken);

        window.dispatchEvent(
          new CustomEvent('tokensRefreshed', {
            detail: { accessToken, refreshToken },
          })
        );
        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is also invalid, logout
        processQueue(refreshError, null);
        sessionStorage.clear();
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api;
