import axiosInstance from '@/api/axiosInstance';

const productService = {
    // GET /product/viewProduct
    getProducts: async (params) => {
        const data = await axiosInstance.get('/product/viewProduct', { params });
        return Array.isArray(data) ? data : [];
    },

    getProductById: (id) => axiosInstance.get(`/product/viewProduct/${id}`),

    // POST /product/createProduct
    createProduct: (data) => axiosInstance.post('/product/createProduct', data),

    // PUT /product/updateProduct/{productId}
    updateProduct: (id, data) => axiosInstance.put(`/product/updateProduct/${id}`, data),

    // DELETE /product/deleteProduct/{productId}
    deleteProduct: (id) => axiosInstance.delete(`/product/deleteProduct/${id}`),
};

export default productService;
