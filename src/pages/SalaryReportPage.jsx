import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, X, Users as UsersIcon, DollarSign, Clock, CheckCircle, FileText, Trash2, Pencil, Eye } from 'lucide-react';
import salaryReportService from '@/services/salaryReportService';
import userService from '@/services/userService';
import ActionButton from '@/components/ActionButton';
import { SalaryReportStatus, SalaryReportStatusLabels, SalaryReportStatusColors } from '@/constants/enums';
import usePermissions from '@/hooks/usePermissions';

const statusBadge = (status) => {
    const map = {
        [SalaryReportStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
        [SalaryReportStatus.DONE]: 'bg-green-50 text-green-700 border-green-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const SalaryReportPage = () => {
    const { can } = usePermissions();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [actionMenuId, setActionMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    // create1/{userId} takes SalaryReportRequest {basicSalary, reward, cost, advanceMoney}
    const [form, setForm] = useState({ userId: '', basicSalary: '', reward: '', cost: '', advanceMoney: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    // Month selector for viewSalaryReport
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
    const [drivers, setDrivers] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch users for the dropdown
            const [reportResult, userResult] = await Promise.all([
                salaryReportService.getSalaryReports(`${selectedYear}-${selectedMonth}-01`),
                userService.getUsers()
            ]);
            setItems(Array.isArray(reportResult) ? reportResult : []);

            // Filter only drivers for the creation dropdown
            const driverUsers = Array.isArray(userResult) ? userResult.filter(u => u.roles && u.roles.includes('DRIVER')) : [];
            setDrivers(driverUsers);
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
    // Backend uses camelCase: baseSalary, advanceSalary, total, rewardSalary, costSalary
    const totalSalary = items.reduce((sum, i) => sum + (i.total || 0), 0);
    const processingCount = items.filter(i => i.status === SalaryReportStatus.PENDING).length;
    const doneCount = items.filter(i => i.status === SalaryReportStatus.DONE).length;

    const formatCurrency = (v) => `$${(v || 0).toLocaleString()}`;

    const handleUserSelect = (e) => {
        const selectedId = e.target.value;
        const driver = drivers.find(d => String(d.id) === String(selectedId));
        if (driver) {
            setForm({
                ...form,
                userId: selectedId,
                basicSalary: driver.basicSalary || 0,
                advanceMoney: driver.advanceMoney || 0
            });
        } else {
            setForm({ ...form, userId: selectedId });
        }
    };

    const openCreate = () => {
        setEditId(null);
        setForm({ userId: '', basicSalary: '', reward: '', cost: '', advanceMoney: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditId(item.reportId || item.salaryReportId);
        setForm({
            userId: item.user?.id || item.user?.userId || '',
            basicSalary: item.baseSalary || 0,
            reward: item.rewardSalary || 0,
            cost: item.costSalary || 0,
            advanceMoney: item.advanceSalary || 0,
        });
        setActionMenuId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const payload = {
                basicSalary: Number(form.basicSalary),
                reward: Number(form.reward),
                cost: Number(form.cost),
                advanceMoney: Number(form.advanceMoney),
            };
            if (editId) {
                await salaryReportService.updateSalaryReport(editId, payload);
            } else {
                await salaryReportService.createSalaryReport(Number(form.userId), payload);
            }
            setShowModal(false);
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

    const handleDelete = (id) => {
        setDeleteConfirmId(id);
        setActionMenuId(null);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try { await salaryReportService.deleteSalaryReport(deleteConfirmId); fetchData(); setDeleteConfirmId(null); }
        catch (err) { alert(err?.message || 'Error'); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Salary Reports</h1><p className="text-slate-500 text-sm mt-1">Manage driver salary reports</p></div>
                <div className="flex gap-2">
                    {can('CREATE_ALL_SALARY_REPORT') && <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"><FileText className="w-4 h-4" /> Generate All</button>}
                    {can('CREATE_1_SALARY_REPORT') && <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Create Report</button>}
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Drivers</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalDrivers}</p></div><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><UsersIcon className="w-6 h-6 text-blue-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Salary</p><p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalSalary)}</p></div><div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-slate-900 mt-1">{processingCount}</p></div><div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center"><Clock className="w-6 h-6 text-orange-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Done</p><p className="text-2xl font-bold text-slate-900 mt-1">{doneCount}</p></div><div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-500 whitespace-nowrap">Month:</label>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-3 py-2.5 bg-white text-sm border border-slate-200 rounded-lg">
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i).toLocaleString('en', { month: 'short' })}</option>)}
                    </select>
                    <input type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} min="2020" className="w-20 px-3 py-2.5 text-sm border border-slate-200 rounded-lg" />
                </div>
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by driver name..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                    <option value="">All Status</option>
                    <option value={SalaryReportStatus.PENDING}>Pending</option>
                    <option value={SalaryReportStatus.DONE}>Done</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><FileText className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No salary reports found</p></div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full whitespace-nowrap"><thead><tr className="border-b border-slate-200">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Salary</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Salary</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Actions</th>
                        </tr></thead>
                            <tbody>{filtered.map((item, index) => (
                                <tr key={item.reportId || item.salaryReportId} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="px-5 py-3.5 text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.user?.fullName || '-'}</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(item.baseSalary)}</td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{formatCurrency(item.total)}</td>
                                    <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(item.status)}`}>{SalaryReportStatusLabels[item.status] || item.status || '-'}</span></td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                            <ActionButton onClick={() => { setSelectedReport(item); setShowDetailsModal(true); }} icon={Eye} title="View Details" color="indigo" />
                                            {item.status === SalaryReportStatus.PENDING && (
                                                <>
                                                    {can('UPDATE_SALARY_REPORT') && <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />}
                                                    {can('APPROVE_SALARY_REPORT') && <ActionButton onClick={() => handleMarkDone(item.reportId || item.salaryReportId)} icon={CheckCircle} title="Mark Done" color="green" />}
                                                </>
                                            )}
                                            {can('DELETE_SALARY_REPORT') && <ActionButton onClick={() => handleDelete(item.reportId || item.salaryReportId)} icon={Trash2} title="Delete" color="red" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody></table>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setShowDetailsModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">Payroll Details - {selectedReport.user?.fullName}</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Base Salary</span>
                                <span className="text-sm font-medium text-slate-900">{formatCurrency(selectedReport.baseSalary)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Reimbursed Cost</span>
                                <span className="text-sm font-medium text-green-600">+{formatCurrency(selectedReport.costSalary)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Extra Reward</span>
                                <span className="text-sm font-medium text-green-600">+{formatCurrency(selectedReport.rewardSalary)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Advance Deducted</span>
                                <span className="text-sm font-medium text-red-600">-{formatCurrency(selectedReport.advanceSalary)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-slate-50 px-3 rounded-lg border border-slate-200 mt-4">
                                <span className="text-base font-semibold text-slate-900">Total Salary</span>
                                <span className="text-xl font-bold text-indigo-600">{formatCurrency(selectedReport.total)}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Single Report Modal */}
            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Salary Report' : 'Create Salary Report'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                {!editId && <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                    <select value={form.userId} onChange={handleUserSelect} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                        <option value="">Select a driver...</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName} ({d.phoneNumber})</option>)}
                    </select>
                </div>}
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary</label><input type="number" step="0.01" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Reward</label><input type="number" step="0.01" value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Cost</label><input type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Advance Money</label><input type="number" step="0.01" value={form.advanceMoney} onChange={e => setForm({ ...form, advanceMoney: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                </div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button></div>
            </form></div></div>)}

            {/* Generate All Reports Modal */}
            {showGenerateModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowGenerateModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">Generate All Reports</h2><button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
                <p className="text-sm text-slate-600 mb-4">This will generate salary reports for all drivers based on completed transactions. Are you sure?</p>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowGenerateModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button onClick={handleGenerateAll} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Generating...' : 'Generate All'}</button></div>
            </div></div>)}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Salary Report</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryReportPage;
