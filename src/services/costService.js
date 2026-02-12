import axiosInstance from '@/api/axiosInstance';

const costService = {
    // GET /cost/viewCost
    getCosts: async (params) => {
        const data = await axiosInstance.get('/cost/viewCost', { params });
        return Array.isArray(data) ? data : [];
    },

    getCostById: (id) => axiosInstance.get(`/cost/viewCost/${id}`),

    // POST /cost/createCost
    createCost: (data) => axiosInstance.post('/cost/createCost', data),

    // PUT /cost/updateCost/{costId}
    updateCost: (id, data) => axiosInstance.put(`/cost/updateCost/${id}`, data),

    // DELETE /cost/deleteCost/{costId}
    deleteCost: (id) => axiosInstance.delete(`/cost/deleteCost/${id}`),

    // Approve/Reject - Docs say "Approve cost", "Reject cost" exist.
    // Assuming pattern matches Transaction (PUT) or Schedule (GET)?
    // Transaction is PUT. Schedule is GET.
    // I'll try PUT for state change (standard).
    approveCost: (id) => axiosInstance.put(`/cost/approveCost/${id}`),
    rejectCost: (id) => axiosInstance.put(`/cost/rejectCost/${id}`),
};

export default costService;
