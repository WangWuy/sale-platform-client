'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2,
    User as UserIcon
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User, UserRole, UserStatus, UserRoleLabels, UserStatusLabels, UpdateUserRequest } from '@/types/user';
import userService from '@/services/user.service';
import styles from './edit.module.scss';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = Number(params.id);
    const { updateUser } = useUsers();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<UpdateUserRequest>({
        email: '',
        fullName: '',
        phone: '',
        role: UserRole.SALES,
        status: UserStatus.ACTIVE
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await userService.getUserById(userId);
                if (userData) {
                    setUser(userData);
                    setFormData({
                        email: userData.email,
                        fullName: userData.fullName || '',
                        phone: userData.phone || '',
                        role: userData.role,
                        status: userData.status
                    });
                } else {
                    setFormError('Không tìm thấy người dùng');
                }
            } catch (err) {
                setFormError('Không thể tải thông tin người dùng');
                console.error('Fetch user error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Validation
        if (!formData.email?.trim()) {
            setFormError('Email không được để trống');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await updateUser(userId, formData);
            if (result) {
                router.push('/users');
            } else {
                setFormError('Không thể cập nhật người dùng');
            }
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className={styles.loadingText}>Đang tải...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>Không tìm thấy người dùng</p>
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
                            <h1 className={styles.title}>Chỉnh sửa người dùng</h1>
                            <p className={styles.subtitle}>Cập nhật thông tin tài khoản người dùng</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {formError && (
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{formError}</p>
                </div>
            )}

            {/* Form */}
            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin đăng nhập</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Email <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={styles.input}
                                placeholder="user@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin cá nhân</h3>
                        <div className={styles.gridTwo}>
                            <div className={styles.field}>
                                <label className={styles.label}>Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className={styles.input}
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={styles.input}
                                    placeholder="0123456789"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Phân quyền & Trạng thái</h3>
                        <div className={styles.gridTwo}>
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Vai trò <span className={styles.required}>*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) as UserRole })}
                                    className={styles.select}
                                    required
                                >
                                    <option value={UserRole.SALES}>{UserRoleLabels[UserRole.SALES]}</option>
                                    <option value={UserRole.MANAGER}>{UserRoleLabels[UserRole.MANAGER]}</option>
                                    <option value={UserRole.ADMIN}>{UserRoleLabels[UserRole.ADMIN]}</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Trạng thái <span className={styles.required}>*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) as UserStatus })}
                                    className={styles.select}
                                    required
                                >
                                    <option value={UserStatus.ACTIVE}>{UserStatusLabels[UserStatus.ACTIVE]}</option>
                                    <option value={UserStatus.SUSPENDED}>{UserStatusLabels[UserStatus.SUSPENDED]}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.notice} ${styles.noticeInfo}`}>
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <p><strong>Lưu ý:</strong> Để thay đổi mật khẩu, vui lòng sử dụng chức năng "Đổi mật khẩu" trong trang cài đặt.</p>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/users">
                            <button
                                type="button"
                                className={styles.buttonSecondary}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                        </Link>
                        <button
                            type="submit"
                            className={styles.buttonPrimary}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Cập nhật
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
