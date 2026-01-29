import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { RefreshTokenResponse } from '@/types/auth';

/**
 * Custom hook for managing token refresh
 * 
 * @example
 * ```tsx
 * const { refreshToken, isRefreshing, error } = useTokenRefresh();
 * 
 * const handleRefresh = async () => {
 *   const result = await refreshToken();
 *   if (result) {
 *     console.log('Token refreshed successfully');
 *   }
 * };
 * ```
 */
export const useTokenRefresh = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Manually trigger token refresh
     * Note: This is usually handled automatically by the API interceptor
     */
    const refreshToken = useCallback(async (): Promise<RefreshTokenResponse | null> => {
        setIsRefreshing(true);
        setError(null);

        try {
            const result = await authService.refreshToken();
            setIsRefreshing(false);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Token refresh failed');
            setError(error);
            setIsRefreshing(false);
            return null;
        }
    }, []);

    /**
     * Check if refresh token exists
     */
    const hasRefreshToken = useCallback((): boolean => {
        return !!authService.getRefreshToken();
    }, []);

    /**
     * Get the current refresh token
     */
    const getRefreshToken = useCallback((): string | null => {
        return authService.getRefreshToken();
    }, []);

    return {
        refreshToken,
        isRefreshing,
        error,
        hasRefreshToken,
        getRefreshToken,
    };
};

export default useTokenRefresh;
