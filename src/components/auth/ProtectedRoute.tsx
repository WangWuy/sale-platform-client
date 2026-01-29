'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Permission } from '@/constants/permissions';

// =====================================================
// Types
// =====================================================

interface ProtectedRouteProps {
    children: ReactNode;
    /**
     * Required permission to access this route
     */
    permission?: Permission;
    /**
     * Multiple permissions - user must have ALL of them
     */
    permissions?: Permission[];
    /**
     * Multiple permissions - user needs ANY of them
     */
    anyPermissions?: Permission[];
    /**
     * Redirect path if authentication fails (default: /login)
     */
    loginRedirect?: string;
    /**
     * Redirect path if authorization fails (default: /access-denied)
     */
    accessDeniedRedirect?: string;
    /**
     * Custom loading component
     */
    loadingComponent?: ReactNode;
}

// =====================================================
// Loading Component
// =====================================================

function DefaultLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Đang kiểm tra quyền truy cập...</p>
            </div>
        </div>
    );
}

// =====================================================
// Protected Route Component
// =====================================================

/**
 * ProtectedRoute - Bảo vệ route với authentication và authorization
 *
 * @example
 * // Chỉ cần đăng nhập
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 *
 * @example
 * // Cần permission cụ thể
 * <ProtectedRoute permission={PERMISSIONS.USERS.VIEW}>
 *   <UsersPage />
 * </ProtectedRoute>
 *
 * @example
 * // Cần tất cả permissions
 * <ProtectedRoute permissions={[PERMISSIONS.USERS.VIEW, PERMISSIONS.USERS.CREATE]}>
 *   <UserManagementPage />
 * </ProtectedRoute>
 *
 * @example
 * // Cần bất kỳ permission nào
 * <ProtectedRoute anyPermissions={[PERMISSIONS.QUOTES.UPDATE, PERMISSIONS.QUOTES.UPDATE_OWN]}>
 *   <EditQuotePage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
    children,
    permission,
    permissions,
    anyPermissions,
    loginRedirect = '/login',
    accessDeniedRedirect = '/access-denied',
    loadingComponent,
}: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const {
        isAuthenticated,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    } = useAuth();

    useEffect(() => {
        // Wait for loading to complete
        if (isLoading) return;

        // Check authentication
        if (!isAuthenticated) {
            // Store intended destination for redirect after login
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('redirectAfterLogin', pathname);
            }
            router.push(loginRedirect);
            return;
        }

        // Check authorization
        let hasAccess = true;

        if (permission) {
            hasAccess = hasPermission(permission);
        } else if (permissions && permissions.length > 0) {
            hasAccess = hasAllPermissions(permissions);
        } else if (anyPermissions && anyPermissions.length > 0) {
            hasAccess = hasAnyPermission(anyPermissions);
        }

        if (!hasAccess) {
            router.push(accessDeniedRedirect);
        }
    }, [
        isLoading,
        isAuthenticated,
        permission,
        permissions,
        anyPermissions,
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        router,
        pathname,
        loginRedirect,
        accessDeniedRedirect,
    ]);

    // Show loading state
    if (isLoading) {
        return <>{loadingComponent || <DefaultLoader />}</>;
    }

    // Not authenticated - will redirect
    if (!isAuthenticated) {
        return <>{loadingComponent || <DefaultLoader />}</>;
    }

    // Check access
    let hasAccess = true;
    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        hasAccess = hasAllPermissions(permissions);
    } else if (anyPermissions && anyPermissions.length > 0) {
        hasAccess = hasAnyPermission(anyPermissions);
    }

    // No access - will redirect
    if (!hasAccess) {
        return <>{loadingComponent || <DefaultLoader />}</>;
    }

    // All checks passed
    return <>{children}</>;
}

export default ProtectedRoute;
