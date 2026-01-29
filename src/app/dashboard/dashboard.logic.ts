import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { User } from '@/types/auth';

export function useDashboardLogic() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await authService.getOrFetchCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [router]);

    const handleLogout = async () => {
        await authService.logout();
        router.push('/login');
    };

    return {
        user,
        isLoading,
        sidebarOpen,
        setSidebarOpen,
        handleLogout
    };
}
