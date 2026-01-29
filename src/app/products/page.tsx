'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Package,
    AlertCircle,
    Tag,
    X
} from 'lucide-react';
import { useProducts, useProductStats } from '@/hooks/useProducts';
import { productService } from '@/services/product.service';
import { Product, ProductStatus, CategoryInfo } from '@/types/product';
import { formatCurrency } from '@/utils/formatters';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import styles from './products.module.scss';

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');

    const {
        products,
        total,
        loading,
        error,
        fetchProducts,
        deleteProduct
    } = useProducts({
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
    });

    const { stats, loading: statsLoading } = useProductStats();

    const handleDelete = async (id: number) => {
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            await deleteProduct(id);
        }
    };



    const getCategoryLabel = (categoryInfo?: CategoryInfo) => {
        return categoryInfo?.name || 'N/A';
    };

    const getStatusColor = (status: ProductStatus) => {
        switch (status) {
            case ProductStatus.APPROVED:
                return 'bg-green-100 text-green-700 border-green-200';
            case ProductStatus.PENDING:
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case ProductStatus.REJECTED:
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: ProductStatus) => {
        switch (status) {
            case ProductStatus.APPROVED:
                return 'Đã duyệt';
            case ProductStatus.PENDING:
                return 'Chờ duyệt';
            case ProductStatus.REJECTED:
                return 'Từ chối';
            default:
                return 'N/A';
        }
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getCategoryLabel(product.categoryInfo).toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !statusFilter || product.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const columns: Column<Product>[] = [
        {
            key: 'product',
            label: 'Sản phẩm',
            width: '35%',
            render: (product) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0].imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">Mã: {product.code}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'category',
            label: 'Danh mục',
            width: '15%',
            render: (product) => (
                <Badge variant="outline" className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 border-purple-200">
                    <Tag className="w-4 h-4" />
                    {getCategoryLabel(product.categoryInfo)}
                </Badge>
            )
        },
        {
            key: 'price',
            label: 'Giá hiện tại',
            width: '15%',
            render: (product) => (
                <div>
                    <p className="font-semibold text-gray-900">{formatCurrency(product.currentPrice)}</p>
                    {product.basePrice !== product.currentPrice && (
                        <p className="text-xs text-gray-500">Gốc: {formatCurrency(product.basePrice)}</p>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (product) => (
                <Badge variant="outline" className={getStatusColor(product.status)}>
                    {getStatusLabel(product.status)}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '20%',
            render: (product) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/products/${product.id}`}>
                        <IconButton
                            icon={Eye}
                            variant="ghost"
                            title="Xem chi tiết"
                        />
                    </Link>
                    <Link href={`/products/${product.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(product.id)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className={styles.productsPage}>
            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle aria-hidden="true" />
                    <p>{error}</p>
                </div>
            )}

            {/* Table Wrapper - Scrollable Area */}
            <div className={styles.tableWrapper}>
                {/* Filters & Actions Bar */}
                <div className={styles.searchFiltersBar}>
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
                        className={styles.filterSelect}
                        aria-label="Filter by status"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value={ProductStatus.APPROVED}>{getStatusLabel(ProductStatus.APPROVED)}</option>
                        <option value={ProductStatus.PENDING}>{getStatusLabel(ProductStatus.PENDING)}</option>
                        <option value={ProductStatus.REJECTED}>{getStatusLabel(ProductStatus.REJECTED)}</option>
                    </select>

                    {/* Clear Filters Button */}
                    {statusFilter && (
                        <button
                            onClick={() => setStatusFilter('')}
                            className={styles.clearFilters}
                            aria-label="Clear filters"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Create Button */}
                    <Link href="/products/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable */}
                <DataTable
                    data={filteredProducts}
                    columns={columns}
                    loading={loading}
                    emptyMessage={searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                    searchPlaceholder="Tìm kiếm sản phẩm theo tên, SKU, danh mục..."
                    onSearch={setSearchQuery}
                    defaultPageSize={20}
                />
            </div>
        </div>
    );
}
