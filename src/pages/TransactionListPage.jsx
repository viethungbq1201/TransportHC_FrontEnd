import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, FileText, CheckCircle, XCircle } from 'lucide-react';
import transactionService from '@/services/transactionService';

const statusBadge = (status) => {
    const map = {
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        APPROVED: 'bg-green-50 text-green-700 border-green-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-200',
        COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const TransactionListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ customerName: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [actionMenuId, setActionMenuId] = useState(null);

    const fetchData = async () => { try { const data = await transactionService.getAllTransactions(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(t => {
        const matchSearch = !search || [t.transactionCode, t.customerName, t.customer].some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = !statusFilter || t.status === statusFilter || t.approveStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setForm({ customerName: '', description: '' }); setShowModal(true); };
    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { await transactionService.createTransaction(form); setShowModal(false); fetchData(); } catch (err) { alert(err?.message || 'Error'); } finally { setSaving(false); } };
    const handleApprove = async (id) => { try { await transactionService.approveTransaction(id, { approveStatus: 'APPROVED' }); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };
    const handleReject = async (id) => { try { await transactionService.approveTransaction(id, { approveStatus: 'REJECTED' }); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };
    const handleDelete = async (id) => { if (!window.confirm('Delete this transaction?')) return; try { await transactionService.deleteTransaction(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } setActionMenuId(null); };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Transaction Management</h1><p className="text-slate-500 text-sm mt-1">Manage customer transactions</p></div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Transaction</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or customer..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"><option value="">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="COMPLETED">Completed</option></select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><FileText className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No transactions found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Code</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{item.transactionCode || item.id}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.customerName || item.customer || '-'}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.totalAmount ? `$${Number(item.totalAmount).toLocaleString()}` : '$0'}</td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadge(item.status || item.approveStatus)}`}>{item.status || item.approveStatus || '-'}</span></td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(item.createdAt || item.createdDate)}</td>
                                <td className="px-5 py-3.5 relative">
                                    <button onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)} className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                                    {actionMenuId === item.id && (<><div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} /><div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 w-40">
                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5" /> View Details</button>
                                        {(item.status === 'PENDING' || item.approveStatus === 'PENDING') && <><button onClick={() => handleApprove(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"><CheckCircle className="w-3.5 h-3.5" /> Approve</button><button onClick={() => handleReject(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><XCircle className="w-3.5 h-3.5" /> Reject</button></>}
                                        <button onClick={() => handleDelete(item.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                    </div></>)}
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">Add New Transaction</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label><input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button></div></form></div></div>)}
        </div>
    );
};

export default TransactionListPage;
