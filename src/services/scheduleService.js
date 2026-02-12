import axiosInstance from '@/api/axiosInstance';

const scheduleService = {
    // GET /schedule/viewSchedule → List<ScheduleResponse>
    getAllSchedules: async () => {
        const data = await axiosInstance.get('/schedule/viewSchedule');
        return Array.isArray(data) ? data : [];
    },

    // POST /schedule/createSchedule
    // Body: ScheduleCreateRequest { userId, truckId, routeId, departureDate }
    createSchedule: (data) => axiosInstance.post('/schedule/createSchedule', data),

    // PUT /schedule/updateSchedule/{scheduleId}
    // Body: ScheduleUpdateRequest { userId, truckId, routeId, departureDate }
    updateSchedule: (id, data) => axiosInstance.put(`/schedule/updateSchedule/${id}`, data),

    // GET /schedule/approveSchedule/{scheduleId} — NO request body!
    approveSchedule: (id) => axiosInstance.get(`/schedule/approveSchedule/${id}`),

    // GET /schedule/rejectSchedule/{scheduleId} — NO request body!
    rejectSchedule: (id) => axiosInstance.get(`/schedule/rejectSchedule/${id}`),

    // GET /schedule/cancelSchedule/{scheduleId} — NO request body!
    cancelSchedule: (id) => axiosInstance.get(`/schedule/cancelSchedule/${id}`),

    // PUT /schedule/endSchedule/{scheduleId}
    // Body: ScheduleEndRequest { actualArrivalTime, note }
    endSchedule: (id, data) => axiosInstance.put(`/schedule/endSchedule/${id}`, data),

    // DELETE /schedule/deleteSchedule/{scheduleId}
    deleteSchedule: (id) => axiosInstance.delete(`/schedule/deleteSchedule/${id}`),
};

export default scheduleService;
