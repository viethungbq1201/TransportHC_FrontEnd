import axiosInstance from '@/api/axiosInstance';

const costTypeService = {
    // GET /costType/viewCostType → List<CostTypeResponse>
    getCostTypes: async () => {
        const data = await axiosInstance.get('/costType/viewCostType');
        return Array.isArray(data) ? data : [];
    },

    // POST /costType/createCostType
    // Body: CostTypeCreateRequest { name }
    createCostType: (data) => axiosInstance.post('/costType/createCostType', data),

    // DELETE /costType/delelteCostType/{costTypeId}
    // Note: "delelteC" is a typo in the backend controller — must match exactly
    deleteCostType: (id) => axiosInstance.delete(`/costType/delelteCostType/${id}`),
};

export default costTypeService;
