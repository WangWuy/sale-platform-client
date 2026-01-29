'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { endpoints } from '@/config/env';

interface UserData {
    id: number;
    email: string;
    fullName?: string;
    role: number;
    avatarUrl?: string | null;
}

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch current user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                const response = await fetch(endpoints.auth.me, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Clear auth tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to login
        router.push('/login');
    };

    const getRoleLabel = (role: number) => {
        switch (role) {
            case 1: return 'Admin';
            case 2: return 'Manager';
            case 3: return 'Sales';
            default: return 'User';
        }
    };

    return (
        <header
            className="bg-white border-b border-gray-200"
            style={{ padding: '1rem 1.5rem' }}
        >
            <div className="flex items-center justify-between">
                {/* Spacer to push right section */}
                <div className="flex-1"></div>

                {/* Right Section */}
                <div className="flex items-center gap-4 ml-6">
                    {/* Notifications */}
                    <button
                        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        aria-label="Thông báo"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-label="Có thông báo mới"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                            style={{ padding: '0.5rem 0.75rem 0.5rem 1rem' }}
                            aria-label="Menu người dùng"
                            aria-expanded={showUserMenu}
                            aria-haspopup="true"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {userData?.fullName || userData?.email || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {userData ? getRoleLabel(userData.role) : 'Loading...'}
                                </p>
                            </div>
                            {userData?.avatarUrl ? (
                                <img
                                    src={userData.avatarUrl}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50" style={{ marginTop: '0.5rem', minWidth: '200px' }}>
                                <Link
                                    href="/settings"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center text-gray-700 hover:bg-gray-50 transition"
                                    style={{ gap: '0.75rem', padding: '0.75rem 1rem' }}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="text-sm font-medium">Cài đặt</span>
                                </Link>
                                <div className="border-t border-gray-100"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center text-red-600 hover:bg-red-50 transition"
                                    style={{ gap: '0.75rem', padding: '0.75rem 1rem' }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
