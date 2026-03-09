import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import costService from '@/services/costService';
import scheduleService from '@/services/scheduleService';
import costTypeService from '@/services/costTypeService';
import { ApproveStatus, ApproveStatusLabels, ScheduleStatus } from '@/constants/enums';
import usePermissions from '@/hooks/usePermissions';

const approveBadge = (status) => {
    const map = {
        [ApproveStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [ApproveStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [ApproveStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const CostListPage = () => {
    const { can } = usePermissions();
    const [items, setItems] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [costTypes, setCostTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCostType, setFilterCostType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ scheduleId: '', costTypeId: '', amount: '', description: '', documentaryProof: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const loadData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        try {
            const results = await Promise.allSettled([
                costService.getAllCosts(),
                scheduleService.getAllSchedules(),
                costTypeService.getCostTypes()
            ]);

            const data = results[0].status === 'fulfilled' ? results[0].value : [];
            const scheduleData = results[1].status === 'fulfilled' ? results[1].value : [];
            const typeData = results[2].status === 'fulfilled' ? results[2].value : [];

            setItems(Array.isArray(data) ? data : []);
            setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
            setCostTypes(Array.isArray(typeData) ? typeData : []);
        } catch (error) {
            console.error(error);
        } finally {
            if (showSpinner) setLoading(false);
        }
    }, []);
    useEffect(() => { loadData(true); }, [loadData]);

    const filtered = items.filter(c => {
        if (filterCostType && String(c.costType?.costTypeId) !== filterCostType) return false;
        if (!search) return true;
        const term = search.toLowerCase();
        return c.description?.toLowerCase().includes(term) ||
            c.costType?.name?.toLowerCase().includes(term);
    });

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setEditingItem(null); setForm({ scheduleId: '', costTypeId: '', amount: '', description: '', documentaryProof: '' }); setShowModal(true); };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            scheduleId: item.schedule?.scheduleId || '',
            costTypeId: item.costType?.costTypeId || '',
            amount: item.price || '',
            description: item.description || '',
            documentaryProof: item.documentaryProof || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                costTypeId: Number(form.costTypeId),
                price: Number(form.amount),
                description: form.description,
                scheduleId: Number(form.scheduleId),
                documentaryProof: form.documentaryProof || null,
            };

            if (editingItem) {
                await costService.updateCost(editingItem.costId, payload);
                toast.success('Cost updated');
            } else {
                await costService.createCost(payload);
                toast.success('Cost created');
            }
            setShowModal(false);
            loadData(false);
        } catch (err) { toast.error(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handleApprove = async (id) => {
        setItems(prev => prev.map(i => i.costId === id ? { ...i, approveStatus: 'APPROVED' } : i));
        try { await costService.approveCost(id); toast.success('Cost approved'); } catch (err) { toast.error(err?.message || 'Error'); loadData(false); }
    };
    const handleReject = async (id) => {
        setItems(prev => prev.map(i => i.costId === id ? { ...i, approveStatus: 'REJECTED' } : i));
        try { await costService.rejectCost(id); toast.success('Cost rejected'); } catch (err) { toast.error(err?.message || 'Error'); loadData(false); }
    };
    const handleDelete = (id) => { setDeleteConfirmId(id); };
    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        setItems(prev => prev.filter(i => i.costId !== deleteConfirmId));
        setDeleteConfirmId(null);
        try { await costService.deleteCost(deleteConfirmId); toast.success('Cost deleted'); }
        catch (err) { toast.error(err?.message || 'Error'); loadData(false); }
    };

    const groupedCosts = filtered.reduce((acc, item) => {
        const sId = item.schedule?.scheduleId || 'Unknown Schedule';
        if (!acc[sId]) acc[sId] = { schedule: item.schedule, items: [] };
        acc[sId].items.push(item);
        return acc;
    }, {});

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Cost Management</h1><p className="text-slate-500 text-sm mt-1">Manage schedule costs and expenses</p></div>
                {can('CREATE_COST') && <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Cost</button>}
            </div>
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by description or cost type..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <select
                    value={filterCostType}
                    onChange={e => setFilterCostType(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                >
                    <option value="">All Cost Types</option>
                    {costTypes.map(c => (
                        <option key={c.costTypeId} value={c.costTypeId}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><DollarSign className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No costs found</p></div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full whitespace-nowrap"><thead><tr className="border-b border-slate-200">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost Type</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost Date</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                        </tr></thead>
                            <tbody>{Object.values(groupedCosts).map(({ schedule, items }) => (
                                <React.Fragment key={schedule?.scheduleId || 'unknown'}>
                                    <tr className="bg-slate-50 border-y border-slate-200">
                                        <td colSpan="7" className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            {schedule ? `Schedule #${schedule.scheduleId} - Route: ${schedule.route?.name || 'Unknown'}` : 'Unassigned Schedule'}
                                        </td>
                                    </tr>
                                    {items.map((item, index) => (
                                        <tr key={item.costId} className="border-b border-slate-100 hover:bg-slate-50/50 bg-white">
                                            <td className="px-5 py-3.5 text-sm text-slate-500 pl-8">{index + 1}</td>
                                            <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.costType?.name || '-'}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{item.price ? `$${Number(item.price).toLocaleString()}` : '$0'}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{item.description || '-'}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(item.date)}</td>
                                            <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${approveBadge(item.approveStatus)}`}>{ApproveStatusLabels[item.approveStatus] || item.approveStatus || '-'}</span></td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    {item.approveStatus === ApproveStatus.PENDING ? (
                                                        <>
                                                            {can('APPROVE_COST') && <ActionButton onClick={() => handleApprove(item.costId)} icon={CheckCircle} title="Approve" color="green" />}
                                                            {can('REJECT_COST') && <ActionButton onClick={() => handleReject(item.costId)} icon={XCircle} title="Reject" color="amber" />}
                                                            {can('UPDATE_COST') && <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />}
                                                            {can('DELETE_COST') && <ActionButton onClick={() => handleDelete(item.costId)} icon={Trash2} title="Delete" color="red" />}
                                                        </>
                                                    ) : <span className="text-xs text-slate-400 italic">Locked</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}</tbody></table>
                    </div>
                )}
            </div>

            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingItem ? 'Edit Cost' : 'Add New Cost'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Schedule<span className="text-red-500">*</span></label>
                    <select value={form.scheduleId} onChange={e => setForm({ ...form, scheduleId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Schedule...</option>
                        {schedules.filter(s => s.approveStatus === ScheduleStatus.IN_TRANSIT).map(s => (
                            <option key={s.scheduleId} value={s.scheduleId}>#{s.scheduleId} ({s.route?.name})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost Type<span className="text-red-500">*</span></label>
                    <select value={form.costTypeId} onChange={e => setForm({ ...form, costTypeId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Type...</option>
                        {costTypes.map(c => (
                            <option key={c.costTypeId} value={c.costTypeId}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Price<span className="text-red-500">*</span></label><input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Documentary Proof</label><input type="text" value={form.documentaryProof || ''} onChange={e => setForm({ ...form, documentaryProof: e.target.value })} placeholder="Link or note" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Description<span className="text-red-500">*</span></label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></div>
            </form></div></div>)}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Cost</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this cost? This action cannot be undone.</p>
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

export default CostListPage;
