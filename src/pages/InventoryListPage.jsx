import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X, Warehouse, Package, AlertTriangle, Download, Upload, ArrowUp, Eye, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import inventoryService from '@/services/inventoryService';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import usePermissions from '@/hooks/usePermissions';

const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return Number(price).toLocaleString('vi-VN') + ' ₫';
};

const formatDate = (d) => {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
};

const formatCurrency = (val) => {
    const num = Number(val);
    return isNaN(num) ? '$0' : `$${num.toLocaleString()}`;
};

const quantityBadge = (quantity) => {
    if (quantity <= 0) return 'bg-red-50 text-red-700 border-red-200';
    if (quantity < 20) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-green-50 text-green-700 border-green-200';
};

const InventoryListPage = () => {
    const { can } = usePermissions();
    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ productId: '', quantity: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [exporting, setExporting] = useState(false);
    const importRef = useRef(null);

    // Advanced filter state
    const [showAdvFilter, setShowAdvFilter] = useState(false);
    const [advFilter, setAdvFilter] = useState({
        productName: '', categoryName: '', quantityMin: '', quantityMax: '',
        fromDate: '', toDate: '', totalMin: '', totalMax: '',
    });
    const [isFiltered, setIsFiltered] = useState(false);
    const [filtering, setFiltering] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 10;

    const loadData = useCallback(async (page = 0, showSpinner = true) => {
        if (showSpinner) setLoading(true);
        try {
            const results = await Promise.allSettled([
                inventoryService.getInventoriesPaged(page, PAGE_SIZE),
                inventoryService.getInventories(),
                productService.getProducts(),
                categoryService.getCategories(),
            ]);

            const pageData = results[0].status === 'fulfilled' ? results[0].value : null;
            const allInvData = results[1].status === 'fulfilled' ? results[1].value : [];
            const prodData = results[2].status === 'fulfilled' ? results[2].value : [];
            const catData = results[3].status === 'fulfilled' ? results[3].value : [];

            setItems(pageData?.content || []);
            setCurrentPage(pageData?.page || 0);
            setTotalPages(pageData?.totalPages || 0);
            setTotalElements(pageData?.totalElements || 0);
            setAllItems(Array.isArray(allInvData) ? allInvData : []);
            setProducts(Array.isArray(prodData) ? prodData : []);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (error) {
            console.error(error);
        }
        finally { if (showSpinner) setLoading(false); }
    }, []);

    useEffect(() => { loadData(0, true); }, [loadData]);

    // Determine if local search/category filter is active
    const hasLocalFilter = !!(search || categoryFilter);

    // When local filter is active → search across ALL data (allItems)
    // When no filter → show current page data (items)
    // When advanced filter is active → items already set from API, no local filter allowed
    const dataSource = hasLocalFilter ? allItems : items;
    const filtered = dataSource.filter(i => {
        const matchSearch = !search || i.product?.name?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !categoryFilter || String(i.product?.category?.categoryId) === categoryFilter;
        return matchSearch && matchCategory;
    });

    const handleApplyFilter = async () => {
        setFiltering(true);
        try {
            const payload = {};
            if (advFilter.productName) payload.productName = advFilter.productName;
            if (advFilter.categoryName) payload.categoryName = advFilter.categoryName;
            if (advFilter.quantityMin) payload.quantityMin = Number(advFilter.quantityMin);
            if (advFilter.quantityMax) payload.quantityMax = Number(advFilter.quantityMax);
            if (advFilter.fromDate) payload.fromDate = new Date(advFilter.fromDate).toISOString();
            if (advFilter.toDate) payload.toDate = new Date(advFilter.toDate).toISOString();
            if (advFilter.totalMin) payload.totalMin = Number(advFilter.totalMin);
            if (advFilter.totalMax) payload.totalMax = Number(advFilter.totalMax);

            const data = await inventoryService.filterInventory(payload);
            const filtered = Array.isArray(data) ? data : [];
            setItems(filtered);
            setAllItems(filtered);
            setIsFiltered(true);
            // Disable regular filters when advanced filter is active
            setSearch('');
            setCategoryFilter('');
        } catch (err) { toast.error(err?.message || 'Error filtering inventory'); }
        finally { setFiltering(false); }
    };

    // Only clear input fields, keep panel open and current data
    const handleClearInputs = () => {
        setAdvFilter({ productName: '', categoryName: '', quantityMin: '', quantityMax: '', fromDate: '', toDate: '', totalMin: '', totalMax: '' });
    };

    // Reset everything: clear fields, reload full data, close panel
    const handleClearAllFilters = () => {
        setAdvFilter({ productName: '', categoryName: '', quantityMin: '', quantityMax: '', fromDate: '', toDate: '', totalMin: '', totalMax: '' });
        setIsFiltered(false);
        setShowAdvFilter(false);
        setSearch('');
        setCategoryFilter('');
        loadData(0);
    };

    const totalProducts = allItems.length;
    const totalQty = allItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const inTransitCount = allItems.reduce((sum, i) => sum + (i.inTransit || 0), 0);
    const lowStock = allItems.filter(i => (i.quantity || 0) < 20).length;

    // Get products that don't already have inventory (for create form)
    const availableProducts = products.filter(p =>
        !allItems.some(inv => inv.product?.id === p.id)
    );

    const openCreate = () => {
        setEditingItem(null);
        setForm({
            productId: availableProducts.length > 0 ? String(availableProducts[0].id) : '',
            quantity: '',
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({ productId: '', quantity: String(item.quantity || '') });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingItem) {
                await inventoryService.updateInventory(editingItem.inventoryId, {
                    quantity: Number(form.quantity),
                });
                toast.success('Inventory updated');
            } else {
                await inventoryService.createInventory({
                    productId: Number(form.productId),
                    quantity: Number(form.quantity),
                    upToDate: new Date().toISOString(),
                });
                toast.success('Inventory created');
            }
            setShowModal(false);
            loadData(0, false);
        } catch (err) { toast.error(err?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setItems(prev => prev.filter(i => i.inventoryId !== deleteConfirm.inventoryId));
        setAllItems(prev => prev.filter(i => i.inventoryId !== deleteConfirm.inventoryId));
        setDeleteConfirm(null);
        try {
            await inventoryService.deleteInventory(deleteConfirm.inventoryId);
            toast.success('Inventory deleted');
        } catch (err) { toast.error(err?.message || 'Error'); loadData(0, false); }
    };

    const handleExport = async () => {
        setExporting(true);
        try { await inventoryService.exportInventory(); toast.success('Export complete'); }
        catch (err) { toast.error(err?.message || 'Error exporting'); }
        finally { setExporting(false); }
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await inventoryService.importInventory(file);
            toast.success('Import complete');
            loadData(0, false);
        } catch (err) { toast.error(err?.message || 'Error importing'); }
        finally { if (importRef.current) importRef.current.value = ''; }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage inventory</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <input type="file" ref={importRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                    <button onClick={() => importRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4" /> Import
                    </button>
                    <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                        <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export'}
                    </button>
                    {can('CREATE_INVENTORY') && (
                        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" /> Add Inventory
                        </button>
                    )}
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between shadow-sm">
                    <div><p className="text-sm text-slate-500">Total Products</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</p></div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><Package className="w-6 h-6 text-green-600" /></div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between shadow-sm">
                    <div><p className="text-sm text-slate-500">Total Quantity</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalQty.toLocaleString()}</p></div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Warehouse className="w-6 h-6 text-blue-600" /></div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between shadow-sm">
                    <div><p className="text-sm text-slate-500">In Transit</p><p className="text-2xl font-bold text-slate-900 mt-1">{inTransitCount.toLocaleString()}</p></div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><ArrowUp className="w-6 h-6 text-purple-600" /></div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between shadow-sm">
                    <div><p className="text-sm text-slate-500">Low Stock (&lt;20)</p><p className="text-2xl font-bold text-slate-900 mt-1">{lowStock}</p></div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-yellow-600" /></div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        disabled={isFiltered}
                        placeholder={isFiltered ? 'Disabled during advanced filter' : 'Search by product name...'}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${isFiltered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200'
                            }`}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    disabled={isFiltered}
                    className={`px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isFiltered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.categoryId} value={String(cat.categoryId)}>{cat.name}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowAdvFilter(!showAdvFilter)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors border ${showAdvFilter || isFiltered
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {isFiltered && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
            </div>

            {/* Advanced Filter Panel */}
            {showAdvFilter && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Advanced Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Product Name</label>
                            <input
                                value={advFilter.productName}
                                onChange={e => setAdvFilter({ ...advFilter, productName: e.target.value })}
                                placeholder="e.g. Laptop"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Category Name</label>
                            <input
                                value={advFilter.categoryName}
                                onChange={e => setAdvFilter({ ...advFilter, categoryName: e.target.value })}
                                placeholder="e.g. Electronics"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Quantity Min</label>
                            <input
                                type="number" min="0"
                                value={advFilter.quantityMin}
                                onChange={e => setAdvFilter({ ...advFilter, quantityMin: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Quantity Max</label>
                            <input
                                type="number" min="0"
                                value={advFilter.quantityMax}
                                onChange={e => setAdvFilter({ ...advFilter, quantityMax: e.target.value })}
                                placeholder="1000"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                            <input
                                type="datetime-local"
                                value={advFilter.fromDate}
                                onChange={e => setAdvFilter({ ...advFilter, fromDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                            <input
                                type="datetime-local"
                                value={advFilter.toDate}
                                onChange={e => setAdvFilter({ ...advFilter, toDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Total Value Min</label>
                            <input
                                type="number" min="0"
                                value={advFilter.totalMin}
                                onChange={e => setAdvFilter({ ...advFilter, totalMin: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Total Value Max</label>
                            <input
                                type="number" min="0"
                                value={advFilter.totalMax}
                                onChange={e => setAdvFilter({ ...advFilter, totalMax: e.target.value })}
                                placeholder="99999999"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleApplyFilter}
                            disabled={filtering}
                            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm"
                        >
                            {filtering ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Filtering...
                                </span>
                            ) : 'Apply Filters'}
                        </button>
                        <button
                            onClick={handleClearInputs}
                            className="px-5 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Clear
                        </button>
                        {isFiltered && (
                            <button
                                onClick={handleClearAllFilters}
                                className="px-5 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Warehouse className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No inventory items found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full whitespace-nowrap min-w-full lg:min-w-[1000px] table-fixed">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                                    <th className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="hidden md:table-cell text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Category</th>
                                    <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Price</th>
                                    <th className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Quantity</th>
                                    <th className="hidden md:table-cell text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">In Transit</th>
                                    <th className="hidden lg:table-cell text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Last Updated</th>
                                    <th className="text-right px-4 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider pr-6 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((item, index) => (
                                    <tr key={item.inventoryId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 sm:px-5 py-4 text-sm text-slate-500">{(hasLocalFilter || isFiltered) ? index + 1 : currentPage * PAGE_SIZE + index + 1}</td>
                                        <td className="px-4 sm:px-5 py-4 truncate">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                                <span className="text-sm font-medium text-slate-900 truncate">{item.product?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {item.product?.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-600">{formatPrice(item.product?.price)}</td>
                                        <td className="px-4 sm:px-5 py-4">
                                            <span className={`text-sm font-semibold ${(item.quantity || 0) < 20 ? 'text-red-600' : 'text-slate-900'}`}>
                                                {(item.quantity ?? 0).toLocaleString()}
                                            </span>
                                            {(item.quantity || 0) < 20 && (
                                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">LOW</span>
                                            )}
                                        </td>
                                        <td className="hidden md:table-cell px-5 py-4 text-sm text-slate-600">{(item.inTransit ?? 0).toLocaleString()}</td>
                                        <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-500">{formatDate(item.upToDate)}</td>
                                        <td className="px-4 sm:px-5 py-4">
                                            <div className="flex items-center justify-end gap-1 sm:gap-1.5 pr-1">
                                                <ActionButton onClick={() => setDetailItem(item)} icon={Eye} title="View" color="slate" />
                                                {can('UPDATE_INVENTORY') && <ActionButton onClick={() => openEdit(item)} icon={Pencil} title="Edit" color="blue" />}
                                                {can('DELETE_INVENTORY') && <ActionButton onClick={() => setDeleteConfirm(item)} icon={Trash2} title="Delete" color="red" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && !isFiltered && !hasLocalFilter && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3 border-t border-slate-200 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{currentPage * PAGE_SIZE + 1}</span> to{' '}
                            <span className="font-medium text-slate-700">{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)}</span> of{' '}
                            <span className="font-medium text-slate-700">{totalElements}</span> items
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => loadData(currentPage - 1)}
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
                                    pages.push(<button key={0} onClick={() => loadData(0)} className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">1</button>);
                                    if (start > 1) pages.push(<span key="start-dots" className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                                }
                                for (let i = start; i < end; i++) {
                                    pages.push(
                                        <button key={i} onClick={() => loadData(i)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${i === currentPage ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{i + 1}</button>
                                    );
                                }
                                if (end < totalPages) {
                                    if (end < totalPages - 1) pages.push(<span key="end-dots" className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                                    pages.push(<button key={totalPages - 1} onClick={() => loadData(totalPages - 1)} className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">{totalPages}</button>);
                                }
                                return pages;
                            })()}
                            <button
                                onClick={() => loadData(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Inventory Detail Modal ─── */}
            {
                detailItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Inventory Details</h2>
                                <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                    <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shadow-sm">
                                        <Warehouse className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{detailItem.product?.name || '-'}</h3>
                                        <p className="text-sm text-slate-500">Inventory ID: #{detailItem.inventoryId}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div>
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Inventory ID</span>
                                        <p className="text-slate-900 font-medium mt-0.5">#{detailItem.inventoryId}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Product</span>
                                        <p className="text-slate-900 font-medium mt-0.5">{detailItem.product?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Category</span>
                                        <p className="text-slate-900 font-medium mt-0.5">{detailItem.product?.category?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Price</span>
                                        <p className="text-slate-900 font-medium mt-0.5">{formatPrice(detailItem.product?.price)}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Quantity</span>
                                        <p className={`font-semibold mt-0.5 ${(detailItem.quantity || 0) < 20 ? 'text-red-600' : 'text-slate-900'}`}>
                                            {(detailItem.quantity ?? 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">In Transit</span>
                                        <p className="text-slate-900 font-medium mt-0.5">{(detailItem.inTransit ?? 0).toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Last Updated</span>
                                        <p className="text-slate-900 font-medium mt-0.5">{formatDate(detailItem.upToDate)}</p>
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
                )
            }

            {/* ─── Delete Confirmation Modal ─── */}
            {
                deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Delete Inventory</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Are you sure you want to delete inventory for <span className="font-semibold text-slate-700">{deleteConfirm.product?.name}</span>? This action cannot be undone.
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
                )
            }

            {/* ─── Create/Edit Modal ─── */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'Update Quantity' : 'Add Inventory'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {!editingItem ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product <span className="text-red-500">*</span></label>
                                                <select
                                                    value={form.productId}
                                                    onChange={e => setForm({ ...form, productId: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                >
                                                    <option value="">Select a product</option>
                                                    {availableProducts.map(p => (
                                                        <option key={p.id} value={String(p.id)}>
                                                            {p.name} ({p.category?.name || 'No category'})
                                                        </option>
                                                    ))}
                                                </select>
                                                {availableProducts.length === 0 && (
                                                    <p className="text-xs text-amber-600 mt-1">All products already have inventory records.</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Quantity <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    value={form.quantity}
                                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                                    required
                                                    min="1"
                                                    placeholder="Required (>0)"
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <Package className="w-8 h-8 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{editingItem.product?.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {editingItem.product?.category?.name || '-'} · Current: {editingItem.quantity?.toLocaleString() ?? 0}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Quantity <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    value={form.quantity}
                                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                                    required
                                                    min="1"
                                                    placeholder="Required (>0)"
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                        </>
                                    )}
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
                                            ) : (editingItem ? 'Update Quantity' : 'Create Inventory')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default InventoryListPage;
