'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { User, LoginRequest } from '@/types/auth';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@/constants/permissions';

// =====================================================
// Query Keys
// =====================================================

export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
    permissions: () => [...authKeys.all, 'permissions'] as const,
};

// =====================================================
// Queries
// =====================================================

/**
 * Hook để fetch và cache current user
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: authKeys.user(),
        queryFn: async () => {
            if (!authService.hasToken()) return null;
            return authService.getCurrentUser();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false,
    });
}

/**
 * Hook để fetch permissions từ API
 */
export function useUserPermissions() {
    const { data: user } = useCurrentUser();

    return useQuery({
        queryKey: authKeys.permissions(),
        queryFn: async () => {
            if (!authService.hasToken() || !user) return [];
            // Get permissions based on role
            const role = user.role as UserRole;
            return ROLE_PERMISSIONS[role] || [];
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

// =====================================================
// Mutations
// =====================================================

/**
 * Hook để thực hiện login
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const result = await authService.login(credentials);
            if (!result) throw new Error('Login failed');
            return result;
        },
        onSuccess: (data) => {
            // Update cache with user data
            queryClient.setQueryData(authKeys.user(), data.user);
            // Invalidate permissions to refetch
            queryClient.invalidateQueries({ queryKey: authKeys.permissions() });
        },
        onError: () => {
            // Clear cache on error
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
    });
}

/**
 * Hook để thực hiện logout
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await authService.logout();
        },
        onSettled: () => {
            // Clear all auth-related queries
            queryClient.removeQueries({ queryKey: authKeys.all });
            // Redirect handled by AuthProvider
        },
    });
}

/**
 * Hook để refresh token
 */
export function useRefreshToken() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return authService.refreshToken();
        },
        onSuccess: () => {
            // Refetch user after token refresh
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
        onError: () => {
            // Clear auth on refresh failure
            queryClient.removeQueries({ queryKey: authKeys.all });
            authService.clearAuthAndRedirect();
        },
    });
}

// =====================================================
// Permission Check Hooks
// =====================================================

/**
 * Hook để kiểm tra một permission cụ thể
 */
export function useHasPermission(permission: Permission): boolean {
    const { data: permissions = [] } = useUserPermissions();
    return permissions.includes(permission);
}

/**
 * Hook để kiểm tra có bất kỳ permission nào trong list
 */
export function useHasAnyPermission(permissionList: Permission[]): boolean {
    const { data: permissions = [] } = useUserPermissions();
    return permissionList.some((p) => permissions.includes(p));
}

/**
 * Hook để kiểm tra có tất cả permissions trong list
 */
export function useHasAllPermissions(permissionList: Permission[]): boolean {
    const { data: permissions = [] } = useUserPermissions();
    return permissionList.every((p) => permissions.includes(p));
}

/**
 * Hook để kiểm tra user role
 */
export function useUserRole(): UserRole | null {
    const { data: user } = useCurrentUser();
    return user?.role as UserRole || null;
}

/**
 * Hook để check các role shortcuts
 */
export function useRoleChecks() {
    const role = useUserRole();

    return {
        isAdmin: role === UserRole.ADMIN,
        isManager: role === UserRole.MANAGER,
        isSales: role === UserRole.SALES,
        role,
    };
}
