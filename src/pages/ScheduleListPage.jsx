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

const statusBadge = (status) => {
    const map = {
        [ScheduleStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
        [ScheduleStatus.IN_TRANSIT]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        [ScheduleStatus.DONE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        [ScheduleStatus.CANCELLED]: 'bg-slate-100 text-slate-800 border-slate-200',
        [ScheduleStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
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
    const [endForm, setEndForm] = useState({ actualArrivalTime: '', documentaryProof: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [data, driverData, truckData, routeData, transData] = await Promise.all([
                scheduleService.getAllSchedules(),
                userService.getUsers(),
                truckService.getAllTrucks(),
                routeService.getRoutes(),
                transactionService.getAllTransactions(),
            ]);
            setItems(Array.isArray(data) ? data : []);
            setDrivers(Array.isArray(driverData) ? driverData.filter(u => u.roles?.includes('DRIVER')) : []);
            setTrucks(Array.isArray(truckData) ? truckData : []);
            setRoutes(Array.isArray(routeData) ? routeData : []);
            setTransactions(Array.isArray(transData) ? transData : []);
        } catch {
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

    const openEndModal = (id) => { setEndingScheduleId(id); setEndForm({ actualArrivalTime: '', documentaryProof: '' }); setShowEndModal(true); };
    const handleEndSchedule = async (e) => {
        e.preventDefault();
        try { await scheduleService.endSchedule(endingScheduleId, endForm); setShowEndModal(false); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
    };

    const handleDelete = async (id) => { if (!window.confirm('Delete this schedule?')) return; try { await scheduleService.deleteSchedule(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };

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
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver / Truck</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route Info</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start / End Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reward / Proof</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">#{item.scheduleId || item.id}</td>
                                <td className="px-5 py-3.5 text-sm">
                                    <div className="font-medium text-slate-900">{item.driver?.fullName || '-'}</div>
                                    <div className="text-slate-500 text-xs mt-0.5">{item.truck?.licensePlate || '-'}</div>
                                </td>
                                <td className="px-5 py-3.5 text-sm">
                                    <div className="text-slate-900">{item.route ? item.route.name : '-'}</div>
                                    <div className="text-slate-500 text-xs mt-0.5">{item.route ? `${item.route.start_point || item.route.startPoint} → ${item.route.end_point || item.route.endPoint}` : ''}</div>
                                </td>
                                <td className="px-5 py-3.5 text-sm">
                                    <div className="text-slate-900">{formatDate(item.startDate)}</div>
                                    <div className="text-slate-500 text-xs mt-0.5">{item.endDate ? formatDate(item.endDate) : 'TBD'}</div>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                    <div className="font-medium text-emerald-600">{item.reward ? `${item.reward.toLocaleString()} ₫` : '-'}</div>
                                    <div className="text-slate-500 text-xs mt-0.5 ">{item.documentaryProof || 'No proof'}</div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(item.approveStatus)}`}>
                                        {ScheduleStatusLabels[item.approveStatus] || item.approveStatus}
                                    </span>
                                    {item.approveBy && <div className="text-[10px] text-slate-400 mt-1">By: {item.approveBy.fullName}</div>}
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <ActionButton onClick={() => navigate('/transaction-details', { state: { transactionId: item.transaction?.transactionId } })} icon={Eye} title="View Transaction" color="indigo" />
                                        <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />
                                        {item.approveStatus === ScheduleStatus.PENDING && <>
                                            <ActionButton onClick={() => handleApprove(item.scheduleId || item.id)} icon={CheckCircle} title="Approve (To In Transit)" color="green" />
                                            <ActionButton onClick={() => handleReject(item.scheduleId || item.id)} icon={XCircle} title="Reject" color="amber" />
                                        </>}
                                        {item.approveStatus === ScheduleStatus.IN_TRANSIT && <>
                                            <ActionButton onClick={() => openEndModal(item.scheduleId || item.id)} icon={StopCircle} title="End Schedule (To Done)" color="indigo" />
                                            <ActionButton onClick={() => handleCancel(item.scheduleId || item.id)} icon={Ban} title="Cancel Schedule" color="amber" />
                                        </>}
                                        <ActionButton onClick={() => handleDelete(item.scheduleId || item.id)} icon={Trash2} title="Delete" color="red" />
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 my-8"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingItem ? 'Edit Schedule' : 'Add New Schedule'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction</label>
                    <select value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Transaction...</option>
                        {transactions.filter(t => t.approveStatus === 'APPROVED' || t.transactionId === Number(form.transactionId)).map(t => (
                            <option key={t.transactionId} value={t.transactionId}>#{t.transactionId} - {t.transactionType} ({t.location})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                    <select value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Driver...</option>
                        {drivers.filter(d => d.status === 'AVAILABLE' || d.id === Number(form.driverId)).map(d => (
                            <option key={d.id} value={d.id}>{d.fullName} ({d.phoneNumber})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Truck</label>
                    <select value={form.truckId} onChange={e => setForm({ ...form, truckId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Truck...</option>
                        {trucks.filter(t => t.status === 'AVAILABLE' || t.id === Number(form.truckId)).map(t => (
                            <option key={t.id} value={t.id}>{t.licensePlate} ({t.capacity}T)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Route</label>
                    <select value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Route...</option>
                        {routes.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.distance}km)</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Reward</label><input type="number" min="0" step="1000" value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                </div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></div>
            </form></div></div>)}

            {/* End Schedule Modal */}
            {showEndModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowEndModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">End Schedule</h2><button onClick={() => setShowEndModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleEndSchedule} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Actual Arrival Time</label><input type="datetime-local" value={endForm.actualArrivalTime} onChange={e => setEndForm({ ...endForm, actualArrivalTime: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Documentary Proof (URL/Note)</label><textarea value={endForm.documentaryProof || ''} onChange={e => setEndForm({ ...endForm, documentaryProof: e.target.value })} rows={3} placeholder="Link to images or notes..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowEndModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Confirm End</button></div>
            </form></div></div>)}
        </div>
    );
};

export default ScheduleListPage;
