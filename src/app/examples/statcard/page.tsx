'use client';

/**
 * StatCard Examples Page
 * 
 * This page demonstrates all the different variants and styles of the StatCard component.
 * Use this as a reference when implementing stats in your pages.
 */

import {
    FileText,
    Package,
    MessageSquare,
    TrendingUp,
    Users,
    DollarSign,
    ShoppingCart,
    Activity,
    Layers
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export default function StatCardExamplesPage() {
    return (
        <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">StatCard Component Examples</h1>
                <p className="text-gray-600">Explore all variants and styles of the StatCard component</p>
            </div>

            {/* Default Style */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Default Style</h2>
                <p className="text-gray-600 mb-6">Clean white background with icon on the right</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Báo giá hôm nay"
                        value={12}
                        icon={FileText}
                        variant="blue"
                        change="+12%"
                    />
                    <StatCard
                        title="Sản phẩm trong kho"
                        value={234}
                        icon={Package}
                        variant="green"
                        change="+3%"
                    />
                    <StatCard
                        title="Tin nhắn mới"
                        value={3}
                        icon={MessageSquare}
                        variant="purple"
                        change="+5"
                    />
                    <StatCard
                        title="Doanh thu đã duyệt"
                        value="245tr"
                        icon={TrendingUp}
                        variant="orange"
                        change="+18%"
                    />
                </div>
            </section>

            {/* Gradient Style */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gradient Style</h2>
                <p className="text-gray-600 mb-6">Colored gradient background for highlighting important metrics</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Tổng sản phẩm"
                        value={234}
                        icon={Package}
                        variant="blue"
                        style="gradient"
                    />
                    <StatCard
                        title="Đã duyệt"
                        value={189}
                        icon={FileText}
                        variant="green"
                        style="gradient"
                    />
                    <StatCard
                        title="Chờ duyệt"
                        value={45}
                        icon={Activity}
                        variant="orange"
                        style="gradient"
                    />
                    <StatCard
                        title="Tổng danh mục"
                        value={12}
                        icon={Layers}
                        variant="amber"
                        style="gradient"
                    />
                </div>
            </section>

            {/* Minimal Style */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Minimal Style</h2>
                <p className="text-gray-600 mb-6">Simple and compact layout for dense dashboards</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Users"
                        value={89}
                        icon={Users}
                        variant="purple"
                        style="minimal"
                        change="+17%"
                    />
                    <StatCard
                        title="Revenue"
                        value="$245M"
                        icon={DollarSign}
                        variant="green"
                        style="minimal"
                        change="+29%"
                    />
                    <StatCard
                        title="Orders"
                        value={156}
                        icon={ShoppingCart}
                        variant="blue"
                        style="minimal"
                        change="+9%"
                    />
                    <StatCard
                        title="Conversion"
                        value="68%"
                        icon={TrendingUp}
                        variant="emerald"
                        style="minimal"
                        change="+12%"
                    />
                </div>
            </section>

            {/* All Color Variants */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">All Color Variants</h2>
                <p className="text-gray-600 mb-6">9 color options to match your metric's meaning</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Blue Variant"
                        value={100}
                        icon={Package}
                        variant="blue"
                        style="gradient"
                        subtitle="Professional, trustworthy"
                    />
                    <StatCard
                        title="Green Variant"
                        value={200}
                        icon={TrendingUp}
                        variant="green"
                        style="gradient"
                        subtitle="Success, growth"
                    />
                    <StatCard
                        title="Purple Variant"
                        value={300}
                        icon={Users}
                        variant="purple"
                        style="gradient"
                        subtitle="Premium, creative"
                    />
                    <StatCard
                        title="Orange Variant"
                        value={400}
                        icon={Activity}
                        variant="orange"
                        style="gradient"
                        subtitle="Warning, attention"
                    />
                    <StatCard
                        title="Red Variant"
                        value={500}
                        icon={FileText}
                        variant="red"
                        style="gradient"
                        subtitle="Urgent, critical"
                    />
                    <StatCard
                        title="Cyan Variant"
                        value={600}
                        icon={Layers}
                        variant="cyan"
                        style="gradient"
                        subtitle="Cool, modern"
                    />
                    <StatCard
                        title="Amber Variant"
                        value={700}
                        icon={Package}
                        variant="amber"
                        style="gradient"
                        subtitle="Warm, categories"
                    />
                    <StatCard
                        title="Pink Variant"
                        value={800}
                        icon={MessageSquare}
                        variant="pink"
                        style="gradient"
                        subtitle="Playful, social"
                    />
                    <StatCard
                        title="Emerald Variant"
                        value={900}
                        icon={TrendingUp}
                        variant="emerald"
                        style="gradient"
                        subtitle="Fresh, eco-friendly"
                    />
                </div>
            </section>

            {/* With Negative Changes */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Positive & Negative Changes</h2>
                <p className="text-gray-600 mb-6">Automatic color coding for change indicators</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Positive Change"
                        value={234}
                        icon={TrendingUp}
                        variant="green"
                        change="+12%"
                    />
                    <StatCard
                        title="Negative Change"
                        value={189}
                        icon={TrendingUp}
                        variant="red"
                        change="-5%"
                    />
                    <StatCard
                        title="No Sign (Positive)"
                        value={156}
                        icon={Package}
                        variant="blue"
                        change="8%"
                    />
                    <StatCard
                        title="Zero Change"
                        value={100}
                        icon={Users}
                        variant="purple"
                        change="0%"
                    />
                </div>
            </section>

            {/* With Subtitles */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">With Subtitles</h2>
                <p className="text-gray-600 mb-6">Add descriptive text for additional context</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Monthly Revenue"
                        value="$245M"
                        icon={DollarSign}
                        variant="green"
                        style="gradient"
                        change="+29%"
                        subtitle="Compared to last month"
                    />
                    <StatCard
                        title="New Customers"
                        value={23}
                        icon={Users}
                        variant="blue"
                        style="gradient"
                        change="+15%"
                        subtitle="This month"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value="68%"
                        icon={TrendingUp}
                        variant="emerald"
                        style="gradient"
                        change="+12%"
                        subtitle="From quote to order"
                    />
                </div>
            </section>

            {/* Clickable Cards */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Clickable Cards</h2>
                <p className="text-gray-600 mb-6">Add onClick handlers for interactive cards (hover to see effect)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="View Products"
                        value={234}
                        icon={Package}
                        variant="blue"
                        onClick={() => alert('Navigate to products page')}
                    />
                    <StatCard
                        title="View Quotes"
                        value={156}
                        icon={FileText}
                        variant="green"
                        onClick={() => alert('Navigate to quotes page')}
                    />
                    <StatCard
                        title="View Users"
                        value={89}
                        icon={Users}
                        variant="purple"
                        onClick={() => alert('Navigate to users page')}
                    />
                    <StatCard
                        title="View Analytics"
                        value="$245M"
                        icon={TrendingUp}
                        variant="orange"
                        onClick={() => alert('Navigate to analytics page')}
                    />
                </div>
            </section>

            {/* Mixed Styles */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mixed Styles in One Layout</h2>
                <p className="text-gray-600 mb-6">Combine different styles for visual hierarchy</p>
                <div className="space-y-6">
                    {/* Top row - Gradient for main metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Revenue"
                            value="$245M"
                            icon={DollarSign}
                            variant="green"
                            style="gradient"
                            change="+29%"
                        />
                        <StatCard
                            title="Total Orders"
                            value={156}
                            icon={ShoppingCart}
                            variant="blue"
                            style="gradient"
                            change="+9%"
                        />
                        <StatCard
                            title="Active Users"
                            value={89}
                            icon={Users}
                            variant="purple"
                            style="gradient"
                            change="+17%"
                        />
                    </div>

                    {/* Bottom row - Minimal for secondary metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard
                            title="Products"
                            value={234}
                            icon={Package}
                            variant="cyan"
                            style="minimal"
                        />
                        <StatCard
                            title="Categories"
                            value={12}
                            icon={Layers}
                            variant="amber"
                            style="minimal"
                        />
                        <StatCard
                            title="Messages"
                            value={45}
                            icon={MessageSquare}
                            variant="pink"
                            style="minimal"
                        />
                        <StatCard
                            title="Quotes"
                            value={67}
                            icon={FileText}
                            variant="orange"
                            style="minimal"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
