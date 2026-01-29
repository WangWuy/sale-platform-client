'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Tag,
    AlertCircle,
    CheckCircle,
    XCircle,
    X,
    DollarSign,
    Percent,
    Info
} from 'lucide-react';
import { useDesignTags } from '@/hooks/useDesignTags';
import { DesignTag, TAG_BEHAVIOR_NAMES, TagBehavior } from '@/types/design-tag';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './design-tags.module.scss';

export default function DesignTagsPage() {
    const {
        tags,
        total,
        totalPages,
        loading,
        error,
        fetchTags,
        deleteTag
    } = useDesignTags();

    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [behaviorFilter, setBehaviorFilter] = useState<TagBehavior | ''>('');
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
        fetchTags({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
            behavior: behaviorFilter ? Number(behaviorFilter) as TagBehavior : undefined,
            isActive: activeFilter !== '' ? activeFilter : undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, searchQuery, behaviorFilter, activeFilter]);

    const handleDelete = (id: number, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa tag',
            message: `Bạn có chắc muốn xóa tag "${name}"? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await deleteTag(id);
                if (success) {
                    showToast(`Đã xóa tag "${name}"`, 'success');
                    fetchTags({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa tag', 'error');
                }
            }
        });
    };

    const getBehaviorBadge = (behavior: TagBehavior) => {
        switch (behavior) {
            case TagBehavior.AUTO_SURCHARGE:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border-green-200" variant="outline">
                        <DollarSign className="w-4 h-4" aria-hidden="true" />
                        {TAG_BEHAVIOR_NAMES[behavior]}
                    </Badge>
                );
            case TagBehavior.MANUAL_QUOTE:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border-amber-200" variant="outline">
                        <Edit className="w-4 h-4" aria-hidden="true" />
                        {TAG_BEHAVIOR_NAMES[behavior]}
                    </Badge>
                );
            case TagBehavior.INFO_ONLY:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                        <Info className="w-4 h-4" aria-hidden="true" />
                        {TAG_BEHAVIOR_NAMES[behavior]}
                    </Badge>
                );
        }
    };

    const columns: Column<DesignTag>[] = [
        {
            key: 'code',
            label: 'Mã tag',
            width: '12%',
            render: (tag) => (
                <span className="font-mono font-semibold text-pink-600">{tag.code}</span>
            )
        },
        {
            key: 'name',
            label: 'Tên tag',
            width: '20%',
            render: (tag) => (
                <div>
                    <p className="font-semibold text-gray-900">{tag.name}</p>
                    {tag.description && (
                        <p className="text-sm text-gray-500 truncate">{tag.description}</p>
                    )}
                </div>
            )
        },
        {
            key: 'behavior',
            label: 'Hành vi',
            width: '18%',
            render: (tag) => getBehaviorBadge(tag.behavior)
        },
        {
            key: 'surcharge',
            label: 'Phụ thu',
            width: '18%',
            render: (tag) => {
                if (tag.behavior !== TagBehavior.AUTO_SURCHARGE) {
                    return <span className="text-gray-400">N/A</span>;
                }
                return (
                    <div className="space-y-1">
                        {tag.surchargeAmount && (
                            <div className="flex items-center gap-1 text-gray-700">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span>{parseFloat(tag.surchargeAmount).toLocaleString('vi-VN')} đ</span>
                            </div>
                        )}
                        {tag.surchargePercent && (
                            <div className="flex items-center gap-1 text-gray-700">
                                <Percent className="w-4 h-4 text-gray-400" />
                                <span>{parseFloat(tag.surchargePercent)}%</span>
                            </div>
                        )}
                        {!tag.surchargeAmount && !tag.surchargePercent && (
                            <span className="text-gray-400">Chưa cấu hình</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '12%',
            render: (tag) => (
                <Badge
                    className={`inline-flex items-center gap-1.5 ${tag.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                    variant="outline"
                >
                    {tag.isActive ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                    {tag.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '10%',
            render: (tag) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/design-tags/${tag.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                            aria-label={`Edit tag ${tag.name}`}
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(tag.id, tag.name)}
                        aria-label={`Delete tag ${tag.name}`}
                    />
                </div>
            )
        }
    ];

    const calculatedTotalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.designTagsPage}>
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
                    {/* Behavior Filter */}
                    <select
                        value={behaviorFilter}
                        onChange={(e) => setBehaviorFilter(e.target.value ? Number(e.target.value) as TagBehavior : '')}
                        className={styles.filterSelect}
                        aria-label="Filter by behavior"
                    >
                        <option value="">Tất cả hành vi</option>
                        {Object.entries(TAG_BEHAVIOR_NAMES).map(([key, value]) => (
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
                    {(behaviorFilter !== '' || activeFilter !== '') && (
                        <button
                            onClick={() => {
                                setBehaviorFilter('');
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
                    <Link href="/design-tags/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable or Skeleton */}
                {loading && (!tags || tags.length === 0) ? (
                    <TableSkeleton rows={5} columns={6} />
                ) : (
                    <DataTable
                        data={tags || []}
                        columns={columns}
                        loading={loading}
                        emptyMessage={searchQuery ? 'Không tìm thấy tag' : 'Chưa có tag nào'}

                        searchPlaceholder="Tìm kiếm theo mã, tên tag..."
                        onSearch={setSearchQuery}
                        defaultPageSize={pageSize}
                    />
                )}

                {/* Pagination */}
                {calculatedTotalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} tags
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
