import axiosInstance from '@/api/axiosInstance';

const reportService = {
    /**
     * Get truck cost report
     * GET /reports/truck-cost
     * @param {object} [params] - { startDate, endDate, truckId }
     * @returns {Promise<Array<TruckCostReportResponse>>}
     */
    getTruckCostReport: (params) => {
        return axiosInstance.get('/reports/truck-cost', { params });
    },

    /**
     * Get truck daily report
     * GET /reports/truck-daily
     * @param {object} [params] - { date, truckId }
     * @returns {Promise<Array<TruckDailyReportResponse>>}
     */
    getTruckDailyReport: (params) => {
        return axiosInstance.get('/reports/truck-daily', { params });
    },

    /**
     * Get truck trip count statistics
     * GET /reports/truck-trip-count
     * @param {object} [params] - { startDate, endDate }
     * @returns {Promise<Array<TruckTripCountResponse>>}
     */
    getTruckTripCount: (params) => {
        return axiosInstance.get('/reports/truck-trip-count', { params });
    },

    /**
     * Get driver cost report
     * GET /reports/driver-cost
     * @param {object} [params] - { startDate, endDate, driverId }
     * @returns {Promise<Array<DriverCostReportResponse>>}
     */
    getDriverCostReport: (params) => {
        return axiosInstance.get('/reports/driver-cost', { params });
    },
};

export default reportService;
