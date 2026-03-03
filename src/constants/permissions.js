/**
 * Permission constants matching backend DB migration codes.
 * Used for frontend RBAC enforcement.
 */

// ─── Permission Codes ───────────────────────────────────────
export const PERMISSIONS = {
    // Category
    CREATE_CATEGORY: 'CREATE_CATEGORY',
    VIEW_CATEGORY: 'VIEW_CATEGORY',
    UPDATE_CATEGORY: 'UPDATE_CATEGORY',
    DELETE_CATEGORY: 'DELETE_CATEGORY',

    // Product
    CREATE_PRODUCT: 'CREATE_PRODUCT',
    VIEW_PRODUCT: 'VIEW_PRODUCT',
    UPDATE_PRODUCT: 'UPDATE_PRODUCT',
    DELETE_PRODUCT: 'DELETE_PRODUCT',

    // Inventory
    CREATE_INVENTORY: 'CREATE_INVENTORY',
    VIEW_INVENTORY: 'VIEW_INVENTORY',
    FIND_INVENTORY: 'FIND_INVENTORY',
    UPDATE_INVENTORY: 'UPDATE_INVENTORY',
    DELETE_INVENTORY: 'DELETE_INVENTORY',
    FILTER_INVENTORY: 'FILTER_INVENTORY',
    EXPORT_INVENTORY: 'EXPORT_INVENTORY',
    IMPORT_INVENTORY: 'IMPORT_INVENTORY',

    // Cost Type
    CREATE_COST_TYPE: 'CREATE_COST_TYPE',
    VIEW_COST_TYPE: 'VIEW_COST_TYPE',
    UPDATE_COST_TYPE: 'UPDATE_COST_TYPE',
    DELETE_COST_TYPE: 'DELETE_COST_TYPE',

    // Transaction
    CREATE_TRANSACTION: 'CREATE_TRANSACTION',
    VIEW_TRANSACTION: 'VIEW_TRANSACTION',
    UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
    DELETE_TRANSACTION: 'DELETE_TRANSACTION',
    APPROVE_TRANSACTION: 'APPROVE_TRANSACTION',
    REJECT_TRANSACTION: 'REJECT_TRANSACTION',

    // Transaction Detail
    CREATE_TRANSACTION_DETAIL: 'CREATE_TRANSACTION_DETAIL',
    VIEW_TRANSACTION_DETAIL: 'VIEW_TRANSACTION_DETAIL',
    UPDATE_TRANSACTION_DETAIL: 'UPDATE_TRANSACTION_DETAIL',
    DELETE_TRANSACTION_DETAIL: 'DELETE_TRANSACTION_DETAIL',

    // Schedule
    CREATE_SCHEDULE: 'CREATE_SCHEDULE',
    VIEW_SCHEDULE: 'VIEW_SCHEDULE',
    UPDATE_SCHEDULE: 'UPDATE_SCHEDULE',
    APPROVE_SCHEDULE: 'APPROVE_SCHEDULE',
    REJECT_SCHEDULE: 'REJECT_SCHEDULE',
    END_SCHEDULE: 'END_SCHEDULE',
    CANCEL_SCHEDULE: 'CANCEL_SCHEDULE',
    DELETE_SCHEDULE: 'DELETE_SCHEDULE',

    // Cost
    CREATE_COST: 'CREATE_COST',
    VIEW_COST: 'VIEW_COST',
    UPDATE_COST: 'UPDATE_COST',
    APPROVE_COST: 'APPROVE_COST',
    REJECT_COST: 'REJECT_COST',
    DELETE_COST: 'DELETE_COST',

    // Salary Report
    CREATE_1_SALARY_REPORT: 'CREATE_1_SALARY_REPORT',
    CREATE_ALL_SALARY_REPORT: 'CREATE_ALL_SALARY_REPORT',
    VIEW_SALARY_REPORT_DETAIL: 'VIEW_SALARY_REPORT_DETAIL',
    VIEW_SALARY_REPORT: 'VIEW_SALARY_REPORT',
    UPDATE_SALARY_REPORT: 'UPDATE_SALARY_REPORT',
    DELETE_SALARY_REPORT: 'DELETE_SALARY_REPORT',
    APPROVE_SALARY_REPORT: 'APPROVE_SALARY_REPORT',

    // User
    CREATE_USER: 'CREATE_USER',
    VIEW_USER: 'VIEW_USER',
    UPDATE_USER: 'UPDATE_USER',
    UPDATE_STATUS_USER: 'UPDATE_STATUS_USER',
    DELETE_USER: 'DELETE_USER',

    // Truck
    CREATE_TRUCK: 'CREATE_TRUCK',
    VIEW_TRUCK: 'VIEW_TRUCK',
    UPDATE_TRUCK: 'UPDATE_TRUCK',
    UPDATE_STATUS_TRUCK: 'UPDATE_STATUS_TRUCK',
    DELETE_TRUCK: 'DELETE_TRUCK',

    // Route
    CREATE_ROUTE: 'CREATE_ROUTE',
    VIEW_ROUTE: 'VIEW_ROUTE',
    UPDATE_ROUTE: 'UPDATE_ROUTE',
    DELETE_ROUTE: 'DELETE_ROUTE',
};

// ─── Roles ──────────────────────────────────────────────────
export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    ACCOUNTANT: 'ACCOUNTANT',
    DRIVER: 'DRIVER',
};

// ─── Sidebar navigation access map ─────────────────────────
// Maps each sidebar path/group to the permissions required to see it.
// If a user has ANY of the listed permissions, they can see the item.
export const NAV_PERMISSIONS = {
    '/dashboard': [],                  // Everyone can see dashboard
    '/users': ['VIEW_USER'],
    '/trucks': ['VIEW_TRUCK'],
    '/routes': ['VIEW_ROUTE'],
    // Product group
    '/categories': ['VIEW_CATEGORY'],
    '/products': ['VIEW_PRODUCT'],
    // Inventory
    '/inventory': ['VIEW_INVENTORY'],
    // Transaction group
    '/transactions': ['VIEW_TRANSACTION'],
    '/transaction-details': ['VIEW_TRANSACTION_DETAIL'],
    // Schedules
    '/schedules': ['VIEW_SCHEDULE'],
    // Cost group
    '/cost-types': ['VIEW_COST_TYPE'],
    '/costs': ['VIEW_COST'],
    // Report group
    '/salary-reports': ['VIEW_SALARY_REPORT'],
    '/reports': [],                    // Admin-only; controlled by role check below
};

// Reports page is analytics — ADMIN, MANAGER, and ACCOUNTANT have access
export const REPORTS_ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'ACCOUNTANT'];

// ─── Helper functions ───────────────────────────────────────

/**
 * Check if a user has a specific permission.
 * @param {object} user - The user object from AuthContext (has .permissions[])
 * @param {string} permCode - Permission code to check
 * @returns {boolean}
 */
export function hasPermission(user, permCode) {
    if (!user?.permissions) return false;
    // ADMIN role has all permissions (backend grants all via `ON 1=1`)
    if (user.roles?.includes(ROLES.ADMIN)) return true;
    return user.permissions.includes(permCode);
}

/**
 * Check if a user has ANY of the specified permissions.
 * @param {object} user - The user object from AuthContext
 * @param {string[]} permCodes - Array of permission codes
 * @returns {boolean}
 */
export function hasAnyPermission(user, permCodes) {
    if (!user?.permissions || !permCodes?.length) return false;
    if (user.roles?.includes(ROLES.ADMIN)) return true;
    return permCodes.some(p => user.permissions.includes(p));
}

/**
 * Check if a user has a specific role.
 * @param {object} user - The user object from AuthContext
 * @param {string} role - Role code
 * @returns {boolean}
 */
export function hasRole(user, role) {
    if (!user?.roles) return false;
    return user.roles.includes(role);
}

/**
 * Check if a user has ANY of the specified roles.
 * @param {object} user - The user object from AuthContext
 * @param {string[]} roles - Array of role codes
 * @returns {boolean}
 */
export function hasAnyRole(user, roles) {
    if (!user?.roles || !roles?.length) return false;
    return roles.some(r => user.roles.includes(r));
}

/**
 * Check if a nav item/path should be visible to the user.
 * @param {object} user - The user object
 * @param {string} path - The nav item path
 * @returns {boolean}
 */
export function canAccessNavItem(user, path) {
    // Reports page is restricted by role
    if (path === '/reports') {
        return hasAnyRole(user, REPORTS_ALLOWED_ROLES);
    }
    const requiredPerms = NAV_PERMISSIONS[path];
    // If no permissions defined (like dashboard), everyone can access
    if (!requiredPerms || requiredPerms.length === 0) return true;
    return hasAnyPermission(user, requiredPerms);
}
