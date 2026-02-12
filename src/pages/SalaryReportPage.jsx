import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, X, Users, DollarSign, Clock, CheckCircle, FileText } from 'lucide-react';
import salaryReportService from '@/services/salaryReportService';

const statusBadge = (status) => {
    const map = {
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        COMPLETED: 'bg-green-50 text-green-700 border-green-200',
        PAID: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const SalaryReportPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [actionMenuId, setActionMenuId] = useState(null);

    const fetchData = async () => { try { const data = await salaryReportService.getSalaryReports(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(r => {
        const matchSearch = !search || [r.reportCode, r.driverName, r.driver?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalDrivers = new Set(items.map(i => i.driverName || i.driver?.name)).size;
    const totalSalary = items.reduce((sum, i) => sum + (i.totalSalary || 0), 0);
    const pendingPayments = items.filter(i => i.status === 'PENDING').length;
    const completedPayments = items.filter(i => i.status === 'COMPLETED' || i.status === 'PAID').length;

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const handleGenerate = async () => { try { await salaryReportService.generateAllReports(); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Salary Reports</h1><p className="text-slate-500 text-sm mt-1">Manage driver salary reports</p></div>
                <div className="flex gap-2">
                    <button onClick={handleGenerate} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"><FileText className="w-4 h-4" /> Generate All Reports</button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Create Report</button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Drivers</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalDrivers}</p></div><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Salary</p><p className="text-2xl font-bold text-slate-900 mt-1">${totalSalary.toLocaleString()}</p></div><div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Pending Payments</p><p className="text-2xl font-bold text-slate-900 mt-1">{pendingPayments}</p></div><div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center"><Clock className="w-6 h-6 text-orange-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Completed Payments</p><p className="text-2xl font-bold text-slate-900 mt-1">{completedPayments}</p></div><div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or driver..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"><option value="">All Status</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="PAID">Paid</option></select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><FileText className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No salary reports found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Code</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Trips</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Salary</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bonus</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Salary</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.reportCode || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.driverName || item.driver?.name || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.totalTrips || 0}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">${(item.baseSalary || 0).toLocaleString()}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">${(item.bonus || 0).toLocaleString()}</td>
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">${(item.totalSalary || 0).toLocaleString()}</td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(item.status)}`}>{item.status || '-'}</span></td>
                                <td className="px-5 py-3.5 relative">
                                    <button onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)} className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                                    {actionMenuId === item.id && (<><div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} /><div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-36"><button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5" /> View Details</button></div></>)}
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>
        </div>
    );
};

export default SalaryReportPage;
