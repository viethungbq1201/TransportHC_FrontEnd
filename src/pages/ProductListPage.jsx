import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Package, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';

const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return Number(price).toLocaleString('vi-VN') + ' ₫';
};

const ProductListPage = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: '', categoryId: '', price: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [detailItem, setDetailItem] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 10;

    const fetchData = async (page = currentPage) => {
        setLoading(true);
        try {
            const [pageData, catData] = await Promise.all([
                productService.getProductsPaged(page, PAGE_SIZE),
                categoryService.getCategories(),
            ]);
            setItems(pageData?.content || []);
            setCurrentPage(pageData?.page || 0);
            setTotalPages(pageData?.totalPages || 0);
            setTotalElements(pageData?.totalElements || 0);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch {
            setItems([]);
            setCategories([]);
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(0); }, []);

    const filtered = items.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !search || [p.name, p.category?.name].some(v => v?.toLowerCase().includes(q));
        const matchCategory = !categoryFilter || String(p.category?.categoryId) === categoryFilter;
        return matchSearch && matchCategory;
    });

    const openCreate = () => {
        setEditingItem(null);
        setForm({ name: '', categoryId: categories.length > 0 ? String(categories[0].categoryId) : '', price: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name || '',
            categoryId: item.category?.categoryId ? String(item.category.categoryId) : '',
            price: item.price || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                categoryId: Number(form.categoryId),
                price: Number(form.price),
            };
            if (editingItem) {
                await productService.updateProduct(editingItem.id, payload);
            } else {
                await productService.createProduct(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error saving product'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await productService.deleteProduct(deleteConfirm.id);
            fetchData();
        } catch (err) { alert(err?.message || 'Error deleting product'); }
        finally { setDeleteConfirm(null); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your product catalog</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.categoryId} value={String(cat.categoryId)}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Package className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No products found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-500">{currentPage * PAGE_SIZE + index + 1}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-indigo-400" />
                                            <span className="text-sm font-medium text-slate-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {item.category?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{formatPrice(item.price)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <ActionButton onClick={() => setDetailItem(item)} icon={Eye} title="View" color="slate" />
                                            <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />
                                            <ActionButton onClick={() => setDeleteConfirm(item)} icon={Trash2} title="Delete" color="red" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{currentPage * PAGE_SIZE + 1}</span> to{' '}
                            <span className="font-medium text-slate-700">{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)}</span> of{' '}
                            <span className="font-medium text-slate-700">{totalElements}</span> products
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => fetchData(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="p-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {(() => {
                                const MAX_VISIBLE = 5;
                                let start = Math.max(0, currentPage - Math.floor(MAX_VISIBLE / 2));
                                let end = start + MAX_VISIBLE;
                                if (end > totalPages) { end = totalPages; start = Math.max(0, end - MAX_VISIBLE); }
                                const pages = [];
                                if (start > 0) {
                                    pages.push(<button key={0} onClick={() => fetchData(0)} className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">1</button>);
                                    if (start > 1) pages.push(<span key="start-dots" className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                                }
                                for (let i = start; i < end; i++) {
                                    pages.push(
                                        <button key={i} onClick={() => fetchData(i)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${i === currentPage ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{i + 1}</button>
                                    );
                                }
                                if (end < totalPages) {
                                    if (end < totalPages - 1) pages.push(<span key="end-dots" className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                                    pages.push(<button key={totalPages - 1} onClick={() => fetchData(totalPages - 1)} className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">{totalPages}</button>);
                                }
                                return pages;
                            })()}
                            <button
                                onClick={() => fetchData(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Product Detail Modal ─── */}
            {detailItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
                            <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shadow-sm">
                                    <Package className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{detailItem.name}</h3>
                                    <p className="text-sm text-slate-500">Product ID: #{detailItem.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">ID</span>
                                    <p className="text-slate-900 font-medium mt-0.5">#{detailItem.id}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Name</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailItem.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Category</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailItem.category?.name || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Price</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{formatPrice(detailItem.price)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button onClick={() => setDetailItem(null)} className="w-full py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete product <span className="font-semibold text-slate-700">{deleteConfirm.name}</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Create/Edit Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        minLength={4}
                                        maxLength={255}
                                        placeholder="Min 4 characters"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.categoryId}
                                        onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoryId} value={String(cat.categoryId)}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₫) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        required
                                        min="1"
                                        step="1"
                                        placeholder="Required (>0)"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200">
                                        {saving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (editingItem ? 'Update Product' : 'Create Product')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductListPage;
