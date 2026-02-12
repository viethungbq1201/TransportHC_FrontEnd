import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import reportService from '@/services/reportService';

const tabs = [
    { key: 'cost', label: 'Cost Report' },
    { key: 'daily', label: 'Daily Report' },
    { key: 'trips', label: 'Trip Count' },
    { key: 'driver', label: 'Driver Cost' },
];

const ReportPage = () => {
    const [activeTab, setActiveTab] = useState('cost');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    const fetchReport = async () => {
        setLoading(true);
        try {
            let result;
            const params = dateRange.startDate && dateRange.endDate ? dateRange : undefined;
            switch (activeTab) {
                case 'cost': result = await reportService.getTruckCostReport(params); break;
                case 'daily': result = await reportService.getTruckDailyReport(params); break;
                case 'trips': result = await reportService.getTruckTripCount(params); break;
                case 'driver': result = await reportService.getDriverCostReport(params); break;
            }
            setData(Array.isArray(result) ? result : []);
        } catch { setData([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(); }, [activeTab]);

    const getColumns = () => {
        switch (activeTab) {
            case 'cost': return ['Truck', 'License Plate', 'Total Cost', 'Trip Count'];
            case 'daily': return ['Date', 'Truck', 'Revenue', 'Cost', 'Profit'];
            case 'trips': return ['Truck', 'License Plate', 'Total Trips', 'Total Distance'];
            case 'driver': return ['Driver', 'Total Cost', 'Trip Count', 'Average Cost'];
            default: return [];
        }
    };

    const getRowData = (item) => {
        switch (activeTab) {
            case 'cost': return [item.truckName || item.truck || '-', item.licensePlate || '-', `$${(item.totalCost || 0).toLocaleString()}`, item.tripCount || 0];
            case 'daily': return [item.date || '-', item.truckName || '-', `$${(item.revenue || 0).toLocaleString()}`, `$${(item.cost || 0).toLocaleString()}`, `$${(item.profit || 0).toLocaleString()}`];
            case 'trips': return [item.truckName || item.truck || '-', item.licensePlate || '-', item.totalTrips || 0, item.totalDistance ? `${item.totalDistance} km` : '-'];
            case 'driver': return [item.driverName || item.driver || '-', `$${(item.totalCost || 0).toLocaleString()}`, item.tripCount || 0, `$${(item.averageCost || 0).toLocaleString()}`];
            default: return [];
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 text-sm mt-1">View and analyze fleet performance reports</p>
            </div>

            {/* Date filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    <span className="text-slate-400">to</span>
                    <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <button onClick={fetchReport} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Apply Filter</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : data.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><BarChart3 className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No report data available</p></div>
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
