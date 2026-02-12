import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, Package } from 'lucide-react';
import productService from '@/services/productService';

const ProductListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: '', category: '', unit: '', unitPrice: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);

    const fetchData = async () => { try { const data = await productService.getAllProducts(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(p => !search || [p.name, p.category, p.unit].some(v => v?.toLowerCase().includes(search.toLowerCase())));
    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setEditingItem(null); setForm({ name: '', category: '', unit: '', unitPrice: '', description: '' }); setShowModal(true); };
    const openEdit = (item) => { setEditingItem(item); setForm({ name: item.name || '', category: item.category || '', unit: item.unit || '', unitPrice: item.unitPrice || '', description: item.description || '' }); setShowModal(true); setActionMenuId(null); };

    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { if (editingItem) await productService.updateProduct(editingItem.id, form); else await productService.createProduct(form); setShowModal(false); fetchData(); } catch (err) { alert(err?.message || 'Error'); } finally { setSaving(false); } };
    const handleDelete = async (id) => { if (!window.confirm('Delete this product?')) return; try { await productService.deleteProduct(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Product Management</h1><p className="text-slate-500 text-sm mt-1">Manage your product catalog</p></div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Product</button>
            </div>
            <div className="flex gap-3 mb-4"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div></div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><Package className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No products found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Price</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.name}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.category || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.unit || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.unitPrice ? `$${item.unitPrice}` : '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(item.createdAt)}</td>
                                <td className="px-5 py-3.5 relative">
                                    <button onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)} className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                                    {actionMenuId === item.id && (<><div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} /><div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-36"><button onClick={() => openEdit(item)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5" /> Edit</button><button onClick={() => handleDelete(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button></div></>)}
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">{editingItem ? 'Edit Product' : 'Add New Product'}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Unit</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label><input type="number" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></div></form></div></div>)}
        </div>
    );
};

export default ProductListPage;
