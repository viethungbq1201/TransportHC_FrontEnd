import axiosInstance from '@/api/axiosInstance';

const reportService = {
    // POST /report/reportCostForTruck/{truckId}
    // Body: ReportFromToRequest { from, to }
    reportCostForTruck: (truckId, data) => axiosInstance.post(`/report/reportCostForTruck/${truckId}`, data),

    // POST /report/reportCostAllTrucks
    // Body: ReportFromToRequest { from, to }
    reportCostAllTrucks: (data) => axiosInstance.post('/report/reportCostAllTrucks', data),

    // POST /report/reportRewardForTruck/{truckId}
    // Body: ReportFromToRequest { from, to }
    reportRewardForTruck: (truckId, data) => axiosInstance.post(`/report/reportRewardForTruck/${truckId}`, data),

    // POST /report/reportRewardAllTrucks
    // Body: ReportFromToRequest { from, to }
    reportRewardAllTrucks: (data) => axiosInstance.post('/report/reportRewardAllTrucks', data),

    // POST /report/reportSchedulesForOneTruck/{truckId}
    // Body: ReportFromToRequest { from, to }
    reportSchedulesForOneTruck: (truckId, data) => axiosInstance.post(`/report/reportSchedulesForOneTruck/${truckId}`, data),

    // POST /report/reportSchedulesForAllTrucks
    // Body: ReportFromToRequest { from, to }
    // Query params: page, size (via Pageable)
    reportSchedulesForAllTrucks: (data, params) => axiosInstance.post('/report/reportSchedulesForAllTrucks', data, { params }),

    // POST /report/reportTripCountByTruck
    // Body: ReportFromToRequest { from, to }
    reportTripCountByTruck: (data) => axiosInstance.post('/report/reportTripCountByTruck', data),

    // POST /report/reportCostForDriver/{userId}
    // Body: ReportFromToRequest { from, to }
    reportCostForDriver: (userId, data) => axiosInstance.post(`/report/reportCostForDriver/${userId}`, data),

    // POST /report/reportSystemCost
    // Body: ReportFromToRequest { from, to }
    reportSystemCost: (data) => axiosInstance.post('/report/reportSystemCost', data),

    // POST /report/reportScheduleAllTruckRow/{userId}
    // Body: ReportFromToRequest { from, to }
    reportScheduleAllTruckRow: (userId, data) => axiosInstance.post(`/report/reportScheduleAllTruckRow/${userId}`, data),
};

export default reportService;
