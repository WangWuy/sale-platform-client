'use client';

import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Users,
    Package,
    Calendar,
    Download
} from 'lucide-react';
import { useCustomerStats } from '@/hooks/useCustomers';
import { useProductStats } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/formatters';

export default function AnalyticsPage() {
    const { stats: customerStats, loading: customerLoading } = useCustomerStats();
    const { stats: productStats, loading: productLoading } = useProductStats();

    const loading = customerLoading || productLoading;

    // Calculate stats with real data
    const stats = {
        revenue: {
            current: 0, // Would need quote/order stats
            previous: 0,
            change: 0
        },
        quotes: {
            current: 0, // Would need quote stats
            previous: 0,
            change: 0
        },
        customers: {
            current: customerStats?.totalCustomers || 0,
            previous: 0,
            change: 0
        },
        products: {
            current: productStats?.totalProducts || 0,
            previous: 0,
            change: 0
        }
    };

    // Monthly revenue data will be fetched from API
    const monthlyRevenue: { month: string; value: number }[] = [];

    // Top products data will be fetched from API  
    const topProducts: { name: string; sales: number; revenue: number }[] = [];

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value));

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="h-14 w-14 bg-gray-200 rounded-2xl animate-pulse mb-4"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
                    <p className="text-gray-600 mt-1">Phân tích hiệu suất kinh doanh</p>
                </div>
                <div className="flex" style={{ gap: '0.75rem' }}>
                    <select className="bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" style={{ padding: '0.625rem 1rem' }}>
                        <option>30 ngày qua</option>
                        <option>90 ngày qua</option>
                        <option>6 tháng qua</option>
                        <option>1 năm qua</option>
                    </select>
                    <button className="flex items-center bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition" style={{ gap: '0.5rem', padding: '0.625rem 1.5rem' }}>
                        <Download className="w-5 h-5" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Doanh thu',
                        value: formatCurrency(stats.revenue.current),
                        change: stats.revenue.change,
                        icon: <DollarSign className="w-7 h-7 text-white" />,
                        color: 'from-green-500 to-emerald-500'
                    },
                    {
                        title: 'Báo giá',
                        value: stats.quotes.current,
                        change: stats.quotes.change,
                        icon: <FileText className="w-7 h-7 text-white" />,
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        title: 'Khách hàng',
                        value: stats.customers.current,
                        change: stats.customers.change,
                        icon: <Users className="w-7 h-7 text-white" />,
                        color: 'from-purple-500 to-pink-500'
                    },
                    {
                        title: 'Sản phẩm',
                        value: stats.products.current,
                        change: stats.products.change,
                        icon: <Package className="w-7 h-7 text-white" />,
                        color: 'from-orange-500 to-red-500'
                    }
                ].map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '1.5rem' }}>
                        <div className="flex items-start justify-between" style={{ marginBottom: '1rem' }}>
                            <div className={`w-14 h-14 bg-gradient-to-br ${metric.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                {metric.icon}
                            </div>
                            <div className={`flex items-center rounded-full text-sm font-semibold ${metric.change > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`} style={{ gap: '0.25rem', padding: '0.375rem 0.75rem' }}>
                                {metric.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {metric.change}%
                            </div>
                        </div>
                        <p className="text-sm text-gray-600" style={{ marginBottom: '0.5rem' }}>{metric.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '2rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900" style={{ marginBottom: '0.25rem' }}>Doanh thu theo tháng</h2>
                            <p className="text-sm text-gray-500">6 tháng gần nhất</p>
                        </div>
                        <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    {monthlyRevenue.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {monthlyRevenue.map((item, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                                        <span className="text-sm font-medium text-gray-700">{item.month}</span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {formatCurrency(item.value)}
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.value / maxRevenue) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Chưa có dữ liệu doanh thu</p>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '2rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900" style={{ marginBottom: '0.25rem' }}>Sản phẩm bán chạy</h2>
                            <p className="text-sm text-gray-500">Top 5 sản phẩm</p>
                        </div>
                        <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    {topProducts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center" style={{ gap: '1rem' }}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                                                'bg-gradient-to-br from-gray-300 to-gray-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.sales} đơn</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            {formatCurrency(product.revenue)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Chưa có dữ liệu sản phẩm</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '1.5rem' }}>
                    <h3 className="text-sm font-medium text-gray-500" style={{ marginBottom: '1rem' }}>Tỷ lệ chuyển đổi</h3>
                    <div className="flex items-end" style={{ gap: '0.75rem' }}>
                        <p className="text-4xl font-bold text-gray-900">0%</p>
                        <div className="flex items-center text-gray-600" style={{ gap: '0.25rem', marginBottom: '0.5rem' }}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">0%</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500" style={{ marginTop: '0.5rem' }}>Từ báo giá sang đơn hàng</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '1.5rem' }}>
                    <h3 className="text-sm font-medium text-gray-500" style={{ marginBottom: '1rem' }}>Giá trị TB đơn hàng</h3>
                    <div className="flex items-end" style={{ gap: '0.75rem' }}>
                        <p className="text-4xl font-bold text-gray-900">₫0</p>
                        <div className="flex items-center text-gray-600" style={{ gap: '0.25rem', marginBottom: '0.5rem' }}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">0%</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500" style={{ marginTop: '0.5rem' }}>So với tháng trước</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '1.5rem' }}>
                    <h3 className="text-sm font-medium text-gray-500" style={{ marginBottom: '1rem' }}>Khách hàng mới</h3>
                    <div className="flex items-end" style={{ gap: '0.75rem' }}>
                        <p className="text-4xl font-bold text-gray-900">0</p>
                        <div className="flex items-center text-gray-600" style={{ gap: '0.25rem', marginBottom: '0.5rem' }}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">0%</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500" style={{ marginTop: '0.5rem' }}>Trong tháng này</p>
                </div>
            </div>
        </div>
    );
}
