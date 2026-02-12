import axiosInstance from '@/api/axiosInstance';

const costTypeService = {
    // GET /costType/viewCostType
    // Inference: Base URL is /costType. Pattern viewX.
    getCostTypes: async (params) => {
        const data = await axiosInstance.get('/costType/viewCostType', { params });
        return Array.isArray(data) ? data : [];
    },

    getCostTypeById: (id) => axiosInstance.get(`/costType/viewCostType/${id}`),

    // POST /costType/createCostType
    createCostType: (data) => axiosInstance.post('/costType/createCostType', data),

    // PUT /costType/updateCostType/{costTypeId}
    updateCostType: (id, data) => axiosInstance.put(`/costType/updateCostType/${id}`, data),

    // DELETE /costType/deleteCostType/{costTypeId}
    deleteCostType: (id) => axiosInstance.delete(`/costType/deleteCostType/${id}`),
};

export default costTypeService;
