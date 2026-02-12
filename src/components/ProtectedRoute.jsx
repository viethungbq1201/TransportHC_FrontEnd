import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute - Route guard for authenticated routes
 *
 * Usage:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   } />
 *
 *   <Route path="/admin" element={
 *     <ProtectedRoute requiredRole="ADMIN">
 *       <AdminPage />
 *     </ProtectedRoute>
 *   } />
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (requiredRole && user?.roleCode !== requiredRole) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
                <div className="max-w-md p-8 bg-white rounded-xl shadow-lg border text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
                    <p className="text-slate-600">Bạn không có quyền truy cập trang này.</p>
                </div>
            </div>
        );
    }

    return children || <Outlet />;
};

export default ProtectedRoute;
