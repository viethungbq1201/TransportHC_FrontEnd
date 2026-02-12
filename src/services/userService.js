import axiosInstance from '@/api/axiosInstance';

const userService = {
    // GET /user/viewUser → List<UserResponse>
    getUsers: async () => {
        const data = await axiosInstance.get('/user/viewUser');
        return Array.isArray(data) ? data : [];
    },

    // POST /user/createUser
    // Body: UserCreateRequest { username, password, fullName, phoneNumber, address, roles: ["ADMIN"] }
    createUser: (data) => axiosInstance.post('/user/createUser', data),

    // PUT /user/updateUser/{userId}
    // Body: UserUpdateRequest { fullName, phoneNumber, address, roles: ["ADMIN"], basicSalary, advanceMoney }
    updateUser: (id, data) => axiosInstance.put(`/user/updateUser/${id}`, data),

    // PUT /user/updateStatusUser/{userId}
    // Body: UserUpdateStatusRequest { status: "AVAILABLE"|"BUSY"|"OFFLINE" }
    updateStatus: (id, data) => axiosInstance.put(`/user/updateStatusUser/${id}`, data),

    // DELETE /user/deleteUser/{userId}
    deleteUser: (id) => axiosInstance.delete(`/user/deleteUser/${id}`),
};

export default userService;
