import axios from "axios";

const refreshApi = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Interceptor request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // if error 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if(isRefreshing) {
        return new Promise((resolve , reject) => {
          failedQueue.push({resolve , reject});
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
      } 

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = sessionStorage.getItem("refreshToken");

      try {
        const { data } = await refreshApi.post("/auth/refresh-token", {
          refreshToken: storedRefreshToken 
        });
          
        // update tokens in memory
        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        
        processQueue(null, data.accessToken);
        
        // replay the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token is also invalid, the user must be logged out
        processQueue(refreshError, null);
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
