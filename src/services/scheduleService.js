import axiosInstance from '@/api/axiosInstance';

const scheduleService = {
    // GET /schedule/viewSchedule
    getAllSchedules: async (params) => {
        const data = await axiosInstance.get('/schedule/viewSchedule', { params });
        return Array.isArray(data) ? data : [];
    },

    getScheduleById: (id) => axiosInstance.get(`/schedule/viewSchedule/${id}`),

    // POST /schedule/createSchedule
    createSchedule: (data) => axiosInstance.post('/schedule/createSchedule', data),

    // PUT /schedule/updateSchedule/{ScheduleId}
    updateSchedule: (id, data) => axiosInstance.put(`/schedule/updateSchedule/${id}`, data),

    // GET /schedule/approveSchedule/{ScheduleId} -> Note: Docs say GET? Unusual for state change.
    // Spec: GET /approveSchedule/{ScheduleId}
    // But previous code used PUT body. I will follow spec: GET.
    approveSchedule: (id) => axiosInstance.get(`/schedule/approveSchedule/${id}`),

    // GET /schedule/rejectSchedule/{ScheduleId}
    rejectSchedule: (id) => axiosInstance.get(`/schedule/rejectSchedule/${id}`),

    // PUT /schedule/endSchedule/{ScheduleId}
    endSchedule: (id) => axiosInstance.put(`/schedule/endSchedule/${id}`),

    // GET /schedule/cancelSchedule/{ScheduleId}
    cancelSchedule: (id) => axiosInstance.get(`/schedule/cancelSchedule/${id}`),

    // DELETE /schedule/deleteSchedule/{ScheduleId}
    deleteSchedule: (id) => axiosInstance.delete(`/schedule/deleteSchedule/${id}`),
};

export default scheduleService;
