'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthGuard } from '../auth/AuthGuard';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const pathname = usePathname();

    // Pages that should not have dashboard layout
    const authPages = ['/login', '/forgot-password', '/'];
    const isAuthPage = authPages.includes(pathname);

    // If it's an auth page, render without layout
    if (isAuthPage) {
        return <>{children}</>;
    }

    // Protected pages with dashboard layout
    return (
        <AuthGuard requireAuth={true}>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <Header />

                    {/* Page Content */}
                    <main
                        className={`flex-1 bg-gray-50 ${pathname === '/chat' || pathname === '/users' ? 'overflow-hidden' : 'overflow-y-auto'}`}
                        style={{ padding: pathname === '/chat' ? '0' : '2rem' }}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
};

export default DashboardLayout;
