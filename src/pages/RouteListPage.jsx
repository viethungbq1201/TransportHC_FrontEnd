import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, MapPin } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import routeService from '@/services/routeService';

const RouteListPage = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ startPoint: '', endPoint: '', distance: '', estimatedTime: '' });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);

    const fetchData = async () => { try { const data = await routeService.getRoutes(); setRoutes(Array.isArray(data) ? data : []); } catch { setRoutes([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = routes.filter(r => !search || [r.startPoint, r.endPoint].some(v => v?.toLowerCase().includes(search.toLowerCase())));
    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setForm({ startPoint: '', endPoint: '', distance: '', estimatedTime: '' }); setShowModal(true); };

    // No updateRoute endpoint in backend — create only
    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { await routeService.createRoute(form); setShowModal(false); fetchData(); } catch (err) { alert(err?.message || 'Error'); } finally { setSaving(false); } };
    const handleDelete = async (id) => { if (!window.confirm('Delete this route?')) return; try { await routeService.deleteRoute(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Route Management</h1><p className="text-slate-500 text-sm mt-1">Manage transportation routes</p></div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Route</button>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by start or end point..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><MapPin className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No routes found</p></div>
                ) : (
                    <table className="w-full">
                        <thead><tr className="border-b border-slate-200">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Point</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">End Point</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Time</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.startPoint}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.endPoint}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.distance ? `${item.distance} km` : '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.estimatedTime || '-'}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <ActionButton onClick={() => handleDelete(item.id)} icon={Trash2} title="Delete" color="red" />
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">Add New Route</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Point</label><input value={form.startPoint} onChange={e => setForm({ ...form, startPoint: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">End Point</label><input value={form.endPoint} onChange={e => setForm({ ...form, endPoint: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label><input type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Estimated Time</label><input value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} placeholder="e.g. 2h30m" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteListPage;
