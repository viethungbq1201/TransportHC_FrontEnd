import axiosInstance from '@/api/axiosInstance';

const truckService = {
    // GET /truck/viewTruck
    getTrucks: async (params) => {
        const data = await axiosInstance.get('/truck/viewTruck', { params });
        return Array.isArray(data) ? data : [];
    },

    getTruckById: (id) => axiosInstance.get(`/truck/viewTruck/${id}`),

    // POST /truck/createTruck
    createTruck: (data) => axiosInstance.post('/truck/createTruck', data),

    // PUT /truck/updateTruck/{truckId}
    updateTruck: (id, data) => axiosInstance.put(`/truck/updateTruck/${id}`, data),

    // DELETE /truck/deleteTruck/{truckId}
    deleteTruck: (id) => axiosInstance.delete(`/truck/deleteTruck/${id}`),

    // PUT /truck/updateStatusTruck/{truckId}
    updateStatus: (id, status) => axiosInstance.put(`/truck/updateStatusTruck/${id}`, { status }),
};

export default truckService;
