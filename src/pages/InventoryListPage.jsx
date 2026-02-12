import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, Warehouse, Package, AlertTriangle, Download, ArrowUp, ArrowDown } from 'lucide-react';
import inventoryService from '@/services/inventoryService';

const InventoryListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    // Backend DTO: InventoryCreateRequest { productId } only
    const [form, setForm] = useState({ productId: '' });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);

    const fetchData = async () => { try { const data = await inventoryService.getInventories(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    // Filter using nested product/category from InventoryResponse
    const filtered = items.filter(i => {
        if (!search) return true;
        const term = search.toLowerCase();
        return i.product?.name?.toLowerCase().includes(term) ||
            i.product?.category?.name?.toLowerCase().includes(term);
    });

    const totalProducts = items.length;
    const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const inTransitCount = items.reduce((sum, i) => sum + (i.inTransit || 0), 0);
    const lowStock = items.filter(i => (i.quantity || 0) < 10).length;

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openAdd = () => { setEditingItem(null); setForm({ productId: '' }); setShowModal(true); };
    const openEdit = (item) => { setEditingItem(item); setForm({ productId: item.product?.id || '' }); setShowModal(true); setActionMenuId(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingItem) {
                await inventoryService.updateInventory(editingItem.inventoryId, form);
            } else {
                await inventoryService.createInventory({ productId: Number(form.productId) });
            }
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this inventory item?')) return;
        try { await inventoryService.deleteInventory(id); fetchData(); }
        catch (err) { alert(err?.message || 'Error'); }
        setActionMenuId(null);
    };

    const handleExport = async () => {
        try { await inventoryService.exportInventory(); } catch (err) { alert(err?.message || 'Error exporting'); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1><p className="text-slate-500 text-sm mt-1">Track and manage inventory</p></div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"><Download className="w-4 h-4" /> Export</button>
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Inventory</button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Products</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</p></div><div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><Package className="w-6 h-6 text-green-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Total Quantity</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalQty}</p></div><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Warehouse className="w-6 h-6 text-blue-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">In Transit</p><p className="text-2xl font-bold text-slate-900 mt-1">{inTransitCount}</p></div><div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><ArrowUp className="w-6 h-6 text-purple-600" /></div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Low Stock Items</p><p className="text-2xl font-bold text-slate-900 mt-1">{lowStock}</p></div><div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-yellow-600" /></div></div>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product or category..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><Warehouse className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No inventory items found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">In Transit</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Up To Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.inventoryId} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.product?.name || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.product?.category?.name || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.product?.price ? `$${Number(item.product.price).toLocaleString()}` : '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.quantity ?? 0}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.inTransit ?? 0}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${item.upToDate ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {item.upToDate ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 relative">
                                    <button onClick={() => setActionMenuId(actionMenuId === item.inventoryId ? null : item.inventoryId)} className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                                    {actionMenuId === item.inventoryId && (<><div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} /><div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-36">
                                        <button onClick={() => openEdit(item)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                                        <button onClick={() => handleDelete(item.inventoryId)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                    </div></>)}
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingItem ? 'Update Inventory' : 'Add Inventory'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Product ID</label><input type="number" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></div>
            </form></div></div>)}
        </div>
    );
};

export default InventoryListPage;
