'use client';

import { ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
    Permission,
    UserRole,
} from '@/constants/permissions';

interface PermissionGuardProps {
    /**
     * Single permission to check
     */
    permission?: Permission;

    /**
     * Multiple permissions - user must have ALL of them
     */
    permissions?: Permission[];

    /**
     * Multiple permissions - user must have ANY of them
     */
    anyPermissions?: Permission[];

    /**
     * Children to render if user has permission
     */
    children: ReactNode;

    /**
     * Fallback content if user doesn't have permission
     * If not provided, nothing will be rendered
     */
    fallback?: ReactNode;

    /**
     * If true, redirect to access denied page instead of showing fallback
     */
    redirectOnDeny?: boolean;

    /**
     * Custom redirect path (default: /access-denied)
     */
    redirectPath?: string;
}

/**
 * PermissionGuard Component
 *
 * Conditionally renders children based on user permissions.
 * Uses AuthProvider context for permission checking.
 *
 * @example
 * // Single permission
 * <PermissionGuard permission={PERMISSIONS.USERS.VIEW}>
 *   <UserList />
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (must have ALL)
 * <PermissionGuard permissions={[PERMISSIONS.USERS.VIEW, PERMISSIONS.USERS.CREATE]}>
 *   <UserManagement />
 * </PermissionGuard>
 *
 * @example
 * // Any permission (must have at least ONE)
 * <PermissionGuard anyPermissions={[PERMISSIONS.QUOTES.UPDATE, PERMISSIONS.QUOTES.UPDATE_OWN]}>
 *   <EditQuoteButton />
 * </PermissionGuard>
 *
 * @example
 * // With fallback
 * <PermissionGuard permission={PERMISSIONS.USERS.DELETE} fallback={<DisabledButton />}>
 *   <DeleteButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
    permission,
    permissions,
    anyPermissions,
    children,
    fallback = null,
    redirectOnDeny = false,
    redirectPath = '/access-denied',
}: PermissionGuardProps) {
    const router = useRouter();
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = useAuth();

    const hasAccess = useMemo(() => {
        if (permission) {
            return hasPermission(permission);
        }
        if (permissions && permissions.length > 0) {
            return hasAllPermissions(permissions);
        }
        if (anyPermissions && anyPermissions.length > 0) {
            return hasAnyPermission(anyPermissions);
        }
        // No permission specified, allow access
        return true;
    }, [permission, permissions, anyPermissions, hasPermission, hasAllPermissions, hasAnyPermission]);

    // Still loading auth state
    if (isLoading) {
        return null;
    }

    // User has access
    if (hasAccess) {
        return <>{children}</>;
    }

    // Redirect if configured
    if (redirectOnDeny) {
        router.push(redirectPath);
        return null;
    }

    // User doesn't have access, show fallback
    return <>{fallback}</>;
}

/**
 * Hook to check permissions programmatically
 * Re-exports useAuth's permission functions for backward compatibility
 *
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 *
 * if (hasPermission(PERMISSIONS.USERS.DELETE)) {
 *   // Show delete button
 * }
 */
export function usePermissions() {
    const {
        user,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isManager,
        isSales,
    } = useAuth();

    return {
        user,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isManager,
        isSales,
    };
}

export default PermissionGuard;
