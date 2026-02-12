import React, { useState, useEffect } from 'react';
import { Truck, TrendingUp, Calendar, DollarSign, Package, BarChart3, AlertTriangle } from 'lucide-react';
import truckService from '@/services/truckService';
import scheduleService from '@/services/scheduleService';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
    const [stats, setStats] = useState({
        availableTrucks: 0,
        activeSchedules: 0,
        pendingTransactions: 0,
        totalRevenue: '$0',
        totalTrucks: 0,
        totalCosts: '$0',
        lowStockItems: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const results = await Promise.allSettled([
                    truckService.getAllTrucks(),
                    scheduleService.getAllSchedules(),
                ]);

                const trucks = results[0].status === 'fulfilled' ? (results[0].value || []) : [];
                const schedules = results[1].status === 'fulfilled' ? (results[1].value || []) : [];

                const truckList = Array.isArray(trucks) ? trucks : [];
                const scheduleList = Array.isArray(schedules) ? schedules : [];

                setStats({
                    availableTrucks: truckList.filter(t => t.status === 'AVAILABLE').length,
                    activeSchedules: scheduleList.filter(s => s.status === 'RUNNING').length,
                    pendingTransactions: 0,
                    totalRevenue: '$0',
                    totalTrucks: truckList.length,
                    totalCosts: '$0',
                    lowStockItems: 0,
                });
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening with your fleet.</p>
            </div>

            {/* Top row - 4 main stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard title="Available Trucks" value={stats.availableTrucks} icon={Truck} color="bg-blue-50 text-blue-600" subtitle="vs last month" />
                <StatCard title="Active Schedules" value={stats.activeSchedules} icon={Calendar} color="bg-green-50 text-green-600" />
                <StatCard title="Pending Transactions" value={stats.pendingTransactions} icon={Package} color="bg-orange-50 text-orange-600" />
                <StatCard title="Total Revenue" value={stats.totalRevenue} icon={DollarSign} color="bg-emerald-50 text-emerald-600" subtitle="+12% vs last month" />
            </div>

            {/* Second row - 3 smaller stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Trucks" value={stats.totalTrucks} icon={Truck} color="bg-slate-100 text-slate-600" />
                <StatCard title="Total Costs" value={stats.totalCosts} icon={TrendingUp} color="bg-red-50 text-red-600" />
                <StatCard title="Low Stock Items" value={stats.lowStockItems} icon={AlertTriangle} color="bg-yellow-50 text-yellow-600" />
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Schedule Status Overview</h2>
                    <div className="flex items-center justify-center h-48 text-slate-400">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No schedule data available</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Fleet Status</h2>
                    <div className="flex items-center justify-center h-48 text-slate-400">
                        <div className="text-center">
                            <Truck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No fleet data available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
