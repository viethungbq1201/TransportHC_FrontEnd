import axiosInstance from '@/api/axiosInstance';

const authService = {
    /**
     * Login with username and password
     * POST /auth/login
     * Backend returns AuthResponse: { token: "jwt_string" }
     * @param {{ username: string, password: string }} credentials
     * @returns {Promise<{ token: string }>}
     */
    login: async (credentials) => {
        const response = await axiosInstance.post('/auth/login', {
            username: credentials.username,
            password: credentials.password,
        });
        return response;
    },

    /**
     * Logout (invalidate token)
     * POST /auth/logout
     * @param {string} token
     * @returns {Promise<void>}
     */
    logout: async (token) => {
        await axiosInstance.post('/auth/logout', { token });
    },

    /**
     * Refresh token — returns a new JWT
     * POST /auth/refresh
     * @param {string} token
     * @returns {Promise<{ token: string }>}
     */
    refresh: async (token) => {
        const response = await axiosInstance.post('/auth/refresh', { token });
        return response;
    },
};

export default authService;
