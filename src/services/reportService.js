import axiosInstance from '@/api/axiosInstance';

const reportService = {
    // POST /report/reportCostForTruck/{truckId}
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportCostForTruck: (truckId, data) => axiosInstance.post(`/report/reportCostForTruck/${truckId}`, data),

    // POST /report/reportCostAllTrucks
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportCostAllTrucks: (data) => axiosInstance.post('/report/reportCostAllTrucks', data),

    // POST /report/reportRewardForTruck/{truckId}
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportRewardForTruck: (truckId, data) => axiosInstance.post(`/report/reportRewardForTruck/${truckId}`, data),

    // POST /report/reportRewardAllTrucks
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportRewardAllTrucks: (data) => axiosInstance.post('/report/reportRewardAllTrucks', data),

    // POST /report/reportSchedulesForOneTruck/{truckId}
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportSchedulesForOneTruck: (truckId, data) => axiosInstance.post(`/report/reportSchedulesForOneTruck/${truckId}`, data),

    // POST /report/reportSchedulesForAllTrucks
    // Body: ReportFromToRequest { dateFrom, dateTo }
    // Query params: page, size (via Pageable)
    reportSchedulesForAllTrucks: (data, params) => axiosInstance.post('/report/reportSchedulesForAllTrucks', data, { params }),

    // POST /report/reportTripCountByTruck
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportTripCountByTruck: (data) => axiosInstance.post('/report/reportTripCountByTruck', data),

    // POST /report/reportCostForDriver/{userId}
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportCostForDriver: (userId, data) => axiosInstance.post(`/report/reportCostForDriver/${userId}`, data),

    // POST /report/reportSystemCost
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportSystemCost: (data) => axiosInstance.post('/report/reportSystemCost', data),

    // POST /report/reportScheduleAllTruckRow/{userId}
    // Body: ReportFromToRequest { dateFrom, dateTo }
    reportScheduleAllTruckRow: (userId, data) => axiosInstance.post(`/report/reportScheduleAllTruckRow/${userId}`, data),
};

export default reportService;
