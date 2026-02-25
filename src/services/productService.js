import axiosInstance from '@/api/axiosInstance';

const productService = {
    // GET /product/viewProduct → List<ProductResponse> (full list for dropdowns)
    getProducts: async () => {
        const data = await axiosInstance.get('/product/viewProduct');
        return Array.isArray(data) ? data : [];
    },

    // GET /product/viewProductPaged?page=0&size=10 → PageResponse<ProductResponse>
    // Returns: { content: [...], page, size, totalElements, totalPages }
    getProductsPaged: async (page = 0, size = 10) => {
        const data = await axiosInstance.get(`/product/viewProductPaged?page=${page}&size=${size}`);
        return data;
    },

    // POST /product/createProduct
    // Body: ProductCreateRequest { name (4-255 chars), categoryId (Long), price (BigDecimal, >0) }
    createProduct: (data) => axiosInstance.post('/product/createProduct', data),

    // PUT /product/updateProduct/{productId}
    // Body: ProductCreateRequest { name, categoryId, price }
    updateProduct: (id, data) => axiosInstance.put(`/product/updateProduct/${id}`, data),

    // DELETE /product/deleteProduct/{productId}
    deleteProduct: (id) => axiosInstance.delete(`/product/deleteProduct/${id}`),
};

export default productService;
