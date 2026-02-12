import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Truck as TruckIcon } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import truckService from '@/services/truckService';
import { TruckStatus, TruckStatusLabels } from '@/constants/enums';

const statusBadge = (status) => {
    const map = {
        AVAILABLE: 'bg-green-50 text-green-700 border-green-200',
        IN_USE: 'bg-blue-50 text-blue-700 border-blue-200',
        MAINTENANCE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const TruckListPage = () => {
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ licensePlate: '', model: '', capacity: '', driverAssigned: '', status: 'AVAILABLE' });
    const [saving, setSaving] = useState(false);

    const fetchTrucks = async () => {
        try {
            const data = await truckService.getAllTrucks();
            setTrucks(Array.isArray(data) ? data : []);
        } catch { setTrucks([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTrucks(); }, []);

    const filtered = trucks.filter(t => {
        const matchSearch = !search || [t.licensePlate, t.model, t.driverAssigned].some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = !statusFilter || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCreate = () => { setForm({ licensePlate: '', model: '', capacity: '', driverAssigned: '', status: 'AVAILABLE' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await truckService.createTruck(form);
            setShowModal(false);
            fetchTrucks();
        } catch (err) { alert(err?.message || 'Error saving truck'); }
        finally { setSaving(false); }
    };

    const handleStatusChange = async (truck, newStatus) => {
        try {
            await truckService.updateTruckStatus(truck.id, { status: newStatus });
            fetchTrucks();
        } catch (err) { alert(err?.message || 'Error updating status'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this truck?')) return;
        try { await truckService.deleteTruck(id); fetchTrucks(); }
        catch (err) { alert(err?.message || 'Error deleting truck'); }
    };

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Truck Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your fleet of trucks</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" /> Add Truck
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by plate, model, or driver..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">All Status</option>
                    <option value={TruckStatus.AVAILABLE}>{TruckStatusLabels[TruckStatus.AVAILABLE]}</option>
                    <option value={TruckStatus.IN_USE}>{TruckStatusLabels[TruckStatus.IN_USE]}</option>
                    <option value={TruckStatus.MAINTENANCE}>{TruckStatusLabels[TruckStatus.MAINTENANCE]}</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <TruckIcon className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No trucks found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">License Plate</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver Assigned</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(truck => (
                                <tr key={truck.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <TruckIcon className="w-4 h-4 text-slate-400" /> {truck.licensePlate}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{truck.model}</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{truck.capacity} tons</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{truck.driverAssigned || <span className="text-slate-400">Not assigned</span>}</td>
                                    <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(truck.status)}`}>{TruckStatusLabels[truck.status] || truck.status}</span></td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(truck.createdAt)}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <ActionButton onClick={() => handleDelete(truck.id)} icon={Trash2} title="Delete" color="red" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal — no edit since backend only supports status updates */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">Add New Truck</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label><input value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Capacity (tons)</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Driver</label><input value={form.driverAssigned} onChange={e => setForm({ ...form, driverAssigned: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TruckListPage;
