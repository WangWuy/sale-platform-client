'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Truck,
    AlertCircle,
    CheckCircle,
    XCircle,
    X,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Supplier } from '@/types/supplier';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './suppliers.module.scss';

export default function SuppliersPage() {
    const {
        suppliers,
        total,
        totalPages,
        loading,
        error,
        fetchSuppliers,
        deleteSupplier
    } = useSuppliers();

    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
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
        fetchSuppliers({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, searchQuery]);

    const handleDelete = (id: number, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa nhà cung cấp',
            message: `Bạn có chắc muốn xóa nhà cung cấp "${name}"? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await deleteSupplier(id);
                if (success) {
                    showToast(`Đã xóa nhà cung cấp "${name}"`, 'success');
                    fetchSuppliers({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa nhà cung cấp', 'error');
                }
            }
        });
    };

    const columns: Column<Supplier>[] = [
        {
            key: 'name',
            label: 'Nhà cung cấp',
            width: '25%',
            render: (supplier) => (
                <div>
                    <p className="font-semibold text-gray-900">{supplier.name}</p>
                    {supplier.contact && (
                        <p className="text-sm text-gray-500">{supplier.contact}</p>
                    )}
                </div>
            )
        },
        {
            key: 'email',
            label: 'Email',
            width: '20%',
            render: (supplier) => (
                <div className="flex items-center gap-2 text-gray-600">
                    {supplier.email ? (
                        <>
                            <Mail className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            <span>{supplier.email}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Chưa có</span>
                    )}
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Điện thoại',
            width: '15%',
            render: (supplier) => (
                <div className="flex items-center gap-2 text-gray-600">
                    {supplier.phone ? (
                        <>
                            <Phone className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            <span>{supplier.phone}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Chưa có</span>
                    )}
                </div>
            )
        },
        {
            key: 'address',
            label: 'Địa chỉ',
            width: '20%',
            render: (supplier) => (
                <div className="flex items-center gap-2 text-gray-600">
                    {supplier.address ? (
                        <>
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate" title={supplier.address}>{supplier.address}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Chưa có</span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '10%',
            render: (supplier) => (
                <Badge
                    className={`inline-flex items-center gap-1.5 ${!supplier.isDelete ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                    variant="outline"
                >
                    {!supplier.isDelete ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                    {!supplier.isDelete ? 'Hoạt động' : 'Đã xóa'}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '10%',
            render: (supplier) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/suppliers/${supplier.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                            aria-label={`Edit supplier ${supplier.name}`}
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        aria-label={`Delete supplier ${supplier.name}`}
                    />
                </div>
            )
        }
    ];

    const calculatedTotalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.suppliersPage}>
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
                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Action Buttons */}
                    <Link href="/suppliers/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable or Skeleton */}
                {loading && (!suppliers || suppliers.length === 0) ? (
                    <TableSkeleton rows={5} columns={6} />
                ) : (
                    <DataTable
                        data={suppliers || []}
                        columns={columns}
                        loading={loading}
                        emptyMessage={searchQuery ? 'Không tìm thấy nhà cung cấp' : 'Chưa có nhà cung cấp nào'}

                        searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
                        onSearch={setSearchQuery}
                        defaultPageSize={pageSize}
                    />
                )}

                {/* Pagination */}
                {calculatedTotalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} nhà cung cấp
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
