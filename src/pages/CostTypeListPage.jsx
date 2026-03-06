import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Tag } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import costTypeService from '@/services/costTypeService';
import usePermissions from '@/hooks/usePermissions';

const CostTypeListPage = () => {
    const { can } = usePermissions();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: '' });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchData = async () => { try { const data = await costTypeService.getCostTypes(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));
    // const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };
    const formatDate = (d) => {
        if (!d) return '-';
        try {
            return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return '-'; }
    };

    const openCreate = () => { setEditingItem(null); setForm({ name: '' }); setShowModal(true); };
    const openEdit = (item) => { setEditingItem(item); setForm({ name: item.name || '' }); setShowModal(true); };
    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { if (editingItem) await costTypeService.updateCostType(editingItem.costTypeId, form); else await costTypeService.createCostType(form); setShowModal(false); fetchData(); } catch (err) { alert(err?.message || 'Error'); } finally { setSaving(false); } };
    const handleDelete = (id) => { setDeleteConfirmId(id); };
    const confirmDelete = async () => { if (!deleteConfirmId) return; try { await costTypeService.deleteCostType(deleteConfirmId); fetchData(); setDeleteConfirmId(null); } catch (err) { alert(err?.message || 'Error'); } };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Cost Type</h1><p className="text-slate-500 text-sm mt-1">Manage cost categories for schedules</p></div>
                {can('CREATE_COST_TYPE') && <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Cost Type</button>}
            </div>
            <div className="flex gap-3 mb-4"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cost types..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div></div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><Tag className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No cost types found</p></div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full whitespace-nowrap"><thead><tr className="border-b border-slate-200">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                        </tr></thead>
                            <tbody>{filtered.map((item, index) => (
                                <tr key={item.costTypeId} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="px-5 py-3.5 text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.name}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            {can('UPDATE_COST_TYPE') && <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />}
                                            {can('DELETE_COST_TYPE') && <ActionButton onClick={() => handleDelete(item.costTypeId)} icon={Trash2} title="Delete" color="red" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody></table>
                    </div>
                )}
            </div>

            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingItem ? 'Edit Cost Type' : 'Add New Cost Type'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Name<span className="text-red-500">*</span></label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></div></form></div></div>)}

            {
                deleteConfirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteConfirmId(null)} />
                        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Cost Type</h3>
                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this cost type? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CostTypeListPage;
