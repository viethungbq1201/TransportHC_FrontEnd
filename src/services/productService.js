import axiosInstance from '@/api/axiosInstance';

const productService = {
    // GET /product/viewProduct → List<ProductResponse>
    // ProductResponse: { id, name, category: { categoryId, name }, price }
    getProducts: async () => {
        const data = await axiosInstance.get('/product/viewProduct');
        return Array.isArray(data) ? data : [];
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
