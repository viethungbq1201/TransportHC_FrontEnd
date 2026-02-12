import axiosInstance from '@/api/axiosInstance';

const inventoryService = {
    // GET /inventory/viewInventory
    getInventories: async (params) => {
        const data = await axiosInstance.get('/inventory/viewInventory', { params });
        return Array.isArray(data) ? data : [];
    },

    // GET /inventory/findInventory/{inventoryId}
    getInventoryById: (id) => axiosInstance.get(`/inventory/findInventory/${id}`),

    // POST /inventory/createInventory
    createInventory: (data) => axiosInstance.post('/inventory/createInventory', data),

    // PUT /inventory/updateInventory/{inventoryId}
    updateInventory: (id, data) => axiosInstance.put(`/inventory/updateInventory/${id}`, data),

    // DELETE /inventory/deleteInventory/{inventoryId}
    deleteInventory: (id) => axiosInstance.delete(`/inventory/deleteInventory/${id}`),

    // POST /inventory/filterInventory
    filterInventory: (filter) => axiosInstance.post('/inventory/filterInventory', filter),

    // GET /inventory/exportInventory
    exportInventory: () => axiosInstance.get('/inventory/exportInventory', { responseType: 'blob' }),
};

export default inventoryService;
