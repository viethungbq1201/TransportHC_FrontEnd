import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/ThemeProvider';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UserListPage from '@/pages/UserListPage';
import TruckListPage from '@/pages/TruckListPage';
import RouteListPage from '@/pages/RouteListPage';
import CategoryListPage from '@/pages/CategoryListPage';
import ProductListPage from '@/pages/ProductListPage';
import InventoryListPage from '@/pages/InventoryListPage';
import TransactionListPage from '@/pages/TransactionListPage';
import TransactionDetailListPage from '@/pages/TransactionDetailListPage';
import ScheduleListPage from '@/pages/ScheduleListPage';
import CostTypeListPage from '@/pages/CostTypeListPage';
import CostListPage from '@/pages/CostListPage';
import SalaryReportPage from '@/pages/SalaryReportPage';
import ReportPage from '@/pages/ReportPage';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AuthProvider>
                        <Routes>
                            {/* Public */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected — any authenticated user */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<AppLayout><DashboardPage /></AppLayout>} path="/dashboard" />

                                {/* Users — requires VIEW_USER permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_USER']}>
                                        <AppLayout><UserListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/users" />

                                {/* Trucks — requires VIEW_TRUCK permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_TRUCK']}>
                                        <AppLayout><TruckListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/trucks" />

                                {/* Routes — requires VIEW_ROUTE permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_ROUTE']}>
                                        <AppLayout><RouteListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/routes" />

                                {/* Categories — requires VIEW_CATEGORY permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_CATEGORY']}>
                                        <AppLayout><CategoryListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/categories" />

                                {/* Products — requires VIEW_PRODUCT permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_PRODUCT']}>
                                        <AppLayout><ProductListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/products" />

                                {/* Inventory — requires VIEW_INVENTORY permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_INVENTORY']}>
                                        <AppLayout><InventoryListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/inventory" />

                                {/* Transactions — requires VIEW_TRANSACTION permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_TRANSACTION']}>
                                        <AppLayout><TransactionListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/transactions" />

                                {/* Transaction Details — requires VIEW_TRANSACTION_DETAIL permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_TRANSACTION_DETAIL']}>
                                        <AppLayout><TransactionDetailListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/transaction-details" />

                                {/* Schedules — requires VIEW_SCHEDULE permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_SCHEDULE']}>
                                        <AppLayout><ScheduleListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/schedules" />

                                {/* Cost Types — requires VIEW_COST_TYPE permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_COST_TYPE']}>
                                        <AppLayout><CostTypeListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/cost-types" />

                                {/* Costs — requires VIEW_COST permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_COST']}>
                                        <AppLayout><CostListPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/costs" />

                                {/* Salary Reports — requires VIEW_SALARY_REPORT permission */}
                                <Route element={
                                    <ProtectedRoute requiredPermissions={['VIEW_SALARY_REPORT']}>
                                        <AppLayout><SalaryReportPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/salary-reports" />

                                {/* Reports — ADMIN, MANAGER, ACCOUNTANT */}
                                <Route element={
                                    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'ACCOUNTANT']}>
                                        <AppLayout><ReportPage /></AppLayout>
                                    </ProtectedRoute>
                                } path="/reports" />
                            </Route>

                            {/* Redirects */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </QueryClientProvider>
    );
}

export default App;
