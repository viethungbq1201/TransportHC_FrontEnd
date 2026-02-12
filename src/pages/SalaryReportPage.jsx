import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, X, Users, DollarSign, Clock, CheckCircle, FileText, Trash2 } from 'lucide-react';
import salaryReportService from '@/services/salaryReportService';
import { SalaryReportStatus, SalaryReportStatusLabels, SalaryReportStatusColors } from '@/constants/enums';

const statusBadge = (status) => {
    const map = {
        [SalaryReportStatus.PROCESSING]: 'bg-amber-50 text-amber-700 border-amber-200',
        [SalaryReportStatus.DONE]: 'bg-green-50 text-green-700 border-green-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const SalaryReportPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [actionMenuId, setActionMenuId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    // create1/{userId} takes SalaryReportRequest {basicSalary, reward, cost, advanceMoney}
    const [createForm, setCreateForm] = useState({ userId: '', basicSalary: '', reward: '', cost: '', advanceMoney: '' });
    const [saving, setSaving] = useState(false);
    // Month selector for viewSalaryReport
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

    const fetchData = async () => {
        setLoading(true);
        try {
            // Backend expects yearMonth as LocalDate (first day of month): "2026-01-01"
            const yearMonth = `${selectedYear}-${selectedMonth}-01`;
            const result = await salaryReportService.getSalaryReports(yearMonth);
            setItems(Array.isArray(result) ? result : []);
        } catch { setItems([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]);

    const filtered = items.filter(r => {
        const term = search.toLowerCase();
        const matchSearch = !search ||
            r.user?.fullName?.toLowerCase().includes(term) ||
            r.user?.username?.toLowerCase().includes(term) ||
            String(r.salaryReportId).includes(term);
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Stats from current page data
    const totalDrivers = new Set(items.map(i => i.user?.fullName).filter(Boolean)).size;
    // Backend uses snake_case: basic_salary, advance_salary, total_salary
    const totalSalary = items.reduce((sum, i) => sum + (i.total_salary || 0), 0);
    const processingCount = items.filter(i => i.status === SalaryReportStatus.PROCESSING).length;
    const doneCount = items.filter(i => i.status === SalaryReportStatus.DONE).length;

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };
    const formatCurrency = (v) => `$${(v || 0).toLocaleString()}`;

    const handleCreateReport = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            // POST /salaryReport/create1/{userId}
            // Body: SalaryReportRequest { basicSalary, reward, cost, advanceMoney }
            await salaryReportService.createSalaryReport(Number(createForm.userId), {
                basicSalary: Number(createForm.basicSalary),
                reward: Number(createForm.reward),
                cost: Number(createForm.cost),
                advanceMoney: Number(createForm.advanceMoney),
            });
            setShowCreateModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handleGenerateAll = async () => {
        setSaving(true);
        try {
            // GET /salaryReport/createAllSalaryReport — no body
            await salaryReportService.createAllSalaryReport();
            setShowGenerateModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handleMarkDone = async (id) => {
        try { await salaryReportService.markAsDone(id); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
        setActionMenuId(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this salary report?')) return;
        try { await salaryReportService.deleteSalaryReport(id); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
        setActionMenuId(null);
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Salary Reports</h1><p className="text-slate-500 text-sm mt-1">Manage driver salary reports</p></div>
                <div className="flex gap-2">
                    <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"><FileText className="w-4 h-4" /> Generate All</button>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Create Report</button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Drivers</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalDrivers}</p></div><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Salary</p><p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalSalary)}</p></div><div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Processing</p><p className="text-2xl font-bold text-slate-900 mt-1">{processingCount}</p></div><div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center"><Clock className="w-6 h-6 text-orange-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Done</p><p className="text-2xl font-bold text-slate-900 mt-1">{doneCount}</p></div><div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by driver name..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                    <option value="">All Status</option>
                    <option value={SalaryReportStatus.PROCESSING}>Processing</option>
                    <option value={SalaryReportStatus.DONE}>Done</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><FileText className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No salary reports found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Salary</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advance</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Salary</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.salaryReportId} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm text-slate-500">#{item.salaryReportId}</td>
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.user?.fullName || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(item.basic_salary)}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(item.advance_salary)}</td>
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{formatCurrency(item.total_salary)}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(item.reportDate)}</td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(item.status)}`}>{SalaryReportStatusLabels[item.status] || item.status || '-'}</span></td>
                                <td className="px-5 py-3.5 relative">
                                    <button onClick={() => setActionMenuId(actionMenuId === item.salaryReportId ? null : item.salaryReportId)} className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                                    {actionMenuId === item.salaryReportId && (<><div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} /><div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-40">
                                        {item.status === SalaryReportStatus.PROCESSING && (
                                            <button onClick={() => handleMarkDone(item.salaryReportId)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"><CheckCircle className="w-3.5 h-3.5" /> Mark Done</button>
                                        )}
                                        <button onClick={() => handleDelete(item.salaryReportId)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                    </div></>)}
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {/* Month/Year Selector */}
            <div className="flex items-center gap-3 mt-4">
                <label className="text-sm text-slate-500">Select month:</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg">
                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>)}
                </select>
                <input type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} min="2020" className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
            </div>

            {/* Create Single Report Modal */}
            {showCreateModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowCreateModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">Create Salary Report</h2><button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreateReport} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">User ID</label><input type="number" value={createForm.userId} onChange={e => setCreateForm({ ...createForm, userId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary</label><input type="number" step="0.01" value={createForm.basicSalary} onChange={e => setCreateForm({ ...createForm, basicSalary: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Reward</label><input type="number" step="0.01" value={createForm.reward} onChange={e => setCreateForm({ ...createForm, reward: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Cost</label><input type="number" step="0.01" value={createForm.cost} onChange={e => setCreateForm({ ...createForm, cost: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Advance Money</label><input type="number" step="0.01" value={createForm.advanceMoney} onChange={e => setCreateForm({ ...createForm, advanceMoney: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                </div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button></div>
            </form></div></div>)}

            {/* Generate All Reports Modal */}
            {showGenerateModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowGenerateModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">Generate All Reports</h2><button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
                <p className="text-sm text-slate-600 mb-4">This will generate salary reports for all drivers. Are you sure?</p>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowGenerateModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button onClick={handleGenerateAll} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Generating...' : 'Generate All'}</button></div>
            </div></div>)}
        </div>
    );
};

export default SalaryReportPage;
