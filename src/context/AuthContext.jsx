import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '@/services/authService';

const AuthContext = createContext(null);

/**
 * Decode a JWT payload without a library.
 * Returns the parsed JSON payload, or null on failure.
 */
function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Extract user info from a JWT payload.
 * Backend JWT claims structure:
 *   { sub: "username", roles: ["ADMIN","DRIVER"], permissions: ["READ","WRITE"], iat, exp, jti }
 * Note: "roles" is a JSON array, NOT a space-separated "scope" string.
 */
function extractUserFromToken(token) {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    return {
        username: payload.sub,
        // roles comes as an array: ["ADMIN", "DRIVER"]
        roles: Array.isArray(payload.roles) ? payload.roles : [],
        // permissions comes as an array: ["READ", "WRITE"]
        permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
        tokenExp: payload.exp,
    };
}

/**
 * Check if a JWT token is expired (client-side only, no backend call needed)
 */
function isTokenExpired(token) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;
    // exp is in seconds, Date.now() is in ms
    return Date.now() >= payload.exp * 1000;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: check stored token validity (client-side)
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        // Client-side token expiry check (no introspect endpoint exists)
        if (isTokenExpired(token)) {
            // Token expired — clear everything
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setIsLoading(false);
            return;
        }

        // Token is still valid — decode user info
        const userInfo = extractUserFromToken(token);
        if (userInfo) {
            // Merge with any cached extra info
            const cached = localStorage.getItem('user');
            const cachedUser = cached ? JSON.parse(cached) : {};
            setUser({ ...cachedUser, ...userInfo });
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
        setIsLoading(false);
    };

    const login = useCallback(async (credentials) => {
        // authService.login returns the unwrapped `result` from ApiResponse
        // Backend returns AuthResponse: { token: "jwt_string" }
        const data = await authService.login(credentials);

        const token = data?.token || data?.accessToken;
        if (!token) {
            throw { code: 0, message: 'No token received from server' };
        }
        localStorage.setItem('accessToken', token);

        // Decode JWT to extract user info
        // JWT payload: { sub, roles: ["ADMIN"], permissions: ["READ"], exp, iat, jti }
        const userInfo = extractUserFromToken(token) || { username: credentials.username, roles: [] };
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        setIsAuthenticated(true);
        return data;
    }, []);

    const logout = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        try {
            if (token) await authService.logout(token);
        } catch {
            // Ignore logout errors
        }
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
