import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import transactionDetailService from '@/services/transactionDetailService';
import transactionService from '@/services/transactionService';
import productService from '@/services/productService';
import inventoryService from '@/services/inventoryService';
import usePermissions from '@/hooks/usePermissions';

const TransactionDetailListPage = () => {
    const { can } = usePermissions();
    const location = useLocation();
    const [items, setItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(location.state?.transactionId ? String(location.state.transactionId) : '');
    const [typeFilter, setTypeFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ transactionId: '', productId: '', quantityChange: '' });
    const [editId, setEditId] = useState(null);
    const [actionMenuId, setActionMenuId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                transactionDetailService.getAll(),
                transactionService.getAllTransactions(),
                productService.getProducts(),
                inventoryService.getInventories()
            ]);

            const data = results[0].status === 'fulfilled' ? results[0].value : [];
            const transData = results[1].status === 'fulfilled' ? results[1].value : [];
            const prodData = results[2].status === 'fulfilled' ? results[2].value : [];
            const invData = results[3].status === 'fulfilled' ? results[3].value : [];

            setItems(Array.isArray(data) ? data : []);
            setTransactions(Array.isArray(transData) ? transData : []);
            setProducts(Array.isArray(prodData) ? prodData : []);
            setInventories(Array.isArray(invData) ? invData : []);
        } catch (error) {
            console.error(error);
            setItems([]);
            setTransactions([]);
            setProducts([]);
            setInventories([]);
        }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(r => {
        const term = search.toLowerCase();
        const t = r.transaction;
        const matchSearch = !search ||
            String(r.transactionDetailId).includes(term) ||
            r.product?.name?.toLowerCase().includes(term) ||
            String(t?.transactionId).includes(term) ||
            t?.note?.toLowerCase().includes(term) ||
            t?.createdBy?.fullName?.toLowerCase().includes(term);
        const matchType = !typeFilter || t?.transactionType === typeFilter;
        return matchSearch && matchType;
    });

    const openCreate = () => { setEditId(null); setForm({ transactionId: '', productId: '', quantityChange: '' }); setShowModal(true); };
    const openEdit = (item) => {
        setEditId(item.transactionDetailId);
        setForm({
            transactionId: String(item.transaction?.transactionId || ''),
            productId: String(item.product?.productId || item.product?.id || ''),
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

    const handleDelete = (id) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try { await transactionDetailService.delete(deleteConfirmId); fetchData(); setDeleteConfirmId(null); }
        catch (err) { alert(err?.message || 'Error'); }
    }

    const groupedItems = filtered.reduce((acc, current) => {
        const tid = current.transaction?.transactionId || 'Unknown';
        if (!acc[tid]) acc[tid] = { transaction: current.transaction, details: [] };
        acc[tid].details.push(current);
        return acc;
    }, {});
    const groupedData = Object.values(groupedItems).sort((a, b) => (b.transaction?.transactionId || 0) - (a.transaction?.transactionId || 0));

    const selectedInventory = form.productId ? inventories.find(inv => String(inv.product?.id || inv.product?.productId) === String(form.productId)) : null;
    const selectedStock = selectedInventory ? (selectedInventory.quantity || 0) - (selectedInventory.inTransit || 0) : null;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transaction Details</h1>
                    <p className="text-sm text-slate-500 mt-1">{items.length} detail records</p>
                </div>
                {can('CREATE_TRANSACTION_DETAIL') && (
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        <Plus className="w-4 h-4" /> Add Detail
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search ID, note, creator, product..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">All Types</option>
                    <option value="IN">In (Import)</option>
                    <option value="OUT">Out (Export)</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400"><p>No transaction details found</p></div>
            ) : (
                <div className="space-y-6">
                    {groupedData.map(group => {
                        const t = group.transaction;
                        const isPending = t?.approveStatus === 'PENDING';
                        const isExport = t?.transactionType === 'IN';
                        return (
                            <div key={t?.transactionId || 'unknown'} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-slate-900">Transaction <span className="font-bold">#{t?.transactionId}</span> &mdash; {t?.transactionType}</h3>
                                        <p className="text-sm text-slate-500 mt-0.5">Status: <span className="font-medium text-slate-700">{t?.approveStatus || '-'}</span> | Created by: {t?.createdBy?.fullName || '-'}</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Note: {t?.note || '-'}</p>
                                    </div>
                                    {!isPending && <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">Locked</span>}
                                </div>
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-slate-100 bg-white">
                                        <th className="text-left px-5 py-3 font-medium text-slate-500 w-16">No.</th>
                                        <th className="text-left px-5 py-3 font-medium text-slate-500">Product</th>
                                        <th className="text-right px-5 py-3 font-medium text-slate-500 w-32">Qty Change</th>
                                        <th className="text-right px-5 py-3 font-medium text-slate-500 w-24">Actions</th>
                                    </tr></thead>
                                    <tbody>{group.details.map((r, index) => (
                                        <tr key={r.transactionDetailId} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="px-5 py-3 font-medium text-slate-900">{index + 1}</td>
                                            <td className="px-5 py-3 text-slate-600">{r.product?.name || '-'}</td>
                                            <td className="px-5 py-3 text-right font-medium text-slate-900">{isExport ? `+${r.quantityChange}` : `-${r.quantityChange}`}</td>
                                            <td className="px-5 py-3 flex justify-end">
                                                {isPending ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {can('UPDATE_TRANSACTION_DETAIL') && <ActionButton onClick={() => openEdit(r)} icon={Pencil} title="Edit" color="blue" />}
                                                        {can('DELETE_TRANSACTION_DETAIL') && <ActionButton onClick={() => handleDelete(r.transactionDetailId)} icon={Trash2} title="Delete" color="red" />}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No access</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editId ? 'Edit' : 'Add'} Transaction Detail</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction</label>
                    <select value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">Select Transaction...</option>
                        {transactions
                            .filter(t => t.approveStatus === 'PENDING' || t.transactionId === Number(form.transactionId))
                            .map(t => (
                                <option key={t.transactionId} value={t.transactionId}>
                                    #{t.transactionId} - {t.transactionType} ({t.createdBy?.fullName || 'Unknown'})
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="ID"
                            value={form.productId}
                            onChange={e => setForm({ ...form, productId: e.target.value })}
                            className="w-20 min-w-[5rem] px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <select
                            value={form.productId}
                            onChange={e => setForm({ ...form, productId: e.target.value })}
                            required
                            className="flex-1 min-w-0 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Select Product...</option>
                            {products.map(p => (
                                <option key={p.productId || p.id} value={p.productId || p.id}>
                                    {p.name || p.productName} - ${(p.price || 0).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    {form.productId && (
                        <div className="mt-1.5 flex items-center justify-between text-xs px-1">
                            <span className="text-slate-500">Remaining Stock (Qty - In Transit):</span>
                            <span className={`font-semibold ${selectedStock !== null && selectedStock <= 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                {selectedStock !== null ? selectedStock.toLocaleString() : 'No inventory record'}
                            </span>
                        </div>
                    )}
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Quantity Change</label><input type="number" value={form.quantityChange} onChange={e => setForm({ ...form, quantityChange: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button></div>
            </form></div></div>)}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Detail</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this detail record? This action cannot be undone.</p>
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

export default TransactionDetailListPage;
