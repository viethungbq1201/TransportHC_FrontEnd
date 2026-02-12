import axiosInstance from '@/api/axiosInstance';

const salaryReportService = {
    // GET /salaryReport/viewSalaryReport
    getSalaryReports: async (params) => {
        const data = await axiosInstance.get('/salaryReport/viewSalaryReport', { params });
        return Array.isArray(data) ? data : [];
    },

    // GET /salaryReport/viewSalaryReportDetail?
    // Docs: "View report detail".
    // I'll assume /salaryReport/viewSalaryReportDetail/{id}
    getSalaryReportDetail: (id) => axiosInstance.get(`/salaryReport/viewSalaryReportDetail/${id}`),

    // POST /salaryReport/createSalaryReport (Single)
    createSalaryReport: (data) => axiosInstance.post('/salaryReport/createSalaryReport', data),

    // POST /salaryReport/createAllSalaryReport (All)
    createAllSalaryReport: (data) => axiosInstance.post('/salaryReport/createAllSalaryReport', data),

    // PUT /salaryReport/updateSalaryReport/{salaryReportId}
    updateSalaryReport: (id, data) => axiosInstance.put(`/salaryReport/updateSalaryReport/${id}`, data),

    // DELETE /salaryReport/deleteSalaryReport/{salaryReportId}
    deleteSalaryReport: (id) => axiosInstance.delete(`/salaryReport/deleteSalaryReport/${id}`),

    // PUT /salaryReport/approveSalaryReport/{id} ???
    // Docs: "Mark as done".
    // Maybe PUT /salaryReport/markAsDone/{id}?
    // Or PUT /salaryReport/updateStatus/{id}?
    // I'll guess `updateStatus` or similar given `done` is a status.
    // Spec: "Endpoints: ... Mark as done".
    // I'll try PUT /salaryReport/markAsDone/${id}
    markAsDone: (id) => axiosInstance.put(`/salaryReport/markAsDone/${id}`),
};

export default salaryReportService;
