import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, X, CalendarClock, CheckCircle, XCircle, StopCircle, Ban, Eye } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import scheduleService from '@/services/scheduleService';
import userService from '@/services/userService';
import truckService from '@/services/truckService';
import routeService from '@/services/routeService';
import transactionService from '@/services/transactionService';
import { ScheduleStatus, ScheduleStatusLabels, ApproveStatus, ApproveStatusLabels } from '@/constants/enums';
import usePermissions from '@/hooks/usePermissions';

// Modernized and Accessible Status Badges with Dark Mode Support
const statusBadge = (status) => {
    const map = {
        [ScheduleStatus.PENDING]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        [ScheduleStatus.IN_TRANSIT]: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
        [ScheduleStatus.DONE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        [ScheduleStatus.CANCELLED]: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        [ScheduleStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
};

const ScheduleListPage = () => {
    const { can } = usePermissions();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ driverId: '', truckId: '', routeId: '', transactionId: '', startDate: '', reward: '' });
    const [saving, setSaving] = useState(false);

    // End schedule modal
    const [showEndModal, setShowEndModal] = useState(false);
    const [endingScheduleId, setEndingScheduleId] = useState(null);
    const [endForm, setEndForm] = useState({ documentaryProof: '' });

    // Delete Custom Modal
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const usedTransactionIds = items
        .filter(s => s.transaction?.transactionId)
        .map(s => s.transaction.transactionId);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                scheduleService.getAllSchedules(),
                userService.getUsers(),
                truckService.getAllTrucks(),
                routeService.getRoutes(),
                transactionService.getAllTransactions(),
            ]);

            const data = results[0].status === 'fulfilled' ? results[0].value : [];
            const driverData = results[1].status === 'fulfilled' ? results[1].value : [];
            const truckData = results[2].status === 'fulfilled' ? results[2].value : [];
            const routeData = results[3].status === 'fulfilled' ? results[3].value : [];
            const transData = results[4].status === 'fulfilled' ? results[4].value : [];

            setItems(Array.isArray(data) ? data : []);
            setDrivers(Array.isArray(driverData) ? driverData.filter(u => u.roles?.includes('DRIVER')) : []);
            setTrucks(Array.isArray(truckData) ? truckData : []);
            setRoutes(Array.isArray(routeData) ? routeData : []);
            setTransactions(Array.isArray(transData) ? transData : []);
        } catch (error) {
            console.error(error);
            setItems([]);
            setDrivers([]);
            setTrucks([]);
            setRoutes([]);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(s => {
        const term = search.toLowerCase();
        const matchSearch = !search ||
            String(s.scheduleId || s.id).includes(term) ||
            s.driver?.fullName?.toLowerCase().includes(term) ||
            s.truck?.licensePlate?.toLowerCase().includes(term) ||
            s.route?.name?.toLowerCase().includes(term);
        const matchStatus = !statusFilter || s.approveStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setEditingItem(null); setForm({ driverId: '', truckId: '', routeId: '', transactionId: '', startDate: '', reward: '' }); setShowModal(true); };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            driverId: item.driver?.id || '',
            truckId: item.truck?.id || '',
            routeId: item.route?.id || '',
            transactionId: item.transaction?.transactionId || '',
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            reward: item.reward || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                driverId: form.driverId ? Number(form.driverId) : null,
                truckId: form.truckId ? Number(form.truckId) : null,
                routeId: form.routeId ? Number(form.routeId) : null,
                transactionId: form.transactionId ? Number(form.transactionId) : null,
                startDate: form.startDate,
                reward: form.reward ? Number(form.reward) : 0,
            };

            if (editingItem) {
                await scheduleService.updateSchedule(editingItem.scheduleId || editingItem.id, payload);
            } else {
                await scheduleService.createSchedule(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    // Approve/Reject/Cancel use GET — no request body!
    const handleApprove = async (id) => { try { await scheduleService.approveSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };
    const handleReject = async (id) => { try { await scheduleService.rejectSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };
    const handleCancel = async (id) => { try { await scheduleService.cancelSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };

    const openEndModal = (id) => { setEndingScheduleId(id); setEndForm({ documentaryProof: '' }); setShowEndModal(true); };
    const handleEndSchedule = async (e) => {
        e.preventDefault();
        try { await scheduleService.endSchedule(endingScheduleId, endForm); setShowEndModal(false); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
    };

    const handleDelete = (id) => { setDeleteConfirmId(id); };
    const confirmDelete = async () => { if (!deleteConfirmId) return; try { await scheduleService.deleteSchedule(deleteConfirmId); fetchData(); setDeleteConfirmId(null); } catch (err) { alert(err?.message || 'Error'); } };

    return (
        <div className="min-h-full bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Header Area with Subtle Gradient */}
            <div className="relative mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none rounded-t-2xl"></div>
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Schedule Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your transportation fleet schedules.</p>
                    </div>
                    {can('CREATE_SCHEDULE') && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transform active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            <Plus className="w-5 h-5" /> Add Schedule
                        </button>
                    )}
                </div>
            </div>

            {/* Sticky Filters & Search Control Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -my-4 mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center transition-colors duration-300">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by code, driver, truck, or route..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:ring-indigo-400/50 transition-all duration-200"
                    />
                </div>
                <div className="relative w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full sm:w-48 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:ring-indigo-400/50 appearance-none cursor-pointer transition-all duration-200"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(ScheduleStatus).map((status) => (
                            <option key={status} value={status}>{ScheduleStatusLabels[status]}</option>
                        ))}
                    </select>
                    {/* Custom Dropdown Arrow to replace standard browser styling */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* Modern Card Table Wrapper */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
                        <CalendarClock className="w-16 h-16 mb-4 opacity-40 dark:opacity-30" />
                        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No schedules found</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schedule ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver / Truck</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route Info</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financials / Proof</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200 group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700">
                                                #{item.scheduleId || item.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{item.driver?.fullName || 'Not assigned'}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                {item.truck?.licensePlate || 'No truck'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{item.route ? item.route.name : 'Unspecified'}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-[200px] truncate">
                                                {item.route ? `${item.route.start_point || item.route.startPoint} ➝ ${item.route.end_point || item.route.endPoint}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-medium text-slate-800 dark:text-slate-200">{formatDate(item.startDate)}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">End: {item.endDate ? formatDate(item.endDate) : 'Pending'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-bold text-emerald-600 dark:text-emerald-400">{item.reward ? `${item.reward.toLocaleString()} ₫` : '0 ₫'}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate max-w-[150px] italic">
                                                {item.documentaryProof || 'No proof provided'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${statusBadge(item.approveStatus)}`}>
                                                {ScheduleStatusLabels[item.approveStatus] || item.approveStatus}
                                            </span>
                                            {item.approveBy && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 ml-1 font-medium">Approved by: {item.approveBy.fullName}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <ActionButton onClick={() => navigate('/transaction-details', { state: { transactionId: item.transaction?.transactionId } })} icon={Eye} title="Transaction Details" color="indigo" />
                                                {item.approveStatus === ScheduleStatus.PENDING && <>
                                                    {can('APPROVE_SCHEDULE') && <ActionButton onClick={() => handleApprove(item.scheduleId || item.id)} icon={CheckCircle} title="Approve" color="green" />}
                                                    {can('REJECT_SCHEDULE') && <ActionButton onClick={() => handleReject(item.scheduleId || item.id)} icon={XCircle} title="Reject" color="amber" />}
                                                    {can('UPDATE_SCHEDULE') && <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />}
                                                    {can('DELETE_SCHEDULE') && <ActionButton onClick={() => handleDelete(item.scheduleId || item.id)} icon={Trash2} title="Delete" color="red" />}
                                                </>}
                                                {item.approveStatus === ScheduleStatus.IN_TRANSIT && <>
                                                    {can('END_SCHEDULE') && <ActionButton onClick={() => openEndModal(item.scheduleId || item.id)} icon={StopCircle} title="End (Mark Done)" color="indigo" />}
                                                    {can('CANCEL_SCHEDULE') && <ActionButton onClick={() => handleCancel(item.scheduleId || item.id)} icon={Ban} title="Cancel" color="amber" />}
                                                </>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Glassmorphic Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm transition-opacity opacity-100" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden transform transition-all scale-100 translate-y-0 opacity-100 border border-slate-200 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingItem ? 'Edit Schedule Strategy' : 'Create New Schedule'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Origin Transaction <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.transactionId}
                                        onChange={e => setForm({ ...form, transactionId: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                    >
                                        <option value="">Select an Approved Transaction...</option>
                                        {transactions
                                            .filter(t => {
                                                const isApproved = t.approveStatus === 'APPROVED';
                                                const isCurrentEditing = t.transactionId === Number(form.transactionId);
                                                const isUsed = usedTransactionIds.includes(t.transactionId);
                                                return isApproved && (!isUsed || isCurrentEditing);
                                            })
                                            .map(t => (
                                                <option key={t.transactionId} value={t.transactionId}>#{t.transactionId} - {t.transactionType} ({t.location})</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assign Driver <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.driverId}
                                            onChange={e => setForm({ ...form, driverId: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                        >
                                            <option value="">Select Assigned Driver...</option>
                                            {drivers.filter(d => d.status === 'AVAILABLE' || d.id === Number(form.driverId)).map(d => (
                                                <option key={d.id} value={d.id}>{d.fullName} • {d.phoneNumber}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assign Truck <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.truckId}
                                            onChange={e => setForm({ ...form, truckId: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                        >
                                            <option value="">Select Assigned Truck...</option>
                                            {trucks.filter(t => t.status === 'AVAILABLE' || t.id === Number(form.truckId)).map(t => (
                                                <option key={t.id} value={t.id}>{t.licensePlate} • {t.capacity}T</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Planned Route <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.routeId}
                                        onChange={e => setForm({ ...form, routeId: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                    >
                                        <option value="">Designate a Route...</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} • {r.distance}km</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expected Reward (₫) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={form.reward}
                                            onChange={e => setForm({ ...form, reward: e.target.value })}
                                            required
                                            placeholder="e.g. 500,000"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transform active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 px-4 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95 transition-all flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                    >
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Saving...
                                            </span>
                                        ) : editingItem ? 'Save Changes' : 'Initialize Schedule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* End Schedule Completion Modal */}
            {showEndModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEndModal(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Conclude Schedule</h2>
                            <button onClick={() => setShowEndModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleEndSchedule} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Finalization Proof (URL/Notes)</label>
                                <textarea
                                    value={endForm.documentaryProof || ''}
                                    onChange={e => setEndForm({ ...endForm, documentaryProof: e.target.value })}
                                    rows={4}
                                    placeholder="Provide links to delivery receipts, images, or closing notes..."
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEndModal(false)} className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transform active:scale-95 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 px-4 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transform active:scale-95 transition-all shadow-md">Confirm Completion</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Destructive Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 text-center transform transition-all border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Terminate Schedule?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 px-2">
                            You are about to permanently delete this schedule. This action cannot be reversed. Are you absolutely sure?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transform active:scale-95 transition-all">Keep It</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transform active:scale-95 transition-all shadow-md">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleListPage;
