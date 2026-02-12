import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Search } from 'lucide-react';
import reportService from '@/services/reportService';

const tabs = [
    { key: 'costTruck', label: 'Cost by Truck' },
    { key: 'scheduleTruck', label: 'Schedule by Truck' },
    { key: 'costUser', label: 'Cost by Driver' },
    { key: 'scheduleUser', label: 'Schedule by Driver' },
];

const ReportPage = () => {
    const [activeTab, setActiveTab] = useState('costTruck');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    // All reports use POST with ReportRequest { truckId?, userId?, dateFrom, dateTo }
    const [filters, setFilters] = useState({ truckId: '', userId: '', dateFrom: '', dateTo: '' });

    const fetchReport = async () => {
        if (!filters.dateFrom || !filters.dateTo) return;
        setLoading(true);
        try {
            let result;
            const body = {
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
            };

            switch (activeTab) {
                case 'costTruck':
                    result = await reportService.reportCostForTruck({ ...body, truckId: filters.truckId ? Number(filters.truckId) : undefined });
                    break;
                case 'scheduleTruck':
                    result = await reportService.reportScheduleForTruck({ ...body, truckId: filters.truckId ? Number(filters.truckId) : undefined });
                    break;
                case 'costUser':
                    result = await reportService.reportCostForUser({ ...body, userId: filters.userId ? Number(filters.userId) : undefined });
                    break;
                case 'scheduleUser':
                    result = await reportService.reportScheduleForUser({ ...body, userId: filters.userId ? Number(filters.userId) : undefined });
                    break;
            }
            setData(Array.isArray(result) ? result : []);
        } catch { setData([]); }
        finally { setLoading(false); }
    };

    const getColumns = () => {
        switch (activeTab) {
            case 'costTruck': return ['Truck', 'License Plate', 'Total Cost', 'Cost Count'];
            case 'scheduleTruck': return ['Truck', 'License Plate', 'Total Schedules', 'Status'];
            case 'costUser': return ['Driver', 'Total Cost', 'Cost Count'];
            case 'scheduleUser': return ['Driver', 'Total Schedules', 'Status'];
            default: return [];
        }
    };

    const getRowData = (item) => {
        // Row data mapping — adjust based on actual backend response structure
        switch (activeTab) {
            case 'costTruck':
                return [
                    item.truckModel || item.truck?.model || '-',
                    item.licensePlate || item.truck?.licensePlate || '-',
                    `$${(item.totalCost || item.amount || 0).toLocaleString()}`,
                    item.costCount || item.count || 0,
                ];
            case 'scheduleTruck':
                return [
                    item.truckModel || item.truck?.model || '-',
                    item.licensePlate || item.truck?.licensePlate || '-',
                    item.totalSchedules || item.count || 0,
                    item.status || '-',
                ];
            case 'costUser':
                return [
                    item.fullName || item.user?.fullName || item.driverName || '-',
                    `$${(item.totalCost || item.amount || 0).toLocaleString()}`,
                    item.costCount || item.count || 0,
                ];
            case 'scheduleUser':
                return [
                    item.fullName || item.user?.fullName || item.driverName || '-',
                    item.totalSchedules || item.count || 0,
                    item.status || '-',
                ];
            default: return [];
        }
    };

    const needsTruckId = activeTab === 'costTruck' || activeTab === 'scheduleTruck';
    const needsUserId = activeTab === 'costUser' || activeTab === 'scheduleUser';

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 text-sm mt-1">View and analyze fleet performance reports</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setData([]); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 bg-white border border-slate-200 rounded-xl p-4">
                {needsTruckId && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Truck ID</label>
                        <input type="number" value={filters.truckId} onChange={e => setFilters({ ...filters, truckId: e.target.value })} placeholder="Optional" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-32" />
                    </div>
                )}
                {needsUserId && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">User ID</label>
                        <input type="number" value={filters.userId} onChange={e => setFilters({ ...filters, userId: e.target.value })} placeholder="Optional" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-32" />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                    <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                    <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="flex items-end">
                    <button onClick={fetchReport} disabled={!filters.dateFrom || !filters.dateTo} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">Generate Report</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : data.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><BarChart3 className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">{filters.dateFrom && filters.dateTo ? 'No report data available' : 'Select date range and generate report'}</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        {getColumns().map(col => <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{col}</th>)}
                    </tr></thead>
                        <tbody>{data.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                {getRowData(item).map((val, i) => <td key={i} className={`px-5 py-3.5 text-sm ${i === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{val}</td>)}
                            </tr>
                        ))}</tbody></table>
                )}
            </div>
        </div>
    );
};

export default ReportPage;
