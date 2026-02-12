import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, Users as UsersIcon } from 'lucide-react';
import userService from '@/services/userService';
import { RoleCode, RoleCodeLabels, UserStatus, UserStatusLabels, UserStatusColors } from '@/constants/enums';

const UserListPage = () => {
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
        roles: ['APPROVER'],
        basicSalary: '',
        advanceMoney: '',
    });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);

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

    const formatDate = (d) => {
        if (!d) return '-';
        try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
        catch { return '-'; }
    };

    const openCreate = () => {
        setEditingUser(null);
        setForm({
            username: '',
            password: '',
            fullName: '',
            phoneNumber: '',
            address: '',
            roles: ['APPROVER'],
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
            roles: user.roles || ['APPROVER'],
            basicSalary: user.basicSalary || '',
            advanceMoney: user.advanceMoney || '',
        });
        setShowModal(true);
        setActionMenuId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingUser) {
                // UserUpdateRequest: { fullName, phoneNumber, address, roles, basicSalary, advanceMoney }
                const payload = {
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    address: form.address,
                    roles: form.roles,
                    basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
                    advanceMoney: form.advanceMoney ? Number(form.advanceMoney) : undefined,
                };
                await userService.updateUser(editingUser.id, payload);
            } else {
                // UserCreateRequest: { username, password, fullName, phoneNumber, address, roles }
                const payload = {
                    username: form.username,
                    password: form.password,
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    address: form.address,
                    roles: form.roles,
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

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try { await userService.deleteUser(id); fetchUsers(); } catch (err) { alert(err?.message || 'Error'); }
        setActionMenuId(null);
    };

    const handleStatusChange = async (user, newStatus) => {
        try {
            await userService.updateStatus(user.id, { status: newStatus });
            fetchUsers();
        } catch (err) { alert(err?.message || 'Error'); }
        setActionMenuId(null);
    };

    const roleBadge = (role) => {
        switch (role) {
            case RoleCode.ADMIN: return 'bg-purple-50 text-purple-700 border-purple-200';
            case RoleCode.DRIVER: return 'bg-blue-50 text-blue-700 border-blue-200';
            case RoleCode.APPROVER: return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const statusBadge = (status) => {
        return UserStatusColors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
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
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
                    <Plus className="w-4 h-4" /> Invite User
                </button>
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
                    <option value={RoleCode.DRIVER}>Driver</option>
                    <option value={RoleCode.APPROVER}>Approver</option>
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
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Info</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-500">#{user.id}</td>
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
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(user.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === UserStatus.AVAILABLE ? 'bg-emerald-500' : user.status === UserStatus.BUSY ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                            {UserStatusLabels[user.status] || user.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                                    <td className="px-5 py-4 relative">
                                        <button
                                            onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                        {actionMenuId === user.id && (
                                            <>
                                                <div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} />
                                                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-44">
                                                    <button onClick={() => openEdit(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                                        <Pencil className="w-4 h-4" /> Edit User
                                                    </button>
                                                    {/* Status change options */}
                                                    {user.status !== UserStatus.AVAILABLE && (
                                                        <button onClick={() => handleStatusChange(user, UserStatus.AVAILABLE)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                                            Set Available
                                                        </button>
                                                    )}
                                                    {user.status !== UserStatus.BUSY && (
                                                        <button onClick={() => handleStatusChange(user, UserStatus.BUSY)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50">
                                                            Set Busy
                                                        </button>
                                                    )}
                                                    {user.status !== UserStatus.OFFLINE && (
                                                        <button onClick={() => handleStatusChange(user, UserStatus.OFFLINE)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                                            Set Offline
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(user.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" /> Delete User
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
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
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                                        <input
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="123 Main St, HCMC"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                        <input
                                            value={form.phoneNumber}
                                            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                            placeholder="0909123456"
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
                                        <option value={RoleCode.APPROVER}>Approver</option>
                                        <option value={RoleCode.DRIVER}>Driver</option>
                                        <option value={RoleCode.ADMIN}>Admin</option>
                                    </select>
                                </div>

                                {editingUser && (
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Basic Salary</label>
                                            <input
                                                type="number"
                                                value={form.basicSalary}
                                                onChange={e => setForm({ ...form, basicSalary: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Advance Money</label>
                                            <input
                                                type="number"
                                                value={form.advanceMoney}
                                                onChange={e => setForm({ ...form, advanceMoney: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}

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
