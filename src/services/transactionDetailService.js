import axiosInstance from '@/api/axiosInstance';

const transactionDetailService = {
    // GET /transactiondetail/viewTransactionDetail → List<TransactionDetailResponse>
    getAll: async () => {
        const data = await axiosInstance.get('/transactiondetail/viewTransactionDetail');
        return Array.isArray(data) ? data : [];
    },

    // POST /transactiondetail/createTransactionDetail
    // Body: TransactionDetailCreateRequest { transactionId, productId, quantity }
    create: (data) => axiosInstance.post('/transactiondetail/createTransactionDetail', data),

    // PUT /transactiondetail/updateTransactionDetail/{transactionDetailId}
    update: (id, data) => axiosInstance.put(`/transactiondetail/updateTransactionDetail/${id}`, data),

    // DELETE /transactiondetail/deleteTransactionDetail/{transactionDetailId}
    delete: (id) => axiosInstance.delete(`/transactiondetail/deleteTransactionDetail/${id}`),
};

export default transactionDetailService;
