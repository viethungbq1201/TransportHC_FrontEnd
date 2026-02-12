import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '@/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: check if we have a stored token and try to load user info
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const userInfo = await authService.getMyInfo();
            setUser(userInfo);
            setIsAuthenticated(true);
        } catch (error) {
            // Token is invalid or expired — clean up
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (credentials) => {
        // authService.login returns the unwrapped `result` from ApiResponse
        // Backend returns: { accessToken: "eyJ..." }
        const data = await authService.login(credentials);

        // Extract the accessToken from the response
        const token = data?.accessToken || data?.token;
        if (!token) {
            throw { code: 0, message: 'Không nhận được token từ máy chủ' };
        }
        localStorage.setItem('accessToken', token);

        // Fetch user info after login
        try {
            const userInfo = await authService.getMyInfo();
            setUser(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo));
        } catch {
            // If getMyInfo fails, still set authenticated with basic info
            const basicUser = { username: credentials.username };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
        }

        setIsAuthenticated(true);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    }, []);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
