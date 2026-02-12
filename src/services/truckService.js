import axiosInstance from '@/api/axiosInstance';

const truckService = {
    // GET /truck/viewTruck → List<TruckResponse>
    getAllTrucks: async () => {
        const data = await axiosInstance.get('/truck/viewTruck');
        return Array.isArray(data) ? data : [];
    },

    // POST /truck/createTruck
    // Body: TruckCreateRequest { licensePlate, model, capacity, driverAssigned, status }
    createTruck: (data) => axiosInstance.post('/truck/createTruck', data),

    // PUT /truck/updateTruck/{truckId}
    // Body: TruckCreateRequest { licensePlate, model, capacity, driverAssigned, status }
    updateTruck: (id, data) => axiosInstance.put(`/truck/updateTruck/${id}`, data),

    // PUT /truck/updateStatusTruck/{truckId}
    // Body: TruckUpdateStatusRequest { status: "AVAILABLE"|"IN_USE"|"MAINTENANCE" }
    updateTruckStatus: (id, data) => axiosInstance.put(`/truck/updateStatusTruck/${id}`, data),

    // DELETE /truck/deleteTruck/{truckId}
    deleteTruck: (id) => axiosInstance.delete(`/truck/deleteTruck/${id}`),
};

export default truckService;
