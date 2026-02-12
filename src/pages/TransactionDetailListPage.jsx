import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import transactionDetailService from '@/services/transactionDetailService';

const TransactionDetailListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ transactionId: '', productId: '', quantityChange: '' });
    const [editId, setEditId] = useState(null);
    const [actionMenuId, setActionMenuId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await transactionDetailService.getAll();
            setItems(data);
        } catch { setItems([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(r => {
        const term = search.toLowerCase();
        return !search ||
            String(r.transactionDetailId).includes(term) ||
            r.product?.productName?.toLowerCase().includes(term) ||
            String(r.transaction?.transactionId).includes(term);
    });

    const openCreate = () => { setEditId(null); setForm({ transactionId: '', productId: '', quantityChange: '' }); setShowModal(true); };
    const openEdit = (item) => {
        setEditId(item.transactionDetailId);
        setForm({
            transactionId: String(item.transaction?.transactionId || ''),
            productId: String(item.product?.productId || ''),
            quantityChange: String(item.quantityChange || ''),
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                transactionId: Number(form.transactionId),
                productId: Number(form.productId),
                quantityChange: Number(form.quantityChange),
            };
            if (editId) {
                await transactionDetailService.update(editId, payload);
            } else {
                await transactionDetailService.create(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction detail?')) return;
        try { await transactionDetailService.delete(id); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transaction Details</h1>
                    <p className="text-sm text-slate-500 mt-1">{items.length} detail records</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" /> Add Detail
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search details..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400"><p>No transaction details found</p></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="text-left px-5 py-3 font-medium text-slate-500">ID</th>
                            <th className="text-left px-5 py-3 font-medium text-slate-500">Transaction</th>
                            <th className="text-left px-5 py-3 font-medium text-slate-500">Product</th>
                            <th className="text-right px-5 py-3 font-medium text-slate-500">Qty Change</th>
                            <th className="text-left px-5 py-3 font-medium text-slate-500">Actions</th>
                        </tr></thead>
                        <tbody>{filtered.map(r => (
                            <tr key={r.transactionDetailId} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="px-5 py-3 font-medium text-slate-900">{r.transactionDetailId}</td>
                                <td className="px-5 py-3 text-slate-600">#{r.transaction?.transactionId}</td>
                                <td className="px-5 py-3 text-slate-600">{r.product?.productName || '-'}</td>
                                <td className="px-5 py-3 text-right font-medium text-slate-900">{r.quantityChange}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <ActionButton onClick={() => openEdit(r)} icon={Pencil} title="Edit" color="blue" />
                                        <ActionButton onClick={() => handleDelete(r.transactionDetailId)} icon={Trash2} title="Delete" color="red" />
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editId ? 'Edit' : 'Add'} Transaction Detail</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID</label><input type="number" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Product ID</label><input type="number" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Quantity Change</label><input type="number" value={form.quantityChange} onChange={e => setForm({ ...form, quantityChange: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button></div>
            </form></div></div>)}
        </div>
    );
};

export default TransactionDetailListPage;
