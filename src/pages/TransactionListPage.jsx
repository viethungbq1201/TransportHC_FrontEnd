import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, FileText, CheckCircle, XCircle } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import transactionService from '@/services/transactionService';
import { ApproveStatus, ApproveStatusLabels, ApproveStatusColors, TransactionType, TransactionTypeLabels } from '@/constants/enums';

const approveBadge = (status) => {
    const map = {
        [ApproveStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [ApproveStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [ApproveStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const typeBadge = (type) => {
    const map = {
        [TransactionType.IMPORT]: 'bg-blue-50 text-blue-700 border-blue-200',
        [TransactionType.EXPORT]: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return map[type] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const TransactionListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    // Backend DTO: TransactionCreateRequest { transactionType: "IMPORT"|"EXPORT" }
    const [form, setForm] = useState({ transactionType: 'IMPORT' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => { try { const data = await transactionService.getAllTransactions(); setItems(Array.isArray(data) ? data : []); } catch { setItems([]); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);

    const filtered = items.filter(t => {
        const term = search.toLowerCase();
        const matchSearch = !search ||
            String(t.transactionId).includes(term) ||
            t.createdBy?.fullName?.toLowerCase().includes(term) ||
            t.transactionType?.toLowerCase().includes(term);
        const matchStatus = !statusFilter || t.approveStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; } };

    const openCreate = () => { setForm({ transactionType: 'IMPORT' }); setShowModal(true); };

    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { await transactionService.createTransaction(form); setShowModal(false); fetchData(); } catch (err) { alert(err?.message || 'Error'); } finally { setSaving(false); } };

    // Approve/Reject are separate PUT endpoints with NO body
    const handleApprove = async (id) => { try { await transactionService.approveTransaction(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };
    const handleReject = async (id) => { try { await transactionService.rejectTransaction(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };
    const handleDelete = async (id) => { if (!window.confirm('Delete this transaction?')) return; try { await transactionService.deleteTransaction(id); fetchData(); } catch (err) { alert(err?.message || 'Error'); } };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-slate-900">Transaction Management</h1><p className="text-slate-500 text-sm mt-1">Manage import/export transactions</p></div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Transaction</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, creator, or type..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"><option value="">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
                ) : filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><FileText className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">No transactions found</p></div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.transactionId} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">#{item.transactionId}</td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${typeBadge(item.transactionType)}`}>{TransactionTypeLabels[item.transactionType] || item.transactionType}</span></td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{item.createdBy?.fullName || '-'}</td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${approveBadge(item.approveStatus)}`}>{ApproveStatusLabels[item.approveStatus] || item.approveStatus || '-'}</span></td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(item.createdAt)}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        {item.approveStatus === ApproveStatus.PENDING && <>
                                            <ActionButton onClick={() => handleApprove(item.transactionId)} icon={CheckCircle} title="Approve" color="green" />
                                            <ActionButton onClick={() => handleReject(item.transactionId)} icon={XCircle} title="Reject" color="amber" />
                                        </>}
                                        <ActionButton onClick={() => handleDelete(item.transactionId)} icon={Trash2} title="Delete" color="red" />
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {/* Create Modal — only transactionType needed */}
            {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} /><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-slate-900">New Transaction</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                    <select value={form.transactionType} onChange={e => setForm({ ...form, transactionType: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="IMPORT">Import</option>
                        <option value="EXPORT">Export</option>
                    </select>
                </div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button></div>
            </form></div></div>)}
        </div>
    );
};

export default TransactionListPage;
