import axiosInstance from '@/api/axiosInstance';

const inventoryService = {
    // GET /inventory/viewInventory → List<InventoryResponse>
    // InventoryResponse: { inventoryId, product: ProductResponse, quantity, inTransit, upToDate }
    getInventories: async () => {
        const data = await axiosInstance.get('/inventory/viewInventory');
        return Array.isArray(data) ? data : [];
    },

    // POST /inventory/createInventory
    // Body: InventoryCreateRequest { productId (Long), quantity (Integer, >0), upToDate (LocalDateTime) }
    createInventory: (data) => axiosInstance.post('/inventory/createInventory', data),

    // PUT /inventory/updateInventory/{inventoryId}
    // Body: InventoryUpdateRequest { quantity (Integer, >0) }
    updateInventory: (id, data) => axiosInstance.put(`/inventory/updateInventory/${id}`, data),

    // DELETE /inventory/deleteInventory/{inventoryId}
    deleteInventory: (id) => axiosInstance.delete(`/inventory/deleteInventory/${id}`),

    // POST /inventory/filterInventory
    // Body: InventoryFilterRequest { productName, categoryName, quantityMin, quantityMax, fromDate, toDate, totalMin, totalMax }
    filterInventory: (filter) => axiosInstance.post('/inventory/filterInventory', filter),

    // GET /inventory/exportInventory → Excel file download
    exportInventory: async () => {
        // 1. Destructure 'data' from the response
        const { data } = await axiosInstance.get('/inventory/exportInventory', {
            responseType: 'blob'
        });

        // 2. 'data' is already a Blob because of responseType: 'blob'
        const url = window.URL.createObjectURL(data);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.xlsx';
        document.body.appendChild(a);
        a.click();

        // 3. Cleanup
        a.remove();
        window.URL.revokeObjectURL(url);
    },

    // POST /inventory/importInventory (multipart/form-data)
    importInventory: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post('/inventory/importInventory', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default inventoryService;
