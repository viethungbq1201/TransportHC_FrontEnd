import axiosInstance from '@/api/axiosInstance';

const categoryService = {
    // GET /category/viewCategory → List<CategoryResponse>
    getCategories: async () => {
        const data = await axiosInstance.get('/category/viewCategory');
        return Array.isArray(data) ? data : [];
    },

    // POST /category/createCategory
    // Body: CategoryCreateRequest { name }
    createCategory: (data) => axiosInstance.post('/category/createCategory', data),

    // PUT /category/updateCategory/{categoryId}
    updateCategory: (id, data) => axiosInstance.put(`/category/updateCategory/${id}`, data),

    // DELETE /category/deleltCategory/{categoryId}
    // Note: "delelt" is a typo in the backend controller — must match exactly
    deleteCategory: (id) => axiosInstance.delete(`/category/deleltCategory/${id}`),
};

export default categoryService;
