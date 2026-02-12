import axiosInstance from '@/api/axiosInstance';

const salaryReportService = {
    // POST /salaryReport/viewSalaryReport
    // Body: SalaryReportCreateRequest { yearMonth: "2026-01-01" } (LocalDate — first day of month)
    // Returns: List<SalaryReportSummaryResponse>
    getSalaryReports: async (yearMonth) => {
        const data = await axiosInstance.post('/salaryReport/viewSalaryReport', { yearMonth });
        return Array.isArray(data) ? data : [];
    },

    // GET /salaryReport/viewSalaryReportDetail/{salaryReportId} → SalaryReportResponse
    getSalaryReportDetail: (id) => axiosInstance.get(`/salaryReport/viewSalaryReportDetail/${id}`),

    // POST /salaryReport/create1/{salaryReportId}
    // Body: SalaryReportRequest { basicSalary, reward, cost, advanceMoney }
    createSalaryReport: (id, data) => axiosInstance.post(`/salaryReport/create1/${id}`, data),

    // GET /salaryReport/createAllSalaryReport — no body
    createAllSalaryReport: () => axiosInstance.get('/salaryReport/createAllSalaryReport'),

    // PUT /salaryReport/updateSalaryReport/{salaryReportId}
    // Body: SalaryReportRequest { basicSalary, reward, cost, advanceMoney }
    updateSalaryReport: (id, data) => axiosInstance.put(`/salaryReport/updateSalaryReport/${id}`, data),

    // DELETE /salaryReport/deleteSalaryReport/{salaryReportId}
    deleteSalaryReport: (id) => axiosInstance.delete(`/salaryReport/deleteSalaryReport/${id}`),

    // GET /salaryReport/doneSalaryReport/{salaryReportId} — no body!
    markAsDone: (id) => axiosInstance.get(`/salaryReport/doneSalaryReport/${id}`),
};

export default salaryReportService;
