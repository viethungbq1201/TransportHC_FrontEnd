// ─── Backend Enum Synchronization ───
// These values MUST exactly match the Java enum definitions in the backend.
// Do NOT use hardcoded strings elsewhere — always import from this file.

// ─── Role Codes ───
export const RoleCode = Object.freeze({
    ADMIN: 'ADMIN',
    DRIVER: 'DRIVER',
    APPROVER: 'APPROVER',
});

export const RoleCodeLabels = Object.freeze({
    [RoleCode.ADMIN]: 'Admin',
    [RoleCode.DRIVER]: 'Driver',
    [RoleCode.APPROVER]: 'Approver',
});

// ─── User Status ───
export const UserStatus = Object.freeze({
    AVAILABLE: 'AVAILABLE',
    BUSY: 'BUSY',
    OFFLINE: 'OFFLINE',
});

export const UserStatusLabels = Object.freeze({
    [UserStatus.AVAILABLE]: 'Available',
    [UserStatus.BUSY]: 'Busy',
    [UserStatus.OFFLINE]: 'Offline',
});

export const UserStatusColors = Object.freeze({
    [UserStatus.AVAILABLE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [UserStatus.BUSY]: 'bg-amber-50 text-amber-700 border-amber-200',
    [UserStatus.OFFLINE]: 'bg-slate-100 text-slate-600 border-slate-200',
});

// ─── Truck Status ───
export const TruckStatus = Object.freeze({
    AVAILABLE: 'AVAILABLE',
    IN_USE: 'IN_USE',
    MAINTENANCE: 'MAINTENANCE',
});

export const TruckStatusLabels = Object.freeze({
    [TruckStatus.AVAILABLE]: 'Available',
    [TruckStatus.IN_USE]: 'In Use',
    [TruckStatus.MAINTENANCE]: 'Maintenance',
});

export const TruckStatusColors = Object.freeze({
    [TruckStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-800',
    [TruckStatus.IN_USE]: 'bg-blue-100 text-blue-800',
    [TruckStatus.MAINTENANCE]: 'bg-amber-100 text-amber-800',
});

// ─── Schedule Status ───
export const ScheduleStatus = Object.freeze({
    WAITING: 'WAITING',
    DELIVERING: 'DELIVERING',
    DONE: 'DONE',
});

export const ScheduleStatusLabels = Object.freeze({
    [ScheduleStatus.WAITING]: 'Waiting',
    [ScheduleStatus.DELIVERING]: 'Delivering',
    [ScheduleStatus.DONE]: 'Done',
});

export const ScheduleStatusColors = Object.freeze({
    [ScheduleStatus.WAITING]: 'bg-amber-100 text-amber-800',
    [ScheduleStatus.DELIVERING]: 'bg-blue-100 text-blue-800',
    [ScheduleStatus.DONE]: 'bg-emerald-100 text-emerald-800',
});

// ─── Approve Status ───
export const ApproveStatus = Object.freeze({
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
});

export const ApproveStatusLabels = Object.freeze({
    [ApproveStatus.PENDING]: 'Pending',
    [ApproveStatus.APPROVED]: 'Approved',
    [ApproveStatus.REJECTED]: 'Rejected',
});

export const ApproveStatusColors = Object.freeze({
    [ApproveStatus.PENDING]: 'bg-amber-100 text-amber-800',
    [ApproveStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
    [ApproveStatus.REJECTED]: 'bg-red-100 text-red-800',
});

// ─── Transaction Type ───
export const TransactionType = Object.freeze({
    IMPORT: 'IMPORT',
    EXPORT: 'EXPORT',
});

export const TransactionTypeLabels = Object.freeze({
    [TransactionType.IMPORT]: 'Import',
    [TransactionType.EXPORT]: 'Export',
});

// ─── Salary Report Status ───
export const SalaryReportStatus = Object.freeze({
    PROCESSING: 'PROCESSING',
    DONE: 'DONE',
});

export const SalaryReportStatusLabels = Object.freeze({
    [SalaryReportStatus.PROCESSING]: 'Processing',
    [SalaryReportStatus.DONE]: 'Done',
});

export const SalaryReportStatusColors = Object.freeze({
    [SalaryReportStatus.PROCESSING]: 'bg-amber-100 text-amber-800',
    [SalaryReportStatus.DONE]: 'bg-emerald-100 text-emerald-800',
});
