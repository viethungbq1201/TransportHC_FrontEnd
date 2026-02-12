import axiosInstance from '@/api/axiosInstance';

const routeService = {
    // GET /route/viewRoute → List<RouteResponse>
    getRoutes: async () => {
        const data = await axiosInstance.get('/route/viewRoute');
        return Array.isArray(data) ? data : [];
    },

    // POST /route/createRoute
    // Body: RouteCreateRequest { startPoint, endPoint, distance, estimatedTime }
    createRoute: (data) => axiosInstance.post('/route/createRoute', data),

    // PUT /route/updateRoute/{routeId}
    // Body: RouteCreateRequest { startPoint, endPoint, distance, estimatedTime }
    updateRoute: (id, data) => axiosInstance.put(`/route/updateRoute/${id}`, data),

    // DELETE /route/deleteRoute/{routeId}
    deleteRoute: (id) => axiosInstance.delete(`/route/deleteRoute/${id}`),
};

export default routeService;
