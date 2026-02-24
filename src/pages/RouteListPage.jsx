import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, MapPin, Eye } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import routeService from '@/services/routeService';

const RouteListPage = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [form, setForm] = useState({ name: '', start_point: '', end_point: '', distance: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [detailRoute, setDetailRoute] = useState(null);

    const fetchData = async () => {
        try {
            const data = await routeService.getRoutes();
            setRoutes(Array.isArray(data) ? data : []);
        } catch { setRoutes([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = routes.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return [r.name, r.start_point, r.end_point].some(v => v?.toLowerCase().includes(q));
    });

    const openCreate = () => {
        setEditingRoute(null);
        setForm({ name: '', start_point: '', end_point: '', distance: '' });
        setShowModal(true);
    };

    const openEdit = (route) => {
        setEditingRoute(route);
        setForm({
            name: route.name || '',
            start_point: route.start_point || '',
            end_point: route.end_point || '',
            distance: route.distance || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                start_point: form.start_point,
                end_point: form.end_point,
                distance: Number(form.distance) || 1,
            };
            if (editingRoute) {
                await routeService.updateRoute(editingRoute.id, payload);
            } else {
                await routeService.createRoute(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err?.message || 'Error saving route'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await routeService.deleteRoute(deleteConfirm.id);
            fetchData();
        } catch (err) { alert(err?.message || 'Error deleting route'); }
        finally { setDeleteConfirm(null); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Route Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage transportation routes</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Route
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, start or end point..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <MapPin className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No routes found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route Name</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Point</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">End Point</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((route, index) => (
                                <tr key={route.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-indigo-400" />
                                            <span className="text-sm font-medium text-slate-900">{route.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{route.start_point}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{route.end_point}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{route.distance ? `${route.distance} km` : '-'}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <ActionButton onClick={() => setDetailRoute(route)} icon={Eye} title="View" color="slate" />
                                            <ActionButton onClick={() => openEdit(route)} icon={Pencil} title="Edit" color="blue" />
                                            <ActionButton onClick={() => setDeleteConfirm(route)} icon={Trash2} title="Delete" color="red" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ─── Route Detail Modal ─── */}
            {detailRoute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailRoute(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Route Details</h2>
                            <button onClick={() => setDetailRoute(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shadow-sm">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{detailRoute.name}</h3>
                                    <p className="text-sm text-slate-500">Route ID: #{detailRoute.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">ID</span>
                                    <p className="text-slate-900 font-medium mt-0.5">#{detailRoute.id}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Name</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailRoute.name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Start Point</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailRoute.start_point}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">End Point</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailRoute.end_point}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Distance</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailRoute.distance ? `${detailRoute.distance} km` : '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button onClick={() => setDetailRoute(null)} className="w-full py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
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
                            <h3 className="text-lg font-bold text-slate-900">Delete Route</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete route <span className="font-semibold text-slate-700">{deleteConfirm.name}</span>? This action cannot be undone.
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
                            <h2 className="text-xl font-bold text-slate-900">{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Route Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="e.g. HCM - Hanoi"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Point <span className="text-red-500">*</span></label>
                                        <input
                                            value={form.start_point}
                                            onChange={e => setForm({ ...form, start_point: e.target.value })}
                                            required
                                            placeholder="Ho Chi Minh City"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Point <span className="text-red-500">*</span></label>
                                        <input
                                            value={form.end_point}
                                            onChange={e => setForm({ ...form, end_point: e.target.value })}
                                            required
                                            placeholder="Hanoi"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Distance (km) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={form.distance}
                                        onChange={e => setForm({ ...form, distance: e.target.value })}
                                        required
                                        min="0.1"
                                        step="0.1"
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
                                        ) : (editingRoute ? 'Update Route' : 'Create Route')}
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

export default RouteListPage;
