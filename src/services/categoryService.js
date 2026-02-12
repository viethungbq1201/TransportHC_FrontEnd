import axiosInstance from '@/api/axiosInstance';

const categoryService = {
    // GET /category/viewCategory
    getCategories: async (params) => {
        const data = await axiosInstance.get('/category/viewCategory', { params });
        return Array.isArray(data) ? data : [];
    },

    getCategoryById: (id) => axiosInstance.get(`/category/viewCategory/${id}`),

    // POST /category/createCategory
    createCategory: (data) => axiosInstance.post('/category/createCategory', data),

    // PUT /category/updateCategory/{categoryId}
    updateCategory: (id, data) => axiosInstance.put(`/category/updateCategory/${id}`, data),

    // DELETE /category/deleteCategory/{categoryId}
    deleteCategory: (id) => axiosInstance.delete(`/category/deleteCategory/${id}`),
};

export default categoryService;
