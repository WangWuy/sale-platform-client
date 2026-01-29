'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Users as UsersIcon,
    AlertCircle,
    Shield,
    CheckCircle,
    XCircle,
    Download,
    Upload,
    Filter,
    X
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User, UserRole, UserStatus, UserRoleLabels, UserStatusLabels } from '@/types/user';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './users.module.scss';


export default function UsersPage() {
    const {
        users,
        total,
        statistics,
        loading,
        error,
        fetchUsers,
        getStatistics,
        deleteUser,
        bulkDelete,
        bulkUpdateStatus,
        exportUsers,
        importUsers
    } = useUsers();

    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
    const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetchUsers({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
            role: roleFilter || undefined,
            status: statusFilter || undefined
        });
        getStatistics();
    }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter, fetchUsers, getStatistics]);

    const handleDelete = (id: number, email: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa người dùng',
            message: `Bạn có chắc muốn xóa người dùng "${email}"? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await deleteUser(id);
                if (success) {
                    showToast(`Đã xóa người dùng "${email}"`, 'success');
                    fetchUsers({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa người dùng', 'error');
                }
            }
        });
    };

    const handleBulkDelete = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa nhiều người dùng',
            message: `Bạn có chắc muốn xóa ${selectedIds.length} người dùng đã chọn? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await bulkDelete(selectedIds);
                if (success) {
                    showToast(`Đã xóa ${selectedIds.length} người dùng`, 'success');
                    setSelectedIds([]);
                    fetchUsers({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa người dùng', 'error');
                }
            }
        });
    };

    const handleBulkStatusChange = (status: UserStatus) => {
        const statusLabel = status === UserStatus.ACTIVE ? 'kích hoạt' : 'tạm khóa';
        setConfirmModal({
            isOpen: true,
            title: `${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)} người dùng`,
            message: `Bạn có chắc muốn ${statusLabel} ${selectedIds.length} người dùng đã chọn?`,
            variant: status === UserStatus.ACTIVE ? 'info' : 'warning',
            onConfirm: async () => {
                const success = await bulkUpdateStatus(selectedIds, status);
                if (success) {
                    showToast(`Đã ${statusLabel} ${selectedIds.length} người dùng`, 'success');
                    setSelectedIds([]);
                } else {
                    showToast(`Không thể ${statusLabel} người dùng`, 'error');
                }
            }
        });
    };

    const handleExport = async () => {
        try {
            await exportUsers({
                search: searchQuery,
                role: roleFilter || undefined,
                status: statusFilter || undefined
            });
            showToast('Đã xuất file Excel thành công', 'success');
        } catch (err) {
            showToast('Không thể xuất file Excel', 'error');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await importUsers(file);
                showToast('Import thành công!', 'success');
                fetchUsers({ page: currentPage, limit: pageSize });
            } catch (err) {
                showToast('Import thất bại', 'error');
            }
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(users.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(uid => uid !== id));
        }
    };

    const columns: Column<User>[] = [
        {
            key: 'select',
            label: (
                <input
                    type="checkbox"
                    checked={selectedIds.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                    aria-label="Select all users"
                />
            ),
            width: '5%',
            render: (user) => (
                <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                    aria-label={`Select user ${user.email}`}
                />
            )
        },
        {
            key: 'user',
            label: 'Người dùng',
            width: '25%',
            render: (user) => (
                <div>
                    <p className="font-semibold text-gray-900">{user.fullName || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                </div>
            )
        },
        {
            key: 'role',
            label: 'Vai trò',
            width: '15%',
            render: (user) => (
                <Badge className={`inline-flex items-center gap-1.5 ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                    }`} variant="outline">
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    {UserRoleLabels[user.role]}
                </Badge>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (user) => (
                <Badge
                    className={`inline-flex items-center gap-1.5 ${user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                    variant="outline"
                >
                    {user.status === UserStatus.ACTIVE ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                    {UserStatusLabels[user.status]}
                </Badge>
            )
        },
        {
            key: 'lastLogin',
            label: 'Đăng nhập lần cuối',
            width: '20%',
            render: (user) => (
                <span className="text-gray-600">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '10%',
            render: (user) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/users/${user.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                            aria-label={`Edit user ${user.email}`}
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(user.id, user.email)}
                        aria-label={`Delete user ${user.email}`}
                    />
                </div>
            )
        }
    ];

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.usersPage}>
            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && (
                <div className={styles.bulkToolbar} role="region" aria-label="Bulk actions">
                    <span className={styles.bulkCount}>{selectedIds.length} người dùng đã chọn</span>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleBulkStatusChange(UserStatus.ACTIVE)}
                            className={styles.bulkActionActive}
                            aria-label={`Activate ${selectedIds.length} selected users`}
                        >
                            Kích hoạt
                        </button>
                        <button
                            onClick={() => handleBulkStatusChange(UserStatus.SUSPENDED)}
                            className={styles.bulkActionSuspend}
                            aria-label={`Suspend ${selectedIds.length} selected users`}
                        >
                            Tạm khóa
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className={styles.bulkActionDelete}
                            aria-label={`Delete ${selectedIds.length} selected users`}
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className={styles.bulkActionCancel}
                            aria-label="Cancel selection"
                        >
                            Hủy chọn
                        </button>
                    </div>
                </div>
            )}

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
                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                        className={styles.filterSelect}
                        aria-label="Filter by role"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value={UserRole.ADMIN}>{UserRoleLabels[UserRole.ADMIN]}</option>
                        <option value={UserRole.MANAGER}>{UserRoleLabels[UserRole.MANAGER]}</option>
                        <option value={UserRole.SALES}>{UserRoleLabels[UserRole.SALES]}</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
                        className={styles.filterSelect}
                        aria-label="Filter by status"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value={UserStatus.ACTIVE}>{UserStatusLabels[UserStatus.ACTIVE]}</option>
                        <option value={UserStatus.SUSPENDED}>{UserStatusLabels[UserStatus.SUSPENDED]}</option>
                    </select>

                    {/* Clear Filters Button */}
                    {(roleFilter || statusFilter) && (
                        <button
                            onClick={() => {
                                setRoleFilter('');
                                setStatusFilter('');
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
                    <button
                        onClick={handleExport}
                        className={styles.secondaryButton}
                        aria-label="Export users to Excel"
                    >
                        <Download className="w-5 h-5" aria-hidden="true" />
                        Xuất Excel
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.secondaryButton}
                        aria-label="Import users from Excel"
                    >
                        <Upload className="w-5 h-5" aria-hidden="true" />
                        Nhập Excel
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                        aria-label="File upload input"
                    />
                    <Link href="/users/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable or Skeleton */}
                {loading && users.length === 0 ? (
                    <TableSkeleton rows={5} columns={6} />
                ) : (
                    <DataTable
                        data={users}
                        columns={columns}
                        loading={loading}
                        emptyMessage={searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}

                        searchPlaceholder="Tìm kiếm theo email, tên, số điện thoại..."
                        onSearch={setSearchQuery}
                        defaultPageSize={pageSize}
                    />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} người dùng
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
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
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
