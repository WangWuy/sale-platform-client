'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    X,
    DollarSign,
    Tag
} from 'lucide-react';
import { useProductTemplates } from '@/hooks/useProductTemplates';
import { ProductTemplate } from '@/types/product-template';
import { PRODUCT_TYPE_NAMES } from '@/types/pricing';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './product-templates.module.scss';

export default function ProductTemplatesPage() {
    const {
        templates,
        total,
        totalPages,
        loading,
        error,
        fetchTemplates,
        deleteTemplate
    } = useProductTemplates();

    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [productTypeFilter, setProductTypeFilter] = useState<number | ''>('');
    const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchTemplates({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
            productType: productTypeFilter ? Number(productTypeFilter) : undefined,
            isActive: activeFilter !== '' ? activeFilter : undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, searchQuery, productTypeFilter, activeFilter]);

    const handleDelete = (id: number, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa mẫu sản phẩm',
            message: `Bạn có chắc muốn xóa mẫu "${name}"? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await deleteTemplate(id);
                if (success) {
                    showToast(`Đã xóa mẫu "${name}"`, 'success');
                    fetchTemplates({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa mẫu sản phẩm', 'error');
                }
            }
        });
    };

    const columns: Column<ProductTemplate>[] = [
        {
            key: 'name',
            label: 'Tên mẫu',
            width: '25%',
            render: (template) => (
                <div>
                    <p className="font-semibold text-gray-900">{template.name}</p>
                    {template.description && (
                        <p className="text-sm text-gray-500 truncate">{template.description}</p>
                    )}
                </div>
            )
        },
        {
            key: 'productType',
            label: 'Loại sản phẩm',
            width: '15%',
            render: (template) => (
                <Badge className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 border-violet-200" variant="outline">
                    <Tag className="w-4 h-4" aria-hidden="true" />
                    {PRODUCT_TYPE_NAMES[template.productType]}
                </Badge>
            )
        },
        {
            key: 'basePrice',
            label: 'Giá cơ bản',
            width: '15%',
            render: (template) => (
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    <span className="font-semibold text-gray-900">
                        {parseFloat(template.basePrice).toLocaleString('vi-VN')} đ
                    </span>
                </div>
            )
        },
        {
            key: 'baseSize',
            label: 'Kích thước cơ bản',
            width: '15%',
            render: (template) => (
                <div className="text-gray-600">
                    <p className="font-medium">{template.baseSize}</p>
                    <p className="text-sm text-gray-500">{template.baseSizeValue} units</p>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (template) => (
                <Badge
                    className={`inline-flex items-center gap-1.5 ${template.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                    variant="outline"
                >
                    {template.isActive ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                    {template.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '15%',
            render: (template) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/product-templates/${template.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                            aria-label={`Edit template ${template.name}`}
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(template.id, template.name)}
                        aria-label={`Delete template ${template.name}`}
                    />
                </div>
            )
        }
    ];

    const calculatedTotalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.productTemplatesPage}>
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
                    {/* Product Type Filter */}
                    <select
                        value={productTypeFilter}
                        onChange={(e) => setProductTypeFilter(e.target.value ? Number(e.target.value) : '')}
                        className={styles.filterSelect}
                        aria-label="Filter by product type"
                    >
                        <option value="">Tất cả loại sản phẩm</option>
                        {Object.entries(PRODUCT_TYPE_NAMES).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>

                    {/* Active Status Filter */}
                    <select
                        value={activeFilter !== '' ? (activeFilter ? 'true' : 'false') : ''}
                        onChange={(e) => setActiveFilter(e.target.value === '' ? '' : e.target.value === 'true')}
                        className={styles.filterSelect}
                        aria-label="Filter by status"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Hoạt động</option>
                        <option value="false">Không hoạt động</option>
                    </select>

                    {/* Clear Filters */}
                    {(productTypeFilter !== '' || activeFilter !== '') && (
                        <button
                            onClick={() => {
                                setProductTypeFilter('');
                                setActiveFilter('');
                            }}
                            className={styles.clearFilters}
                            aria-label="Clear all filters"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Action Buttons */}
                    <Link href="/product-templates/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable or Skeleton */}
                {loading && (!templates || templates.length === 0) ? (
                    <TableSkeleton rows={5} columns={6} />
                ) : (
                    <DataTable
                        data={templates || []}
                        columns={columns}
                        loading={loading}
                        emptyMessage={searchQuery ? 'Không tìm thấy mẫu sản phẩm' : 'Chưa có mẫu sản phẩm nào'}

                        searchPlaceholder="Tìm kiếm theo tên..."
                        onSearch={setSearchQuery}
                        defaultPageSize={pageSize}
                    />
                )}

                {/* Pagination */}
                {calculatedTotalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} mẫu
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

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText="Xác nhận"
                cancelText="Hủy"
            />
        </div>
    );
}
