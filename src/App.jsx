import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

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
import ScheduleListPage from '@/pages/ScheduleListPage';
import CostTypeListPage from '@/pages/CostTypeListPage';
import CostListPage from '@/pages/CostListPage';
import SalaryReportPage from '@/pages/SalaryReportPage';
import ReportPage from '@/pages/ReportPage';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<AppLayout><DashboardPage /></AppLayout>} path="/dashboard" />
                            <Route element={<AppLayout><UserListPage /></AppLayout>} path="/users" />
                            <Route element={<AppLayout><TruckListPage /></AppLayout>} path="/trucks" />
                            <Route element={<AppLayout><RouteListPage /></AppLayout>} path="/routes" />
                            <Route element={<AppLayout><CategoryListPage /></AppLayout>} path="/categories" />
                            <Route element={<AppLayout><ProductListPage /></AppLayout>} path="/products" />
                            <Route element={<AppLayout><InventoryListPage /></AppLayout>} path="/inventory" />
                            <Route element={<AppLayout><TransactionListPage /></AppLayout>} path="/transactions" />
                            <Route element={<AppLayout><ScheduleListPage /></AppLayout>} path="/schedules" />
                            <Route element={<AppLayout><CostTypeListPage /></AppLayout>} path="/cost-types" />
                            <Route element={<AppLayout><CostListPage /></AppLayout>} path="/costs" />
                            <Route element={<AppLayout><SalaryReportPage /></AppLayout>} path="/salary-reports" />
                            <Route element={<AppLayout><ReportPage /></AppLayout>} path="/reports" />
                        </Route>

                        {/* Redirects */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </QueryClientProvider>
    );
}

export default App;
