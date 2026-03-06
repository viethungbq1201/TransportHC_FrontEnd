import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, Users as UsersIcon, Eye, ChevronDown } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import userService from '@/services/userService';
import { RoleCode, RoleCodeLabels, UserStatus, UserStatusLabels, UserStatusColors } from '@/constants/enums';
import usePermissions from '@/hooks/usePermissions';

const UserListPage = () => {
    const { can } = usePermissions();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        username: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        roles: ['DRIVER'],
        basicSalary: '',
        advanceMoney: '',
    });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // user to delete
    const [detailUser, setDetailUser] = useState(null); // user detail modal
    const [statusDropdownId, setStatusDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Close status dropdown when clicking outside
    const statusDropdownRef = useRef(null);
    const statusBtnRef = useRef({});
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

    const filtered = users.filter(u => {
        const term = search.toLowerCase();
        const matchSearch = !search ||
            (u.username?.toLowerCase().includes(term)) ||
            (u.fullName?.toLowerCase().includes(term)) ||
            (u.address?.toLowerCase().includes(term)) ||
            (u.phoneNumber?.includes(term));
        const matchRole = !roleFilter || (u.roles && u.roles.includes(roleFilter));
        return matchSearch && matchRole;
    });

    const formatCurrency = (val) => {
        if (!val && val !== 0) return '-';
        return Number(val).toLocaleString('vi-VN') + ' ₫';
    };

    const openCreate = () => {
        setEditingUser(null);
        setForm({
            username: '',
            password: '',
            fullName: '',
            phoneNumber: '',
            address: '',
            roles: ['DRIVER'],
            basicSalary: '',
            advanceMoney: '',
        });
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
            username: user.username,
            password: '',
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            roles: user.roles ? [...user.roles] : ['DRIVER'],
            basicSalary: user.basicSalary || '',
            advanceMoney: user.advanceMoney || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingUser) {
                const payload = {
                    username: editingUser.username,
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    address: form.address,
                    status: editingUser.status || UserStatus.AVAILABLE,
                    roles: form.roles,
                    basicSalary: Number(form.basicSalary) || 1,
                    advanceMoney: form.advanceMoney || '',
                };
                await userService.updateUser(editingUser.id, payload);
            } else {
                const payload = {
                    username: form.username,
                    password: form.password,
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    address: form.address,
                    status: UserStatus.AVAILABLE,
                    roles: form.roles,
                    basicSalary: Number(form.basicSalary) || 1,
                    advanceMoney: form.advanceMoney || '',
                };
                await userService.createUser(payload);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            alert(err?.message || 'Error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await userService.deleteUser(deleteConfirm.id);
            fetchUsers();
        } catch (err) {
            alert(err?.message || 'Error');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleStatusChange = async (user, newStatus) => {
        setStatusDropdownId(null);
        try {
            await userService.updateStatus(user.id, { status: newStatus });
            fetchUsers();
        } catch (err) { alert(err?.message || 'Error'); }
    };

    const roleBadge = (role) => {
        switch (role) {
            case RoleCode.ADMIN: return 'bg-purple-50 text-purple-700 border-purple-200';
            case RoleCode.MANAGER: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case RoleCode.ACCOUNTANT: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case RoleCode.DRIVER: return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const statusBadge = (status) => {
        return UserStatusColors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const statusDot = (status) => {
        if (status === UserStatus.AVAILABLE) return 'bg-emerald-500';
        if (status === UserStatus.BUSY) return 'bg-amber-500';
        return 'bg-slate-400';
    };

    const getPrimaryRole = (roles) => {
        if (!roles || !Array.isArray(roles) || roles.length === 0) return '-';
        return roles[0];
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage system users and their roles</p>
                </div>
                {can('CREATE_USER') && (
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, address, or phone..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400"
                >
                    <option value="">All Roles</option>
                    <option value={RoleCode.ADMIN}>Admin</option>
                    <option value={RoleCode.MANAGER}>Manager</option>
                    <option value={RoleCode.ACCOUNTANT}>Accountant</option>
                    <option value={RoleCode.DRIVER}>Driver</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <UsersIcon className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Info</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 text-sm text-slate-500">{index + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                                    {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{user.fullName || user.username}</p>
                                                    <p className="text-xs text-slate-500">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-600">{user.address || '-'}</span>
                                                <span className="text-xs text-slate-400">{user.phoneNumber || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${roleBadge(getPrimaryRole(user.roles))}`}>
                                                {RoleCodeLabels[getPrimaryRole(user.roles)] || getPrimaryRole(user.roles)}
                                            </span>
                                        </td>
                                        {/* Status cell with inline dropdown */}
                                        <td className="px-5 py-4">
                                            <button
                                                ref={el => { statusBtnRef.current[user.id] = el; }}
                                                onClick={(e) => {
                                                    if (!can('UPDATE_STATUS_USER')) return;
                                                    if (statusDropdownId === user.id) {
                                                        setStatusDropdownId(null);
                                                    } else {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                                        setStatusDropdownId(user.id);
                                                    }
                                                }}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${can('UPDATE_STATUS_USER') ? 'cursor-pointer hover:shadow-sm transition-shadow' : 'cursor-default'} ${statusBadge(user.status)}`}
                                                disabled={!can('UPDATE_STATUS_USER')}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${statusDot(user.status)}`} />
                                                {UserStatusLabels[user.status] || user.status || 'Unknown'}
                                                {can('UPDATE_STATUS_USER') && <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <ActionButton onClick={() => setDetailUser(user)} icon={Eye} title="View" color="slate" />
                                                {can('UPDATE_USER') && <ActionButton onClick={() => openEdit(user)} icon={Pencil} title="Edit" color="blue" />}
                                                {can('DELETE_USER') && <ActionButton onClick={() => setDeleteConfirm(user)} icon={Trash2} title="Delete" color="red" />}
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
                    className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 w-36"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                    {Object.entries(UserStatus).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleStatusChange(
                                users.find(u => u.id === statusDropdownId),
                                value
                            )}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${users.find(u => u.id === statusDropdownId)?.status === value
                                ? 'text-indigo-600 font-medium'
                                : 'text-slate-700'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${statusDot(value)}`} />
                            {UserStatusLabels[value]}
                            {users.find(u => u.id === statusDropdownId)?.status === value && (
                                <span className="ml-auto text-indigo-500">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ─── User Detail Modal ─── */}
            {detailUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailUser(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">User Details</h2>
                            <button onClick={() => setDetailUser(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                                    {(detailUser.fullName || detailUser.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{detailUser.fullName || '-'}</h3>
                                    <p className="text-sm text-slate-500">@{detailUser.username}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">ID</span>
                                    <p className="text-slate-900 font-medium mt-0.5">#{detailUser.id}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Role</span>
                                    <p className="mt-0.5">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${roleBadge(getPrimaryRole(detailUser.roles))}`}>
                                            {RoleCodeLabels[getPrimaryRole(detailUser.roles)] || getPrimaryRole(detailUser.roles)}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Status</span>
                                    <p className="mt-0.5">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${statusBadge(detailUser.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot(detailUser.status)}`} />
                                            {UserStatusLabels[detailUser.status] || detailUser.status || 'Unknown'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Phone</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailUser.phoneNumber || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Address</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{detailUser.address || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Basic Salary</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{formatCurrency(detailUser.basicSalary)}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Advance Money</span>
                                    <p className="text-slate-900 font-medium mt-0.5">{formatCurrency(detailUser.advanceMoney)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button onClick={() => setDetailUser(null)} className="w-full py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
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
                            <h3 className="text-lg font-bold text-slate-900">Delete User</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete <span className="font-semibold text-slate-700">{deleteConfirm.fullName || deleteConfirm.username}</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
                            >
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
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                                        <input
                                            value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value })}
                                            disabled={!!editingUser}
                                            placeholder="jdoe"
                                            required
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                        />
                                    </div>
                                    {!editingUser && (
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                                            <input
                                                type="password"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                required
                                                placeholder="••••••••"
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address <span className="text-red-500">*</span></label>
                                        <input
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="123 Main St, HCMC"
                                            required
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                        <input
                                            value={form.phoneNumber}
                                            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                            placeholder="0909123456"
                                            required
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.roles[0] || ''}
                                        onChange={e => setForm({ ...form, roles: [e.target.value] })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value={RoleCode.ADMIN}>Admin</option>
                                        <option value={RoleCode.MANAGER}>Manager</option>
                                        <option value={RoleCode.ACCOUNTANT}>Accountant</option>
                                        <option value={RoleCode.DRIVER}>Driver</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Basic Salary <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={form.basicSalary}
                                            onChange={e => setForm({ ...form, basicSalary: e.target.value })}
                                            placeholder="Required (>0)"
                                            min="1"
                                            required
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Advance Money <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={form.advanceMoney}
                                            onChange={e => setForm({ ...form, advanceMoney: e.target.value })}
                                            placeholder="Required (>0)"
                                            min="1"
                                            required
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
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
                                        ) : (editingUser ? 'Update User' : 'Create User')}
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

export default UserListPage;
