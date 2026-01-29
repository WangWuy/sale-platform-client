'use client';

import { Bell, Search, User } from 'lucide-react';
import { AvatarFallback } from '../ui/ImageFallback';
import { useState } from 'react';

interface DashboardHeaderProps {
    title?: string;
    subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Get user from localStorage (mock)
    const user = {
        name: 'Nguyễn Văn A',
        role: 'Sales Manager'
    };

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl">
                    {title ? (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            {subtitle && <p className="text-gray-600 dark:text-slate-400 mt-1">{subtitle}</p>}
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm, báo giá..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4 ml-6">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{user.role}</p>
                        </div>
                        <button className="w-10 h-10 rounded-full hover:shadow-lg transition shadow-md overflow-hidden">
                            <AvatarFallback width={40} height={40} className="w-full h-full" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
