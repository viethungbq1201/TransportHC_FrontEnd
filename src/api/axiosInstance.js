import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/transport',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor: Attach JWT Bearer token ───
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Unwrap ApiResponse<T> and handle errors ───
axiosInstance.interceptors.response.use(
  (response) => {
    // Backend wraps ALL responses in { code, message, result }
    const data = response.data;

    // Check if this looks like an ApiResponse
    if (data !== undefined && data !== null && typeof data === 'object' && 'code' in data) {
      // Business success: code === 1000
      if (data.code === 1000) {
        return data.result;
      }

      // Business error: code !== 1000 (even though HTTP status was 200)
      // Reject so callers handle it in .catch() / try-catch
      const businessError = {
        status: response.status,
        code: data.code,
        message: data.message || 'Thao tác thất bại',
        result: data.result,
      };
      return Promise.reject(businessError);
    }

    // Fallback: response doesn't follow ApiResponse format
    return data;
  },
  (error) => {
    const status = error.response?.status;
    const apiError = error.response?.data;

    // Handle 401 Unauthorized — token expired or invalid
    if (status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Redirect to login (avoid infinite loop if already on login page)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('Access denied (403):', apiError?.message);
    }

    // Normalize error for consumers
    const normalizedError = {
      status: status || 500,
      code: apiError?.code || status || 500,
      message: apiError?.message || error.message || 'Đã xảy ra lỗi không mong muốn',
      originalError: error,
    };

    return Promise.reject(normalizedError);
  }
);

export default axiosInstance;
