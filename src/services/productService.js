import axiosInstance from '@/api/axiosInstance';

const productService = {
    // GET /product/viewProduct → List<ProductResponse>
    getProducts: async () => {
        const data = await axiosInstance.get('/product/viewProduct');
        return Array.isArray(data) ? data : [];
    },

    // GET /product/findProduct/{productId}
    getProductById: (id) => axiosInstance.get(`/product/findProduct/${id}`),

    // POST /product/createProduct
    // Body: ProductCreateRequest { name, categoryId, price }
    createProduct: (data) => axiosInstance.post('/product/createProduct', data),

    // PUT /product/updateProduct/{productId}
    updateProduct: (id, data) => axiosInstance.put(`/product/updateProduct/${id}`, data),

    // DELETE /product/deleteProduct/{productId}
    deleteProduct: (id) => axiosInstance.delete(`/product/deleteProduct/${id}`),
};

export default productService;
