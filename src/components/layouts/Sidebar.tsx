'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Package,
    FolderTree,
    Users,
    BarChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Layers,
    ScanLine,
    Truck,
    PackageCheck,
    FileType,
    Tag,
    Activity,
    FolderOpen,
    LucideIcon
} from 'lucide-react';
import styles from './Sidebar.module.scss';
import { useAuth } from '@/providers/AuthProvider';
import { PERMISSIONS, Permission } from '@/constants/permissions';

interface NavItem {
    path: string;
    icon: LucideIcon;
    label: string;
    color: string;
    permission?: Permission;
    anyPermissions?: Permission[];
}

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);
    const pathname = usePathname();
    const { hasPermission, hasAnyPermission } = useAuth();

    const mainNavItems: NavItem[] = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
        { path: '/quotes/list', icon: FileText, label: 'Báo Giá', color: 'from-emerald-500 to-emerald-600', permission: PERMISSIONS.QUOTES.VIEW },
        { path: '/products', icon: Package, label: 'Sản Phẩm', color: 'from-teal-500 to-teal-600', permission: PERMISSIONS.PRODUCTS.VIEW },
        { path: '/quote-scanner', icon: ScanLine, label: 'AI Scanner', color: 'from-purple-500 to-pink-600', permission: PERMISSIONS.IMAGE_MATCHING.USE },
        { path: '/customers', icon: Users, label: 'Khách Hàng', color: 'from-blue-500 to-cyan-600', permission: PERMISSIONS.CUSTOMERS.VIEW },
        { path: '/chat', icon: MessageSquare, label: 'Chat', color: 'from-rose-500 to-rose-600' },
        { path: '/analytics', icon: BarChart, label: 'Phân Tích', color: 'from-orange-500 to-orange-600', permission: PERMISSIONS.SETTINGS.MANAGE },
    ];

    const secondaryNavItems: NavItem[] = [
        { path: '/materials', icon: Layers, label: 'Vật Liệu', color: 'from-cyan-500 to-cyan-600', permission: PERMISSIONS.MATERIALS.CREATE },
        { path: '/categories', icon: FolderTree, label: 'Danh Mục', color: 'from-amber-500 to-amber-600', permission: PERMISSIONS.CATEGORIES.CREATE },
        { path: '/suppliers', icon: Truck, label: 'Nhà Cung Cấp', color: 'from-indigo-500 to-indigo-600', permission: PERMISSIONS.SUPPLIERS.CREATE },
        { path: '/inventory', icon: PackageCheck, label: 'Tồn Kho', color: 'from-purple-500 to-purple-600', permission: PERMISSIONS.INVENTORY.CREATE },
        { path: '/product-templates', icon: FileType, label: 'Mẫu Sản Phẩm', color: 'from-violet-500 to-violet-600', permission: PERMISSIONS.PRODUCTS.CREATE },
        { path: '/design-tags', icon: Tag, label: 'Design Tags', color: 'from-pink-500 to-pink-600', permission: PERMISSIONS.PRODUCTS.CREATE },
        { path: '/files', icon: FolderOpen, label: 'File Manager', color: 'from-emerald-500 to-emerald-600', permission: PERMISSIONS.SETTINGS.MANAGE },
        { path: '/audit-logs', icon: Activity, label: 'Audit Logs', color: 'from-slate-500 to-slate-600', permission: PERMISSIONS.AUDIT_LOGS.VIEW },
        { path: '/users', icon: Users, label: 'Người Dùng', color: 'from-gray-500 to-gray-600', permission: PERMISSIONS.USERS.VIEW },
        { path: '/settings', icon: Settings, label: 'Cài Đặt', color: 'from-zinc-500 to-zinc-600' },
    ];

    // Filter nav items based on permissions
    const filteredMainNavItems = useMemo(() => {
        return mainNavItems.filter(item => {
            if (!item.permission && !item.anyPermissions) return true;
            if (item.permission) return hasPermission(item.permission);
            if (item.anyPermissions) return hasAnyPermission(item.anyPermissions);
            return true;
        });
    }, [hasPermission, hasAnyPermission]);

    const filteredSecondaryNavItems = useMemo(() => {
        return secondaryNavItems.filter(item => {
            if (!item.permission && !item.anyPermissions) return true;
            if (item.permission) return hasPermission(item.permission);
            if (item.anyPermissions) return hasAnyPermission(item.anyPermissions);
            return true;
        });
    }, [hasPermission, hasAnyPermission]);

    const renderNavItem = (item: NavItem, isActive: boolean) => (
        <Link
            key={item.path}
            href={item.path}
            className={`
                group relative flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200 ease-in-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
                ${isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
                ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? item.label : ''}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
        >
            {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-full"></div>
            )}

            <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-lg
                transition-all duration-200
                ${isActive
                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                    : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                }
            `}>
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-gray-400 group-hover:text-white group-hover:scale-110'
                    }`} />
            </div>

            {!isCollapsed && (
                <span className={`
                    font-medium text-sm transition-all duration-200
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                `}>
                    {item.label}
                </span>
            )}

            {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            )}
        </Link>
    );

    return (
        <aside
            className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                } flex flex-col shadow-2xl relative`}
        >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none"></div>

            {/* Logo Section */}
            <div className={styles.logoSection}>
                {!isCollapsed && (
                    <div>
                        <h1>Oval Xanh</h1>
                        <p>Hệ thống báo giá</p>
                    </div>
                )}
                {isCollapsed && (
                    <div className={styles.logoCollapsed}>
                        <h1>OX</h1>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 relative" role="navigation" aria-label="Điều hướng chính">
                <div className="space-y-1">
                    {!isCollapsed && (
                        <div className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-gray-500/80">
                            Chức năng chính
                        </div>
                    )}
                    {filteredMainNavItems.map((item) => {
                        const isActive = pathname === item.path;
                        return renderNavItem(item, isActive);
                    })}
                </div>

                {filteredSecondaryNavItems.length > 0 && (
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => setIsSecondaryOpen((prev) => !prev)}
                            className={`
                                w-full h-9 flex items-center rounded-lg px-3
                                text-[0.7rem] font-semibold uppercase tracking-widest
                                text-gray-500/80 hover:text-gray-300 hover:bg-white/5
                                transition-colors duration-200
                                ${isCollapsed ? 'justify-center' : 'justify-between'}
                            `}
                            aria-expanded={isSecondaryOpen}
                            aria-controls="sidebar-secondary-group"
                            aria-label="Chức năng phụ"
                        >
                            {!isCollapsed && <span>Chức năng phụ</span>}
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${isSecondaryOpen ? 'rotate-0' : '-rotate-90'}`}
                            />
                        </button>

                        {isCollapsed && <div className="mx-3 my-3 h-px bg-white/10"></div>}

                        <div
                            id="sidebar-secondary-group"
                            className={`${isSecondaryOpen ? 'block' : 'hidden'} space-y-1`}
                        >
                            {filteredSecondaryNavItems.map((item) => {
                                const isActive = pathname === item.path;
                                return renderNavItem(item, isActive);
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Collapse Toggle */}
            <div className="relative p-4 border-t border-gray-700/50">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 text-gray-400 hover:text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    aria-label={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
                    aria-expanded={!isCollapsed}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-6 h-6 transition-transform group-hover:scale-110" />
                    ) : (
                        <>
                            <ChevronLeft className="w-6 h-6 transition-transform group-hover:scale-110" />
                            <span className="text-base font-medium">Thu gọn</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
