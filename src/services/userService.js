import axiosInstance from '@/api/axiosInstance';

const userService = {
    // GET /user/viewUser
    getUsers: async (params) => {
        const data = await axiosInstance.get('/user/viewUser', { params });
        // Map backend ACTIVE/INACTIVE to boolean for UI
        return Array.isArray(data) ? data.map(u => ({
            ...u,
            active: u.status === 'ACTIVE'
        })) : [];
    },

    getUserById: (id) => axiosInstance.get(`/user/viewUser/${id}`), // Assuming viewUser/{id} exists or filter list? Docs say list. Assuming standard GET by ID pattern usually exists or client filtering. Docs didn't specify getById strictly.

    // POST /user/createUser
    createUser: (data) => axiosInstance.post('/user/createUser', {
        ...data,
        status: data.active ? 'ACTIVE' : 'INACTIVE'
    }),

    // PUT /user/updateUser/{userId}
    updateUser: (id, data) => axiosInstance.put(`/user/updateUser/${id}`, {
        ...data,
        status: data.active ? 'ACTIVE' : 'INACTIVE'
    }),

    // DELETE /user/deleteUser/{userId}
    deleteUser: (id) => axiosInstance.delete(`/user/deleteUser/${id}`),

    // PUT /user/updateStatusUser/{userId}
    updateStatus: (id, status) => axiosInstance.put(`/user/updateStatusUser/${id}`, { status }),
};

export default userService;
