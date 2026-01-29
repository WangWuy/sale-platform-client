'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import {
    Permission,
    UserRole,
    ROLE_PERMISSIONS,
    userHasPermission,
    userHasAnyPermission,
    userHasAllPermissions,
} from '@/constants/permissions';

// =====================================================
// Types
// =====================================================

interface User {
    id: number;
    email: string;
    username?: string | null;
    fullName?: string | null;
    phone?: string | null;
    role: UserRole;
    status: number;
    avatarUrl?: string | null;
}

interface AuthContextValue {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    permissions: Permission[];

    // Actions
    login: (identifier: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;

    // Permission helpers
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
    isAdmin: () => boolean;
    isManager: () => boolean;
    isSales: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =====================================================
// Provider Component
// =====================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Compute derived state
    const isAuthenticated = !!user && authService.hasToken();

    // Load permissions based on user role
    const loadPermissions = useCallback((userRole: UserRole) => {
        const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
        setPermissions(rolePermissions);
    }, []);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = authService.getStoredUser();
                if (storedUser && authService.hasToken()) {
                    setUser(storedUser as User);
                    loadPermissions(storedUser.role as UserRole);
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                authService.removeTokens();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [loadPermissions]);

    // Keep auth state in sync with storage changes (including manual token removal)
    useEffect(() => {
        const syncAuthState = () => {
            const storedUser = authService.getStoredUser();
            const hasToken = authService.hasToken();

            if (!hasToken || !storedUser) {
                if (user !== null || permissions.length > 0) {
                    setUser(null);
                    setPermissions([]);
                }
                return;
            }

            if (!user) {
                setUser(storedUser as User);
                loadPermissions(storedUser.role as UserRole);
            }
        };

        syncAuthState();

        const onStorage = (event: StorageEvent) => {
            if (
                event.key === 'accessToken' ||
                event.key === 'refreshToken' ||
                event.key === 'user'
            ) {
                syncAuthState();
            }
        };

        const onFocus = () => syncAuthState();
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                syncAuthState();
            }
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Same-tab changes (DevTools/localStorage) don't trigger storage event
        const intervalId = window.setInterval(syncAuthState, 1000);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.clearInterval(intervalId);
        };
    }, [user, permissions.length, loadPermissions]);

    // Refresh user data from API
    const refreshUser = useCallback(async () => {
        if (!authService.hasToken()) return;

        try {
            const freshUser = await authService.getCurrentUser();
            if (freshUser) {
                setUser(freshUser as User);
                loadPermissions(freshUser.role as UserRole);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, [loadPermissions]);

    // Login action
    const login = useCallback(
        async (identifier: string, password: string): Promise<boolean> => {
            try {
                const result = await authService.login({ identifier, password });
                if (result?.user) {
                    setUser(result.user as User);
                    loadPermissions(result.user.role as UserRole);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },
        [loadPermissions]
    );

    // Logout action
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            setPermissions([]);
            router.push('/login');
        }
    }, [router]);

    // Permission check helpers
    const hasPermission = useCallback(
        (permission: Permission): boolean => {
            return userHasPermission(user, permission);
        },
        [user]
    );

    const hasAnyPermission = useCallback(
        (perms: Permission[]): boolean => {
            return userHasAnyPermission(user, perms);
        },
        [user]
    );

    const hasAllPermissions = useCallback(
        (perms: Permission[]): boolean => {
            return userHasAllPermissions(user, perms);
        },
        [user]
    );

    const isAdmin = useCallback(() => user?.role === UserRole.ADMIN, [user]);
    const isManager = useCallback(() => user?.role === UserRole.MANAGER, [user]);
    const isSales = useCallback(() => user?.role === UserRole.SALES, [user]);

    // Context value
    const value: AuthContextValue = {
        user,
        isAuthenticated,
        isLoading,
        permissions,
        login,
        logout,
        refreshUser,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isManager,
        isSales,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =====================================================
// Hook
// =====================================================

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthProvider;
