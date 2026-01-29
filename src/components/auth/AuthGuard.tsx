'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (requireAuth) {
            if (!isAuthenticated) {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('redirectAfterLogin', pathname);
                }
                router.push('/login');
            }
            return;
        }

        // If route is login but user is already authenticated
        if (!requireAuth && isAuthenticated && pathname === '/login') {
            let redirectPath = '/dashboard';
            if (typeof window !== 'undefined') {
                const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
                if (storedRedirect) {
                    redirectPath = storedRedirect;
                    sessionStorage.removeItem('redirectAfterLogin');
                }
            }
            router.push(redirectPath);
        }
    }, [isLoading, requireAuth, isAuthenticated, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang kiểm tra...</p>
                </div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang chuyển hướng...</p>
                </div>
            </div>
        );
    }

    if (!requireAuth && isAuthenticated && pathname === '/login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang chuyển hướng...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
