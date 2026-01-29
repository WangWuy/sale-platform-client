'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    Layers,
    Package,
    Ruler,
    Plus,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    ChevronLeft,
    AlertCircle,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
    usePricingRules,
    useMaterialSurcharges,
    useQuantityTiersQuery,
    useSizeThresholds,
    useDeletePricingRule,
    useTogglePricingRule,
    useDeleteMaterialSurcharge,
    useToggleMaterialSurcharge,
    useDeleteQuantityTier,
    useToggleQuantityTier,
    useDeleteSizeThreshold,
    useToggleSizeThreshold,
} from '@/hooks/usePricing';
import {
    getPricingConditionLabel,
    getProductTypeLabelPricing,
    getSurchargeScopeLabel,
    getPriceLevelLabel,
    getDimensionTypeLabel,
    getThresholdActionLabel,
} from '@/services/pricing.service';
import type {
    PricingRule,
    MaterialSurcharge,
    QuantityTier,
    SizeThreshold,
} from '@/services/pricing.service';
import styles from './page.module.scss';

type TabType = 'rules' | 'surcharges' | 'tiers' | 'thresholds';

export default function PricingSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('rules');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = [
        { id: 'rules' as TabType, label: 'Quy tắc giá', icon: DollarSign },
        { id: 'surcharges' as TabType, label: 'Phụ phí vật liệu', icon: Layers },
        { id: 'tiers' as TabType, label: 'Bậc số lượng', icon: Package },
        { id: 'thresholds' as TabType, label: 'Ngưỡng kích thước', icon: Ruler },
    ];

    return (
        <div className={styles.pricingPage}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/settings" className={styles.backLink}>
                        <ChevronLeft size={20} />
                        <span>Cài đặt</span>
                    </Link>
                    <div className={styles.titleSection}>
                        <DollarSign className={styles.titleIcon} size={28} />
                        <div>
                            <h1>Cấu hình định giá</h1>
                            <p>Quản lý các quy tắc, phụ phí và ngưỡng định giá sản phẩm</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Table Wrapper */}
            <div className={styles.tableWrapper}>
                {/* Create Button */}
                <div className={styles.searchFiltersBar}>
                    <Link
                        href={`/settings/pricing/${activeTab}/create`}
                        className={styles.createButton}
                    >
                        <Plus className="w-5 h-5" />
                        Thêm mới
                    </Link>
                </div>

                {/* Content */}
                {activeTab === 'rules' && <PricingRulesTab searchQuery={searchQuery} />}
                {activeTab === 'surcharges' && <MaterialSurchargesTab searchQuery={searchQuery} />}
                {activeTab === 'tiers' && <QuantityTiersTab searchQuery={searchQuery} />}
                {activeTab === 'thresholds' && <SizeThresholdsTab searchQuery={searchQuery} />}
            </div>
        </div>
    );
}

// =====================================================
// PRICING RULES TAB
// =====================================================

function PricingRulesTab({ searchQuery }: { searchQuery: string }) {
    const { data: rules = [], isLoading, error } = usePricingRules();
    const toggleMutation = useTogglePricingRule();
    const deleteMutation = useDeletePricingRule();

    const handleToggle = (id: number) => {
        toggleMutation.mutate(id);
    };

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa quy tắc này?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns: Column<PricingRule>[] = [
        {
            key: 'info',
            label: 'Thông tin',
            width: '25%',
            render: (rule) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{getPricingConditionLabel(rule.condition)}</p>
                        <p className="text-sm text-gray-500">Ưu tiên: {rule.priority}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'productType',
            label: 'Loại SP',
            width: '15%',
            render: (rule) => (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {getProductTypeLabelPricing(rule.productType)}
                </Badge>
            )
        },
        {
            key: 'details',
            label: 'Chi tiết',
            width: '20%',
            render: (rule) => (
                <div>
                    <p className="text-sm text-gray-600">Đơn vị tăng: {rule.incrementUnit} cm</p>
                    <p className="text-sm text-gray-600">Phụ phí: {rule.surchargeAmount.toLocaleString()}đ</p>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (rule) => (
                <button
                    onClick={() => handleToggle(rule.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${rule.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {rule.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {rule.isActive ? 'Hoạt động' : 'Tắt'}
                </button>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '15%',
            render: (rule) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/settings/pricing/rules/${rule.id}/edit`}>
                        <IconButton icon={Edit} variant="primary" title="Chỉnh sửa" />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(rule.id)}
                    />
                </div>
            )
        }
    ];

    return (
        <>
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle />
                    <p>{error.message || 'Không thể tải dữ liệu'}</p>
                </div>
            )}
            <DataTable
                data={rules}
                columns={columns}
                loading={isLoading}
                emptyMessage="Chưa có quy tắc giá nào"

                searchPlaceholder="Tìm kiếm quy tắc..."
                onSearch={() => { }}
            />
        </>
    );
}

// =====================================================
// MATERIAL SURCHARGES TAB
// =====================================================

function MaterialSurchargesTab({ searchQuery }: { searchQuery: string }) {
    const { data: surcharges = [], isLoading, error } = useMaterialSurcharges();
    const toggleMutation = useToggleMaterialSurcharge();
    const deleteMutation = useDeleteMaterialSurcharge();

    const handleToggle = (id: number) => {
        toggleMutation.mutate(id);
    };

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa phụ phí này?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns: Column<MaterialSurcharge>[] = [
        {
            key: 'info',
            label: 'Thông tin',
            width: '30%',
            render: (surcharge) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            VL {surcharge.sourceMaterialId} → VL {surcharge.targetMaterialId}
                        </p>
                        <p className="text-sm text-gray-500">{getSurchargeScopeLabel(surcharge.scope)}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'productType',
            label: 'Loại SP',
            width: '15%',
            render: (surcharge) => (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {getProductTypeLabelPricing(surcharge.productType)}
                </Badge>
            )
        },
        {
            key: 'amount',
            label: 'Phụ phí',
            width: '15%',
            render: (surcharge) => (
                <p className="font-semibold text-gray-900">{surcharge.surchargeAmount.toLocaleString()}đ</p>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (surcharge) => (
                <button
                    onClick={() => handleToggle(surcharge.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${surcharge.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {surcharge.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {surcharge.isActive ? 'Hoạt động' : 'Tắt'}
                </button>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '15%',
            render: (surcharge) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/settings/pricing/surcharges/${surcharge.id}/edit`}>
                        <IconButton icon={Edit} variant="primary" title="Chỉnh sửa" />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(surcharge.id)}
                    />
                </div>
            )
        }
    ];

    return (
        <>
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle />
                    <p>{error.message || 'Không thể tải dữ liệu'}</p>
                </div>
            )}
            <DataTable
                data={surcharges}
                columns={columns}
                loading={isLoading}
                emptyMessage="Chưa có phụ phí vật liệu nào"

                searchPlaceholder="Tìm kiếm phụ phí..."
                onSearch={() => { }}
            />
        </>
    );
}

// =====================================================
// QUANTITY TIERS TAB
// =====================================================

function QuantityTiersTab({ searchQuery }: { searchQuery: string }) {
    const { data: tiersData, isLoading, error } = useQuantityTiersQuery();
    const toggleMutation = useToggleQuantityTier();
    const deleteMutation = useDeleteQuantityTier();

    // Handle both array and object with tiers property
    const tiers: QuantityTier[] = Array.isArray(tiersData) ? tiersData : (tiersData as any)?.tiers || [];

    const handleToggle = (id: number) => {
        toggleMutation.mutate(id);
    };

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa bậc số lượng này?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns: Column<QuantityTier>[] = [
        {
            key: 'info',
            label: 'Thông tin',
            width: '25%',
            render: (tier) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{getPriceLevelLabel(tier.priceLevel)}</p>
                        <p className="text-sm text-gray-500">
                            {tier.minQuantity} - {tier.maxQuantity || '∞'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'productType',
            label: 'Loại SP',
            width: '15%',
            render: (tier) => (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {getProductTypeLabelPricing(tier.productType)}
                </Badge>
            )
        },
        {
            key: 'discount',
            label: '% Giảm giá',
            width: '15%',
            render: (tier) => (
                <p className="font-semibold text-gray-900">{tier.discountPercent}%</p>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (tier) => (
                <button
                    onClick={() => handleToggle(tier.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${tier.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {tier.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {tier.isActive ? 'Hoạt động' : 'Tắt'}
                </button>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '15%',
            render: (tier) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/settings/pricing/tiers/${tier.id}/edit`}>
                        <IconButton icon={Edit} variant="primary" title="Chỉnh sửa" />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(tier.id)}
                    />
                </div>
            )
        }
    ];

    return (
        <>
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle />
                    <p>{error.message || 'Không thể tải dữ liệu'}</p>
                </div>
            )}
            <DataTable
                data={tiers}
                columns={columns}
                loading={isLoading}
                emptyMessage="Chưa có bậc số lượng nào"

                searchPlaceholder="Tìm kiếm bậc số lượng..."
                onSearch={() => { }}
            />
        </>
    );
}

// =====================================================
// SIZE THRESHOLDS TAB
// =====================================================

function SizeThresholdsTab({ searchQuery }: { searchQuery: string }) {
    const { data: thresholds = [], isLoading, error } = useSizeThresholds();
    const toggleMutation = useToggleSizeThreshold();
    const deleteMutation = useDeleteSizeThreshold();

    const handleToggle = (id: number) => {
        toggleMutation.mutate(id);
    };

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa ngưỡng kích thước này?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns: Column<SizeThreshold>[] = [
        {
            key: 'info',
            label: 'Thông tin',
            width: '25%',
            render: (threshold) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{getDimensionTypeLabel(threshold.dimensionType)}</p>
                        <p className="text-sm text-gray-500">Ngưỡng: {threshold.thresholdValue} cm</p>
                    </div>
                </div>
            )
        },
        {
            key: 'productType',
            label: 'Loại SP',
            width: '12%',
            render: (threshold) => (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {getProductTypeLabelPricing(threshold.productType)}
                </Badge>
            )
        },
        {
            key: 'action',
            label: 'Hành động',
            width: '15%',
            render: (threshold) => (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    {getThresholdActionLabel(threshold.action)}
                </Badge>
            )
        },
        {
            key: 'surcharge',
            label: 'Phụ phí',
            width: '12%',
            render: (threshold) => (
                <p className="text-sm text-gray-900">
                    {threshold.surchargeAmount ? `${threshold.surchargeAmount.toLocaleString()}đ` : '-'}
                </p>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '12%',
            render: (threshold) => (
                <button
                    onClick={() => handleToggle(threshold.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${threshold.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {threshold.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {threshold.isActive ? 'Hoạt động' : 'Tắt'}
                </button>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '12%',
            render: (threshold) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/settings/pricing/thresholds/${threshold.id}/edit`}>
                        <IconButton icon={Edit} variant="primary" title="Chỉnh sửa" />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(threshold.id)}
                    />
                </div>
            )
        }
    ];

    return (
        <>
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle />
                    <p>{error.message || 'Không thể tải dữ liệu'}</p>
                </div>
            )}
            <DataTable
                data={thresholds}
                columns={columns}
                loading={isLoading}
                emptyMessage="Chưa có ngưỡng kích thước nào"

                searchPlaceholder="Tìm kiếm ngưỡng..."
                onSearch={() => { }}
            />
        </>
    );
}
