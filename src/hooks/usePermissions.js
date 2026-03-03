import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { hasPermission, hasAnyPermission, hasRole, hasAnyRole, canAccessNavItem, ROLES } from '@/constants/permissions';

/**
 * Custom hook for permission checking throughout the app.
 *
 * Usage:
 *   const { can, canAny, isRole, userRoles } = usePermissions();
 *   if (can('CREATE_USER')) { ... }
 *   if (canAny(['VIEW_TRUCK', 'CREATE_TRUCK'])) { ... }
 *   if (isRole('ADMIN')) { ... }
 */
const usePermissions = () => {
    const { user } = useAuth();

    const helpers = useMemo(() => ({
        /**
         * Check if the current user has a specific permission.
         * @param {string} permCode
         * @returns {boolean}
         */
        can: (permCode) => hasPermission(user, permCode),

        /**
         * Check if the current user has ANY of the given permissions.
         * @param {string[]} permCodes
         * @returns {boolean}
         */
        canAny: (permCodes) => hasAnyPermission(user, permCodes),

        /**
         * Check if the current user has a specific role.
         * @param {string} role
         * @returns {boolean}
         */
        isRole: (role) => hasRole(user, role),

        /**
         * Check if the current user has ANY of the given roles.
         * @param {string[]} roles
         * @returns {boolean}
         */
        isAnyRole: (roles) => hasAnyRole(user, roles),

        /**
         * Check if the user can access a specific nav path.
         * @param {string} path
         * @returns {boolean}
         */
        canAccessNav: (path) => canAccessNavItem(user, path),

        /** Whether the current user is an admin */
        isAdmin: hasRole(user, ROLES.ADMIN),

        /** Current user's roles array */
        userRoles: user?.roles || [],

        /** Current user's permissions array */
        userPermissions: user?.permissions || [],
    }), [user]);

    return helpers;
};

export default usePermissions;
