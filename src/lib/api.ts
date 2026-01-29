import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config/env';

// API instances
export const apiServer = axios.create({
    baseURL: `${config.apiUrl}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    maxContentLength: 10 * 1024 * 1024, // 10MB
    maxBodyLength: 10 * 1024 * 1024, // 10MB
});

export const apiFile = axios.create({
    baseURL: config.fileApiUrl,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

// =====================================================
// Token Refresh Queue Management
// =====================================================
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// =====================================================
// Request Interceptor - Add Auth Token
// =====================================================
apiServer.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// =====================================================
// Response Interceptor - Handle Errors & Auto Refresh
// =====================================================
apiServer.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const serverMessage = error.response?.data?.message;
        const statusCode = error.response?.status;

        // Handle 401 Unauthorized - Attempt Token Refresh
        if (statusCode === 401 && originalRequest && !originalRequest._retry) {
            // Skip refresh for auth endpoints to prevent infinite loops
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiServer(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = typeof window !== 'undefined'
                ? localStorage.getItem('refreshToken')
                : null;

            if (!refreshToken) {
                // No refresh token available, clear auth and redirect
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // Call refresh token endpoint
                const response = await axios.post(
                    `${config.apiUrl}/api/auth/refresh`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data.success && response.data.data) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Save new tokens
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                        // Update cookie
                        document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
                    }

                    // Update authorization header
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }

                    // Process queued requests
                    processQueue(null, accessToken);
                    isRefreshing = false;

                    // Retry original request
                    return apiServer(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                // Refresh failed, clear auth and redirect
                processQueue(refreshError, null);
                isRefreshing = false;

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');

                    // Clear cookie
                    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

                    // Redirect to login immediately
                    console.warn('Session expired. Redirecting to login...');
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        // Handle 429 Rate Limit
        if (statusCode === 429) {
            console.warn('Rate limit exceeded:', serverMessage);
        }

        // Create a more informative error
        const enhancedError = new Error(
            serverMessage || error.message || `Request failed with status code ${statusCode}`
        );
        (enhancedError as any).statusCode = statusCode;
        (enhancedError as any).originalError = error;
        (enhancedError as any).response = error.response;

        return Promise.reject(enhancedError);
    }
);

export default apiServer;
