import axiosInstance from '@/api/axiosInstance';

const costService = {
    // GET /cost/viewCost → List<CostResponse>
    getAllCosts: async () => {
        const data = await axiosInstance.get('/cost/viewCost');
        return Array.isArray(data) ? data : [];
    },

    // POST /cost/createCost
    // Body: CostCreateRequest { description, price, documentaryProof, costTypeId, scheduleId }
    // Note: scheduleId is in the BODY, not the path
    createCost: (data) => axiosInstance.post('/cost/createCost', data),

    // PUT /cost/updateCost/{costId}
    // Body: CostCreateRequest { description, price, documentaryProof, costTypeId, scheduleId }
    updateCost: (id, data) => axiosInstance.put(`/cost/updateCost/${id}`, data),

    // GET /cost/approveCost/{costId} — NO request body!
    approveCost: (id) => axiosInstance.get(`/cost/approveCost/${id}`),

    // GET /cost/rejectCost/{costId} — NO request body!
    rejectCost: (id) => axiosInstance.get(`/cost/rejectCost/${id}`),

    // DELETE /cost/delelteCost/{costId} — Note: backend has typo in path
    deleteCost: (id) => axiosInstance.delete(`/cost/delelteCost/${id}`),
};

export default costService;
