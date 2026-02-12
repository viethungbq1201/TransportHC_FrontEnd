import axiosInstance from '@/api/axiosInstance';

const transactionService = {
    // GET /transaction/viewTransaction → List<TransactionResponse>
    getAllTransactions: async () => {
        const data = await axiosInstance.get('/transaction/viewTransaction');
        return Array.isArray(data) ? data : [];
    },

    // POST /transaction/createTransaction
    // Body: TransactionCreateRequest { transactionType: "IMPORT"|"EXPORT" }
    createTransaction: (data) => axiosInstance.post('/transaction/createTransaction', data),

    // PUT /transaction/approveTransaction/{transactionId} — NO request body!
    approveTransaction: (id) => axiosInstance.put(`/transaction/approveTransaction/${id}`),

    // PUT /transaction/rejectTransaction/{transactionId} — NO request body!
    rejectTransaction: (id) => axiosInstance.put(`/transaction/rejectTransaction/${id}`),

    // DELETE /transaction/deleteTransaction/{transactionId}
    deleteTransaction: (id) => axiosInstance.delete(`/transaction/deleteTransaction/${id}`),
};

export default transactionService;
