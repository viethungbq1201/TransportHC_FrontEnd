// ─── Backend Enum Synchronization ───
// These values MUST exactly match the Java enum definitions in the backend.
// Do NOT use hardcoded strings elsewhere — always import from this file.

// ─── Role Codes ───
// ─── Role Codes ───
export const RoleCode = Object.freeze({
    ADMIN: 'ADMIN',
    DRIVER: 'DRIVER',
    STAFF: 'STAFF',
});

export const RoleCodeLabels = Object.freeze({
    [RoleCode.ADMIN]: 'Admin',
    [RoleCode.DRIVER]: 'Driver',
    [RoleCode.STAFF]: 'Staff',
});

// ─── Truck Status ───
export const TruckStatus = Object.freeze({
    AVAILABLE: 'AVAILABLE',
    IN_USE: 'IN_USE',
    MAINTENANCE: 'MAINTENANCE',
    RETIRED: 'RETIRED',
});

export const TruckStatusLabels = Object.freeze({
    [TruckStatus.AVAILABLE]: 'Sẵn sàng',
    [TruckStatus.IN_USE]: 'Đang sử dụng',
    [TruckStatus.MAINTENANCE]: 'Bảo trì',
    [TruckStatus.RETIRED]: 'Ngừng hoạt động',
});

export const TruckStatusColors = Object.freeze({
    [TruckStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-800',
    [TruckStatus.IN_USE]: 'bg-blue-100 text-blue-800',
    [TruckStatus.MAINTENANCE]: 'bg-amber-100 text-amber-800',
    [TruckStatus.RETIRED]: 'bg-slate-100 text-slate-800',
});

// ─── Schedule Status ───
export const ScheduleStatus = Object.freeze({
    CREATED: 'CREATED',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
});

export const ScheduleStatusLabels = Object.freeze({
    [ScheduleStatus.CREATED]: 'Đã tạo',
    [ScheduleStatus.RUNNING]: 'Đang chạy',
    [ScheduleStatus.COMPLETED]: 'Hoàn thành',
});

export const ScheduleStatusColors = Object.freeze({
    [ScheduleStatus.CREATED]: 'bg-amber-100 text-amber-800',
    [ScheduleStatus.RUNNING]: 'bg-blue-100 text-blue-800',
    [ScheduleStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800',
});

// ─── Approve Status ───
export const ApproveStatus = Object.freeze({
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
});

export const ApproveStatusLabels = Object.freeze({
    [ApproveStatus.PENDING]: 'Chờ duyệt',
    [ApproveStatus.APPROVED]: 'Đã duyệt',
    [ApproveStatus.REJECTED]: 'Từ chối',
});

export const ApproveStatusColors = Object.freeze({
    [ApproveStatus.PENDING]: 'bg-amber-100 text-amber-800',
    [ApproveStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
    [ApproveStatus.REJECTED]: 'bg-red-100 text-red-800',
});

// ─── Cost Type ───
export const CostType = Object.freeze({
    FUEL: 'FUEL',
    TOLL: 'TOLL',
    REPAIR: 'REPAIR',
    OTHER: 'OTHER',
});

export const CostTypeLabels = Object.freeze({
    [CostType.FUEL]: 'Nhiên liệu',
    [CostType.TOLL]: 'Phí đường bộ',
    [CostType.REPAIR]: 'Sửa chữa',
    [CostType.OTHER]: 'Khác',
});
