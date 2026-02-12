import axiosInstance from '@/api/axiosInstance';

const authService = {
    /**
     * Login with username and password
     * POST /auth/login
     * @param {{ username: string, password: string }} credentials
     * @returns {Promise<{ accessToken: string }>}
     */
    login: async (credentials) => {
        const response = await axiosInstance.post('/auth/login', {
            username: credentials.username,
            password: credentials.password,
        });
        return response;
    },
    // No getMyInfo endpoint in API docs. User info is returned in login response.

};

export default authService;
