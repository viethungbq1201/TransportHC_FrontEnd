import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, CalendarClock, CheckCircle, XCircle, StopCircle, Ban } from 'lucide-react';
import scheduleService from '@/services/scheduleService';
import { ScheduleStatus, ScheduleStatusLabels, ApproveStatus, ApproveStatusLabels } from '@/constants/enums';

const statusBadge = (status) => {
    const map = {
        [ScheduleStatus.WAITING]: 'bg-amber-50 text-amber-700 border-amber-200',
        [ScheduleStatus.DELIVERING]: 'bg-blue-50 text-blue-700 border-blue-200',
        [ScheduleStatus.DONE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const approveBadge = (status) => {
    const map = {
        [ApproveStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [ApproveStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [ApproveStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const ScheduleListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    // Backend DTO: ScheduleCreateRequest { userId, truckId, routeId, departureDate }
    const [form, setForm] = useState({ userId: '', truckId: '', routeId: '', departureDate: '' });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);

    // End schedule modal
    const [showEndModal, setShowEndModal] = useState(false);
    const [endingScheduleId, setEndingScheduleId] = useState(null);
    const [endForm, setEndForm] = useState({ actualArrivalTime: '', note: '' });

    const fetchData = async () => { try { const data = await scheduleService.getAllSchedules(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(s => {
        const term = search.toLowerCase();
        const matchSearch = !search ||
            s.scheduleCode?.toLowerCase().includes(term) ||
            s.user?.fullName?.toLowerCase().includes(term) ||
            s.truck?.licensePlate?.toLowerCase().includes(term) ||
            s.route?.startPoint?.toLowerCase().includes(term) ||
            s.route?.endPoint?.toLowerCase().includes(term);
        const matchStatus = !statusFilter || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setEditingItem(null); setForm({ userId: '', truckId: '', routeId: '', departureDate: '' }); setShowModal(true); };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            userId: item.user?.id || '',
            truckId: item.truck?.id || '',
            routeId: item.route?.id || '',
            departureDate: item.departureDate ? item.departureDate.split('T')[0] : '',
        });
        setShowModal(true);
        setActionMenuId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                userId: Number(form.userId),
                truckId: Number(form.truckId),
                routeId: form.routeId ? Number(form.routeId) : undefined,
                departureDate: form.departureDate,
            };

            if (editingItem) {
                await scheduleService.updateSchedule(editingItem.id, payload);
            } else {
                await scheduleService.createSchedule(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    // Approve/Reject/Cancel use GET — no request body!
    const handleApprove = async (id) => { try { await scheduleService.approveSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };
    const handleReject = async (id) => { try { await scheduleService.rejectSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };
    const handleCancel = async (id) => { try { await scheduleService.cancelSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };

    const openEndModal = (id) => { setEndingScheduleId(id); setEndForm({ actualArrivalTime: '', note: '' }); setShowEndModal(true); setActionMenuId(null); };
    const handleEndSchedule = async (e) => {
        e.preventDefault();
        try { await scheduleService.endSchedule(endingScheduleId, endForm); setShowEndModal(false); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
    };

    const handleDelete = async (id) => { if (!window.confirm('Delete this schedule?')) return; try { await scheduleService.deleteSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Schedule Management</h1><p className="text-slate-500 text-sm mt-1">Manage transportation schedules</p></div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Schedule</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, driver, truck, or route..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                    <option value="">All Status</option>
                    {Object.values(ScheduleStatus).map((status) => (
                        <option key={status} value={status}>{ScheduleStatusLabels[status]}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><CalendarClock className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No schedules found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Truck</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departure</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.scheduleCode || `#${item.id}`}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.user?.fullName || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.truck?.licensePlate || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                    {item.route ? `${item.route.startPoint} → ${item.route.endPoint}` : '-'}
                                </td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(item.departureDate)}</td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(item.status)}`}>{ScheduleStatusLabels[item.status] || item.status}</span></td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${approveBadge(item.approveStatus)}`}>{ApproveStatusLabels[item.approveStatus] || item.approveStatus || '-'}</span></td>
                                <td className="px-5 py-3.5 relative">
                                    <button onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)} className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                                    {actionMenuId === item.id && (<><div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} /><div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-44">
                                        <button onClick={() => openEdit(item)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                                        {item.approveStatus === ApproveStatus.PENDING && <>
                                            <button onClick={() => handleApprove(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                                            <button onClick={() => handleReject(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                                        </>}
                                        {item.status === ScheduleStatus.DELIVERING && (
                                            <button onClick={() => openEndModal(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"><StopCircle className="w-3.5 h-3.5" /> End Schedule</button>
                                        )}
                                        {item.status === ScheduleStatus.WAITING && (
                                            <button onClick={() => handleCancel(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"><Ban className="w-3.5 h-3.5" /> Cancel</button>
                                        )}
                                        <button onClick={() => handleDelete(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                    </div></>)}
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingItem ? 'Edit Schedule' : 'Add New Schedule'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Driver (User ID)</label><input type="number" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Truck ID</label><input type="number" value={form.truckId} onChange={e => setForm({ ...form, truckId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Route ID</label><input type="number" value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label><input type="date" value={form.departureDate} onChange={e => setForm({ ...form, departureDate: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></div>
            </form></div></div>)}

            {/* End Schedule Modal */}
            {showEndModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowEndModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">End Schedule</h2><button onClick={() => setShowEndModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleEndSchedule} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Actual Arrival Time</label><input type="datetime-local" value={endForm.actualArrivalTime} onChange={e => setEndForm({ ...endForm, actualArrivalTime: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Note</label><textarea value={endForm.note} onChange={e => setEndForm({ ...endForm, note: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowEndModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Confirm End</button></div>
            </form></div></div>)}
        </div>
    );
};

export default ScheduleListPage;
