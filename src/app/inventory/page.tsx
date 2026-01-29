'use client';

import { useState, useEffect } from 'react';
import { Package, AlertCircle, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Inventory, getStockStatus, StockStatus } from '@/types/inventory';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/Toast';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './inventory.module.scss';

export default function InventoryPage() {
    const {
        inventoryList,
        total,
        totalPages,
        loading,
        error,
        fetchInventory,
        adjustStock,
    } = useInventory();

    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

    useEffect(() => {
        fetchInventory({
            page: currentPage,
            limit: pageSize,
            lowStock: stockFilter === 'low' ? true : undefined,
            outOfStock: stockFilter === 'out' ? true : undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, stockFilter]);

    const getStockBadge = (status: StockStatus) => {
        switch (status) {
            case 'out_of_stock':
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 border-red-200" variant="outline">
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        Hết hàng
                    </Badge>
                );
            case 'low_stock':
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border-amber-200" variant="outline">
                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                        Sắp hết
                    </Badge>
                );
            case 'normal':
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border-green-200" variant="outline">
                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                        Bình thường
                    </Badge>
                );
            case 'over_stock':
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                        <Info className="w-4 h-4" aria-hidden="true" />
                        Dư thừa
                    </Badge>
                );
        }
    };

    const getStockLevelClass = (status: StockStatus): string => {
        switch (status) {
            case 'out_of_stock':
                return styles.outOfStock;
            case 'low_stock':
                return styles.lowStock;
            case 'normal':
                return styles.normal;
            case 'over_stock':
                return styles.overStock;
        }
    };

    const calculateStockPercentage = (item: Inventory): number => {
        if (!item.maxStockLevel) return 50;
        return Math.min(100, (item.quantityAvailable / item.maxStockLevel) * 100);
    };

    const columns: Column<Inventory>[] = [
        {
            key: 'productId',
            label: 'Mã sản phẩm',
            width: '10%',
            render: (item) => (
                <span className="font-mono text-gray-700">#{item.productId}</span>
            )
        },
        {
            key: 'quantity',
            label: 'Số lượng',
            width: '20%',
            render: (item) => {
                const status = getStockStatus(item);
                const percentage = calculateStockPercentage(item);
                return (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">{item.quantityAvailable}</span>
                            <span className="text-sm text-gray-500">
                                Min: {item.minStockLevel}
                                {item.maxStockLevel && ` / Max: ${item.maxStockLevel}`}
                            </span>
                        </div>
                        <div className={styles.stockLevelBar}>
                            <div
                                className={`${styles.stockLevelFill} ${getStockLevelClass(status)}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (item) => {
                const status = getStockStatus(item);
                return getStockBadge(status);
            }
        },
        {
            key: 'location',
            label: 'Vị trí',
            width: '15%',
            render: (item) => (
                <span className="text-gray-600">
                    {item.location || <span className="text-gray-400">Chưa có</span>}
                </span>
            )
        },
        {
            key: 'lastUpdated',
            label: 'Cập nhật lần cuối',
            width: '20%',
            render: (item) => (
                <span className="text-gray-600">
                    {new Date(item.lastUpdated).toLocaleString('vi-VN')}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '20%',
            render: (item) => {
                const handleAdjust = async (quantity: number) => {
                    try {
                        const success = await adjustStock({
                            productId: item.productId,
                            delta: quantity,
                            reason: quantity > 0 ? 'Nhập kho' : 'Xuất kho'
                        });
                        if (success) {
                            showToast(`Đã ${quantity > 0 ? 'thêm' : 'trừ'} ${Math.abs(quantity)} sản phẩm`, 'success');
                            fetchInventory({
                                page: currentPage,
                                limit: pageSize,
                                lowStock: stockFilter === 'low' ? true : undefined,
                                outOfStock: stockFilter === 'out' ? true : undefined,
                            });
                        }
                    } catch (err) {
                        showToast('Điều chỉnh tồn kho thất bại', 'error');
                    }
                };

                return (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleAdjust(10)}
                            className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Thêm 10"
                        >
                            +10
                        </button>
                        <button
                            onClick={() => handleAdjust(5)}
                            className="px-2 py-1 text-xs font-medium bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            title="Thêm 5"
                        >
                            +5
                        </button>
                        <button
                            onClick={() => handleAdjust(-5)}
                            className="px-2 py-1 text-xs font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Trừ 5"
                        >
                            -5
                        </button>
                        <button
                            onClick={() => handleAdjust(-10)}
                            className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Trừ 10"
                        >
                            -10
                        </button>
                    </div>
                );
            }
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            width: '20%',
            render: (item) => (
                <span className="text-gray-600">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                </span>
            )
        }
    ];

    const calculatedTotalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.inventoryPage}>
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
                    {/* Stock Status Filter */}
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
                        className={styles.filterSelect}
                        aria-label="Filter by stock status"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="low">Sắp hết hàng</option>
                        <option value="out">Hết hàng</option>
                    </select>

                    {/* Clear Filters */}
                    {stockFilter !== 'all' && (
                        <button
                            onClick={() => setStockFilter('all')}
                            className={styles.clearFilters}
                            aria-label="Clear filters"
                        >
                            Xóa bộ lọc
                        </button>
                    )}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />
                </div>

                {/* DataTable or Skeleton */}
                {loading && (!inventoryList || inventoryList.length === 0) ? (
                    <TableSkeleton rows={5} columns={6} />
                ) : (
                    <DataTable
                        data={inventoryList || []}
                        columns={columns}
                        loading={loading}
                        emptyMessage={searchQuery ? 'Không tìm thấy tồn kho' : 'Chưa có tồn kho nào'}

                        searchPlaceholder="Tìm kiếm theo mã sản phẩm, vị trí..."
                        onSearch={setSearchQuery}
                        defaultPageSize={pageSize}
                    />
                )}

                {/* Pagination */}
                {calculatedTotalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} tồn kho
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={styles.paginationButton}
                                aria-label="Previous page"
                            >
                                Trước
                            </button>
                            {Array.from({ length: Math.min(5, calculatedTotalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`${styles.paginationButton} ${currentPage === pageNum ? styles.paginationButtonActive : ''
                                            }`}
                                        aria-label={`Go to page ${pageNum}`}
                                        aria-current={currentPage === pageNum ? 'page' : undefined}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(calculatedTotalPages, p + 1))}
                                disabled={currentPage === calculatedTotalPages}
                                className={styles.paginationButton}
                                aria-label="Next page"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
