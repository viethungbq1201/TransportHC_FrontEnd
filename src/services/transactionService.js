import axiosInstance from '@/api/axiosInstance';

const transactionService = {
    // GET /transaction/viewTransaction
    getAllTransactions: async (params) => {
        const data = await axiosInstance.get('/transaction/viewTransaction', { params });
        return Array.isArray(data) ? data : [];
    },

    getTransactionById: (id) => axiosInstance.get(`/transaction/viewTransaction/${id}`),

    // POST /transaction/createTransaction
    createTransaction: (data) => axiosInstance.post('/transaction/createTransaction', data),

    // PUT /transaction/updateTransaction/{transactionId}
    updateTransaction: (id, data) => axiosInstance.put(`/transaction/updateTransaction/${id}`, data),

    // DELETE /transaction/deleteTransaction/{transactionId}
    deleteTransaction: (id) => axiosInstance.delete(`/transaction/deleteTransaction/${id}`),

    // PUT /transaction/approveTransaction/{transactionId}
    approveTransaction: (id) => axiosInstance.put(`/transaction/approveTransaction/${id}`),

    // PUT /transaction/rejectTransaction/{transactionId}
    rejectTransaction: (id) => axiosInstance.put(`/transaction/rejectTransaction/${id}`),
};

export default transactionService;
