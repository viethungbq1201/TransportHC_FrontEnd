import axiosInstance from '@/api/axiosInstance';

const routeService = {
    // GET /route/viewRoute
    getRoutes: async (params) => {
        const data = await axiosInstance.get('/route/viewRoute', { params });
        return Array.isArray(data) ? data : [];
    },

    getRouteById: (id) => axiosInstance.get(`/route/viewRoute/${id}`),

    // POST /route/createRoute
    createRoute: (data) => axiosInstance.post('/route/createRoute', data),

    // PUT /route/updateRoute/{routeId}
    updateRoute: (id, data) => axiosInstance.put(`/route/updateRoute/${id}`, data),

    // DELETE /route/deleteRoute/{routeId}
    deleteRoute: (id) => axiosInstance.delete(`/route/deleteRoute/${id}`),
};

export default routeService;
