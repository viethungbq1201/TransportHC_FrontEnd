import React, { useState, useEffect } from 'react';
import { Truck, TrendingUp, Calendar, DollarSign, Package, BarChart3, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import truckService from '@/services/truckService';
import scheduleService from '@/services/scheduleService';
import transactionService from '@/services/transactionService';
import inventoryService from '@/services/inventoryService';
import reportService from '@/services/reportService';
import usePermissions from '@/hooks/usePermissions';

const StatCard = ({ title, value, icon: Icon, color, subtitle = '' }) => (
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

// Colors for the pie chart
const STATUS_COLORS = {
    PENDING: '#f59e0b', // amber
    IN_TRANSIT: '#3b82f6', // blue
    DONE: '#10b981', // green
    CANCELLED: '#ef4444', // red
    REJECTED: '#64748b' // slate
};

const DashboardPage = () => {
    const { isAdmin, userRoles } = usePermissions();
    const [stats, setStats] = useState({
        availableTrucks: 0,
        activeSchedules: 0,
        pendingTransactions: 0,
        totalRevenue: '$0',
        totalTrucks: 0,
        totalCosts: '$0',
        lowStockItems: 0,
    });

    const [scheduleChartData, setScheduleChartData] = useState([]);
    const [financialChartData, setFinancialChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

    // Helper to get { from, to, label } for the last N months
    const getLastNMonths = (n) => {
        const months = [];
        const now = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // Last day
            months.push({
                label: date.toLocaleString('default', { month: 'short' }),
                from: date.toISOString().split('T')[0],
                to: nextMonth.toISOString().split('T')[0]
            });
        }
        return months;
    };

    useEffect(() => {
        const loadData = async () => {
            if (!isAdmin) {
                setLoading(false);
                return; // Do not fetch full metrics for non-admins to prevent 403 errors
            }
            try {
                // Fetch core entity arrays
                const baseResults = await Promise.allSettled([
                    truckService.getAllTrucks(),
                    scheduleService.getAllSchedules(),
                    transactionService.getAllTransactions(),
                    inventoryService.getInventories()
                ]);

                const truckList = baseResults[0].status === 'fulfilled' && Array.isArray(baseResults[0].value) ? baseResults[0].value : [];
                const scheduleList = baseResults[1].status === 'fulfilled' && Array.isArray(baseResults[1].value) ? baseResults[1].value : [];
                const transactionList = baseResults[2].status === 'fulfilled' && Array.isArray(baseResults[2].value) ? baseResults[2].value : [];
                const inventoryList = baseResults[3].status === 'fulfilled' && Array.isArray(baseResults[3].value) ? baseResults[3].value : [];

                // 1. Calculate pie chart data tracking schedule distributions
                const statusCounts = scheduleList.reduce((acc, curr) => {
                    const statusStr = curr.approveStatus ? curr.approveStatus.toUpperCase() : 'UNKNOWN';
                    acc[statusStr] = (acc[statusStr] || 0) + 1;
                    return acc;
                }, {});

                const pieData = Object.keys(statusCounts).map(status => ({
                    name: status,
                    value: statusCounts[status]
                }));
                setScheduleChartData(pieData);

                // 2. Fetch 6-month historical financials in parallel
                const last6Months = getLastNMonths(6);
                const financialPromises = last6Months.map(async (m) => {
                    const reqBody = { from: m.from, to: m.to };
                    try {
                        const [systemCostRes, rewardRes] = await Promise.all([
                            reportService.reportSystemCost(reqBody).catch(() => ({ totalCost: 0 })),
                            reportService.reportRewardAllTrucks(reqBody).catch(() => [])
                        ]);

                        // Sum up all rewards to get total revenue
                        let totalRev = 0;
                        if (Array.isArray(rewardRes)) {
                            totalRev = rewardRes.reduce((sum, item) => sum + (item.totalReward || 0), 0);
                        }

                        return {
                            month: m.label,
                            Revenue: totalRev,
                            Cost: systemCostRes?.totalCost || 0
                        };
                    } catch {
                        return { month: m.label, Revenue: 0, Cost: 0 };
                    }
                });

                const historicalFinancials = await Promise.all(financialPromises);
                setFinancialChartData(historicalFinancials);

                // 3. Current month totals for stat cards
                const currentMonthFin = historicalFinancials[historicalFinancials.length - 1] || { Revenue: 0, Cost: 0 };

                // 4. Set final aggregated stats
                setStats({
                    availableTrucks: truckList.filter(t => t.status === 'AVAILABLE').length,
                    activeSchedules: scheduleList.filter(s => s.approveStatus === 'IN_TRANSIT').length,
                    pendingTransactions: transactionList.filter(t => t.approveStatus === 'PENDING').length,
                    totalRevenue: formatCurrency(currentMonthFin.Revenue),
                    totalTrucks: truckList.length,
                    totalCosts: formatCurrency(currentMonthFin.Cost),
                    lowStockItems: inventoryList.filter(i => i.quantity < 20).length,
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
            <div className="flex items-center justify-center h-[70vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Truck className="w-10 h-10 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to TransportHC</h1>
                <p className="text-slate-500 max-w-md">
                    You are logged in as <span className="font-semibold text-indigo-600">{userRoles[0] || 'User'}</span>. Please use the sidebar menu to navigate to your accessible tools and functions.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back! Real-time overview of fleet and financial performance.</p>
            </div>

            {/* Top row - 4 main stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard title="Available Trucks" value={stats.availableTrucks} icon={Truck} color="bg-blue-50 text-blue-600" />
                <StatCard title="Active Schedules" value={stats.activeSchedules} icon={Calendar} color="bg-green-50 text-green-600" />
                <StatCard title="Pending Transactions" value={stats.pendingTransactions} icon={Package} color="bg-orange-50 text-orange-600" />
                <StatCard title="This Month Revenue" value={stats.totalRevenue} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
            </div>

            {/* Second row - 3 smaller stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Fleet Size" value={stats.totalTrucks} icon={Truck} color="bg-slate-100 text-slate-600" />
                <StatCard title="This Month Costs" value={stats.totalCosts} icon={TrendingUp} color="bg-red-50 text-red-600" />
                <StatCard title="Low Stock Inventory" value={stats.lowStockItems} icon={AlertTriangle} color="bg-yellow-50 text-yellow-600" />
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 6-Month Financials Bar Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue vs Costs (6 Months)</h2>
                    <div className="h-[300px] w-full">
                        {financialChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                <p className="text-sm">No financial data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Status Pie Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Schedule Distribution</h2>
                    <div className="h-[300px] w-full">
                        {scheduleChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={scheduleChartData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {scheduleChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400 flex-col">
                                <Calendar className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No schedules found</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
