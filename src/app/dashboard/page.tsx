'use client';

import { FileText, Package, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardPage() {
    // Stats configuration (values will be fetched from API)
    const stats = [
        {
            title: 'Báo giá hôm nay',
            value: '0',
            icon: FileText,
            variant: 'blue' as const,
            change: '0%',
        },
        {
            title: 'Sản phẩm trong kho',
            value: '0',
            icon: Package,
            variant: 'green' as const,
            change: '0%',
        },
        {
            title: 'Tin nhắn mới',
            value: '0',
            icon: MessageSquare,
            variant: 'purple' as const,
            change: '0',
        },
        {
            title: 'Doanh thu đã duyệt',
            value: '0',
            icon: TrendingUp,
            variant: 'orange' as const,
            change: '0%',
        },
    ];

    // Recent quotes will be fetched from API
    const recentQuotes: any[] = [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Chào mừng trở lại! Đây là tổng quan hoạt động hôm nay.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        variant={stat.variant}
                        change={stat.change}
                    />
                ))}
            </div>

            {/* Recent Quotes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200" style={{ padding: '1rem 1.5rem' }}>
                    <h2 className="text-lg font-semibold text-gray-900">Báo giá gần đây</h2>
                </div>
                {recentQuotes.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {recentQuotes.map((quote) => (
                            <div key={quote.id} className="hover:bg-gray-50 transition" style={{ padding: '1rem 1.5rem' }}>
                                <div className="flex items-center" style={{ gap: '1rem' }}>
                                    {/* Product Image */}
                                    <img
                                        src={quote.productImage}
                                        alt={quote.productName}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />

                                    {/* Quote Info */}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{quote.productName}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {quote.quantity} cái • {quote.material}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {(quote.totalPrice / 1000000).toFixed(1)} triệu
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${quote.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : quote.status === 'sent'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : quote.status === 'rejected'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {quote.status === 'approved'
                                                ? 'Đã duyệt'
                                                : quote.status === 'sent'
                                                    ? 'Đã gửi'
                                                    : quote.status === 'rejected'
                                                        ? 'Từ chối'
                                                        : 'Nháp'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Chưa có báo giá nào</p>
                        <p className="text-sm text-gray-500 mt-1">Tạo báo giá mới để bắt đầu</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/quotes"
                    className="bg-primary-50 border-2 border-primary-200 rounded-lg hover:border-primary-400 transition cursor-pointer"
                    style={{ padding: '1.5rem' }}
                >
                    <FileText className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Tạo báo giá mới</h3>
                    <p className="text-sm text-gray-600">Upload ảnh và tạo báo giá nhanh</p>
                </Link>

                <Link
                    href="/products"
                    className="bg-green-50 border-2 border-green-200 rounded-lg hover:border-green-400 transition cursor-pointer"
                    style={{ padding: '1.5rem' }}
                >
                    <Package className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Quản lý sản phẩm</h3>
                    <p className="text-sm text-gray-600">Thêm hoặc chỉnh sửa sản phẩm</p>
                </Link>

                <Link
                    href="/chat"
                    className="bg-purple-50 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition cursor-pointer"
                    style={{ padding: '1.5rem' }}
                >
                    <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Chat với team</h3>
                    <p className="text-sm text-gray-600">Trao đổi về sản phẩm và giá</p>
                </Link>
            </div>
        </div>
    );
}
