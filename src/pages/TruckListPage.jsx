import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, Truck as TruckIcon, Eye, ChevronDown } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import truckService from '@/services/truckService';
import { TruckStatus, TruckStatusLabels } from '@/constants/enums';
import usePermissions from '@/hooks/usePermissions';

const statusBadgeClass = (status) => {
    const map = {
        AVAILABLE: 'bg-green-50 text-green-700 border-green-200',
        IN_USE: 'bg-blue-50 text-blue-700 border-blue-200',
        MAINTENANCE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const statusDot = (status) => {
    if (status === TruckStatus.AVAILABLE) return 'bg-emerald-500';
    if (status === TruckStatus.IN_USE) return 'bg-blue-500';
    if (status === TruckStatus.MAINTENANCE) return 'bg-amber-500';
    return 'bg-slate-400';
};

const TruckListPage = () => {
    const { can } = usePermissions();
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTruck, setEditingTruck] = useState(null);
    const [form, setForm] = useState({ licensePlate: '', capacity: '', status: 'AVAILABLE' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [detailTruck, setDetailTruck] = useState(null);
    const [statusDropdownId, setStatusDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const statusDropdownRef = useRef(null);
    const statusBtnRef = useRef({});

    const fetchTrucks = async () => {
        try {
            const data = await truckService.getAllTrucks();
            setTrucks(Array.isArray(data) ? data : []);
        } catch { setTrucks([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTrucks(); }, []);

    // Close status dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target) &&
                !Object.values(statusBtnRef.current).some(btn => btn && btn.contains(e.target))) {
                setStatusDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = trucks.filter(t => {
        const matchSearch = !search || t.licensePlate?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCreate = () => {
        setEditingTruck(null);
        setForm({ licensePlate: '', capacity: '', status: 'AVAILABLE' });
        setShowModal(true);
    };

    const openEdit = (truck) => {
        setEditingTruck(truck);
        setForm({
            licensePlate: truck.licensePlate || '',
            capacity: truck.capacity || '',
            status: truck.status || 'AVAILABLE',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                licensePlate: form.licensePlate,
                capacity: Number(form.capacity) || 1,
                status: form.status,
            };
            if (editingTruck) {
                await truckService.updateTruck(editingTruck.id, payload);
            } else {
                await truckService.createTruck(payload);
            }
            setShowModal(false);
            fetchTrucks();
        } catch (err) { alert(err?.message || 'Error saving truck'); }
        finally { setSaving(false); }
    };

    const handleStatusChange = async (truck, newStatus) => {
        setStatusDropdownId(null);
        try {
            await truckService.updateTruckStatus(truck.id, { status: newStatus });
            fetchTrucks();
        } catch (err) { alert(err?.message || 'Error updating status'); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await truckService.deleteTruck(deleteConfirm.id);
            fetchTrucks();
        } catch (err) { alert(err?.message || 'Error deleting truck'); }
        finally { setDeleteConfirm(null); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Truck Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your fleet of trucks</p>
                </div>
                {can('CREATE_TRUCK') && (
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        <Plus className="w-4 h-4" /> Add Truck
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by license plate..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">All Status</option>
                    <option value={TruckStatus.AVAILABLE}>{TruckStatusLabels[TruckStatus.AVAILABLE]}</option>
                    <option value={TruckStatus.IN_USE}>{TruckStatusLabels[TruckStatus.IN_USE]}</option>
                    <option value={TruckStatus.MAINTENANCE}>{TruckStatusLabels[TruckStatus.MAINTENANCE]}</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <TruckIcon className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No trucks found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">License Plate</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((truck, index) => (
                                    <tr key={truck.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 text-sm text-slate-500">{index + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <TruckIcon className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-900">{truck.licensePlate}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{truck.capacity} tons</td>
                                        {/* Status cell */}
                                        <td className="px-5 py-4">
                                            <button
                                                ref={el => { statusBtnRef.current[truck.id] = el; }}
                                                onClick={(e) => {
                                                    if (!can('UPDATE_STATUS_TRUCK')) return;
                                                    if (statusDropdownId === truck.id) {
                                                        setStatusDropdownId(null);
                                                    } else {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                                        setStatusDropdownId(truck.id);
                                                    }
                                                }}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${can('UPDATE_STATUS_TRUCK') ? 'cursor-pointer hover:shadow-sm transition-shadow' : 'cursor-default'} ${statusBadgeClass(truck.status)}`}
                                                disabled={!can('UPDATE_STATUS_TRUCK')}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${statusDot(truck.status)}`} />
                                                {TruckStatusLabels[truck.status] || truck.status}
                                                {can('UPDATE_STATUS_TRUCK') && <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <ActionButton onClick={() => setDetailTruck(truck)} icon={Eye} title="View" color="slate" />
                                                {can('UPDATE_TRUCK') && <ActionButton onClick={() => openEdit(truck)} icon={Pencil} title="Edit" color="blue" />}
                                                {can('DELETE_TRUCK') && <ActionButton onClick={() => setDeleteConfirm(truck)} icon={Trash2} title="Delete" color="red" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Status dropdown - rendered outside table to avoid overflow clipping */}
            {statusDropdownId && (
                <div
                    ref={statusDropdownRef}
                    className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 w-40"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                    {Object.entries(TruckStatus).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleStatusChange(
                                trucks.find(t => t.id === statusDropdownId),
                                value
                            )}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${trucks.find(t => t.id === statusDropdownId)?.status === value
                                ? 'text-indigo-600 font-medium'
                                : 'text-slate-700'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${statusDot(value)}`} />
                            {TruckStatusLabels[value]}
                            {trucks.find(t => t.id === statusDropdownId)?.status === value && (
                                <span className="ml-auto text-indigo-500">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ─── Truck Detail Modal ─── */}
            {detailTruck && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailTruck(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Truck Details</h2>
                            <button onClick={() => setDetailTruck(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shadow-sm">
                                    <TruckIcon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{detailTruck.licensePlate}</h3>
                                    <p className="text-sm text-slate-500">Truck ID: #{detailTruck.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">ID</span>
                                    <p className="text-slate-900 font-medium mt-0.5">#{detailTruck.id}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">License Plate</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailTruck.licensePlate}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Capacity</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailTruck.capacity} tons</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Status</span>
                                    <p className="mt-0.5">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${statusBadgeClass(detailTruck.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot(detailTruck.status)}`} />
                                            {TruckStatusLabels[detailTruck.status] || detailTruck.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button onClick={() => setDetailTruck(null)} className="w-full py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
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
                            <h3 className="text-lg font-bold text-slate-900">Delete Truck</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete truck <span className="font-semibold text-slate-700">{deleteConfirm.licensePlate}</span>? This action cannot be undone.
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
                            <h2 className="text-xl font-bold text-slate-900">{editingTruck ? 'Edit Truck' : 'Add New Truck'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">License Plate <span className="text-red-500">*</span></label>
                                    <input
                                        value={form.licensePlate}
                                        onChange={e => setForm({ ...form, licensePlate: e.target.value })}
                                        required
                                        placeholder="51C-12345"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacity (tons) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={form.capacity}
                                        onChange={e => setForm({ ...form, capacity: e.target.value })}
                                        required
                                        min="1"
                                        placeholder="Required (>0)"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value={TruckStatus.AVAILABLE}>{TruckStatusLabels[TruckStatus.AVAILABLE]}</option>
                                        <option value={TruckStatus.IN_USE}>{TruckStatusLabels[TruckStatus.IN_USE]}</option>
                                        <option value={TruckStatus.MAINTENANCE}>{TruckStatusLabels[TruckStatus.MAINTENANCE]}</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
                                    >
                                        {saving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (editingTruck ? 'Update Truck' : 'Create Truck')}
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

export default TruckListPage;
