'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    AlertCircle,
    Loader2,
    User as UserIcon,
    Mail,
    Phone,
    Shield,
    Calendar,
    Activity
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User, UserRole, UserStatus, UserRoleLabels, UserStatusLabels } from '@/types/user';
import userService from '@/services/user.service';
import styles from './detail.module.scss';

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = Number(params.id);
    const { deleteUser } = useUsers();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await userService.getUserById(userId);
                if (userData) {
                    setUser(userData);
                } else {
                    setError('Không tìm thấy người dùng');
                }
            } catch (err) {
                setError('Không thể tải thông tin người dùng');
                console.error('Fetch user error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

        setIsDeleting(true);
        try {
            await deleteUser(userId);
            router.push('/users');
        } catch (err) {
            setError('Không thể xóa người dùng');
        } finally {
            setIsDeleting(false);
        }
    };

    const getRoleBadgeClass = (role: UserRole) => {
        const classes: Record<UserRole, string> = {
            [UserRole.ADMIN]: 'badgeRed',
            [UserRole.MANAGER]: 'badgeBlue',
            [UserRole.SALES]: 'badgeGreen'
        };
        return classes[role] || 'badgeGray';
    };

    const getStatusBadgeClass = (status: UserStatus) => {
        const classes: Record<UserStatus, string> = {
            [UserStatus.ACTIVE]: 'badgeGreen',
            [UserStatus.SUSPENDED]: 'badgeRed'
        };
        return classes[status] || 'badgeGray';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className={styles.loadingText}>Đang tải...</span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className={styles.page}>
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error || 'Không tìm thấy người dùng'}</p>
                </div>
                <Link href="/users">
                    <button className={styles.backLink}>
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <Link href="/users">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerBadge}>
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={styles.title}>{user.fullName || user.email}</h1>
                            <p className={styles.subtitle}>Chi tiết thông tin người dùng</p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Link href={`/users/${userId}/edit`}>
                        <button className={styles.buttonSecondary}>
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={styles.buttonDanger}
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Account Info */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Thông tin tài khoản</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Mail className="w-4 h-4" />
                                Email
                            </div>
                            <div className={styles.infoValue}>
                                {user.email}
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Activity className="w-4 h-4" />
                                Trạng thái
                            </div>
                            <div className={styles.infoValue}>
                                <span className={`${styles.badge} ${styles[getStatusBadgeClass(user.status)]}`}>
                                    {UserStatusLabels[user.status]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Info */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Thông tin cá nhân</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <UserIcon className="w-4 h-4" />
                                Họ và tên
                            </div>
                            <div className={styles.infoValue}>
                                {user.fullName || 'Chưa cập nhật'}
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Phone className="w-4 h-4" />
                                Số điện thoại
                            </div>
                            <div className={styles.infoValue}>
                                {user.phone || 'Chưa cập nhật'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role & Permissions */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Phân quyền</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Shield className="w-4 h-4" />
                                Vai trò
                            </div>
                            <div className={styles.infoValue}>
                                <span className={`${styles.badge} ${styles[getRoleBadgeClass(user.role)]}`}>
                                    {UserRoleLabels[user.role]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Thông tin hệ thống</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Calendar className="w-4 h-4" />
                                Ngày tạo
                            </div>
                            <div className={styles.infoValue}>
                                {new Date(user.createdAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Calendar className="w-4 h-4" />
                                Cập nhật lần cuối
                            </div>
                            <div className={styles.infoValue}>
                                {new Date(user.updatedAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
