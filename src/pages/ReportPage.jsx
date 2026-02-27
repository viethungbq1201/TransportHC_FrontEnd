import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Search, Truck, DollarSign, Activity, FileText, User } from 'lucide-react';
import reportService from '@/services/reportService';
import userService from '@/services/userService';

const TABS = [
    { key: 'costTruck', label: 'Cost by Truck', icon: DollarSign },
    { key: 'rewardTruck', label: 'Reward & Trips by Truck', icon: Activity },
    { key: 'tripCount', label: 'Trip Count by Truck', icon: Truck },
    { key: 'systemCost', label: 'Overall System Cost', icon: BarChart3 },
    { key: 'dailyReport', label: 'Daily Truck Report', icon: FileText },
];

const ReportPage = () => {
    const [activeTab, setActiveTab] = useState('costTruck');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Default dates: First day of current month to today
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const formatDate = (date) => date.toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        from: formatDate(firstDay),
        to: formatDate(today)
    });

    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const res = await userService.getUsers();
                if (Array.isArray(res)) {
                    setDrivers(res.filter(u => u.roles?.includes('DRIVER')));
                }
            } catch (e) {
                console.error("Failed to fetch drivers", e);
            }
        };
        fetchDrivers();
    }, []);

    const fetchReport = async () => {
        if (!filters.from || !filters.to) return;
        if (activeTab === 'dailyReport' && !selectedDriverId) return;

        setLoading(true);
        setData(null);
        try {
            let result;
            const body = { from: filters.from, to: filters.to };

            switch (activeTab) {
                case 'costTruck':
                    result = await reportService.reportCostAllTrucks(body);
                    break;
                case 'rewardTruck':
                    result = await reportService.reportRewardAllTrucks(body);
                    break;
                case 'tripCount':
                    result = await reportService.reportTripCountByTruck(body);
                    break;
                case 'systemCost':
                    result = await reportService.reportSystemCost(body);
                    break;
                case 'dailyReport':
                    result = await reportService.reportScheduleAllTruckRow(Number(selectedDriverId), body);
                    break;
            }
            setData(result);
        } catch (err) {
            console.error("Report fetch error", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (v) => `$${(v || 0).toLocaleString()}`;
    const formatDateStr = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    const renderTable = () => {
        if (!data) return <div className="flex flex-col items-center justify-center py-16 text-slate-400"><BarChart3 className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">Click 'Generate Report' to view data</p></div>;

        let items = [];
        let headers = [];
        let renderRow = (item, idx) => null;

        if (activeTab === 'costTruck') {
            items = Array.isArray(data) ? data : [];
            headers = ['#', 'License Plate', 'Total Cost'];
            renderRow = (item, idx) => (
                <>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.licensePlate || '-'}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{formatCurrency(item.totalCost)}</td>
                </>
            );
        } else if (activeTab === 'rewardTruck') {
            items = Array.isArray(data) ? data : [];
            headers = ['#', 'License Plate', 'Total Trips', 'Total Reward', 'Total Cost'];
            renderRow = (item, idx) => (
                <>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.licensePlate || '-'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{item.totalTrips || 0}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600">+{formatCurrency(item.totalReward)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">-{formatCurrency(item.totalCost)}</td>
                </>
            );
        } else if (activeTab === 'tripCount') {
            items = Array.isArray(data) ? data : [];
            headers = ['#', 'License Plate', 'Trip Count'];
            renderRow = (item, idx) => (
                <>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.licensePlate || '-'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{item.tripCount || 0}</td>
                </>
            );
        } else if (activeTab === 'systemCost') {
            items = [data]; // Single object response
            headers = ['From Date', 'To Date', 'Total System Cost'];
            renderRow = (item, idx) => (
                <>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatDateStr(item.fromDate || filters.from)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatDateStr(item.toDate || filters.to)}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900">{formatCurrency(item.totalCost)}</td>
                </>
            );
        } else if (activeTab === 'dailyReport') {
            items = data.data || [];
            headers = ['#', 'License Plate', 'Capacity', 'Start Date', 'Route', 'Extra Trips'];
            renderRow = (item, idx) => (
                <>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.licensePlate || '-'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{item.capacity ? `${item.capacity} tons` : '-'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatDateStr(item.startDate)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{item.startPoint} &rarr; {item.endPoint}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{item.extraTripCount || 0}</td>
                </>
            );
        }

        if (items.length === 0) {
            return <div className="flex flex-col items-center justify-center py-16 text-slate-400"><BarChart3 className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No data found for the selected criteria and period.</p></div>;
        }

        return (
            <div>
                {activeTab === 'dailyReport' && data.totalExtraTripCount !== undefined && (
                    <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-indigo-900">Summary</span>
                        <span className="text-sm font-bold text-indigo-700">Total Extra Trips: {data.totalExtraTripCount}</span>
                    </div>
                )}
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            {headers.map((h, i) => <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                {renderRow(item, idx)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const isGenerateDisabled = !filters.from || !filters.to || (activeTab === 'dailyReport' && !selectedDriverId);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 text-sm mt-1">Generate and analyze fleet performance, trips, and costs</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar: Tabs */}
                <div className="lg:w-64 shrink-0">
                    <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col gap-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setData(null); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                            <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                            <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>

                        {activeTab === 'dailyReport' && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Select Driver</label>
                                <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="">-- Choose Driver --</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="ml-auto">
                            <button onClick={fetchReport} disabled={isGenerateDisabled || loading} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {loading && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            </div>
                        ) : renderTable()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
