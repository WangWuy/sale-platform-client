'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    AlertCircle,
    User as UserIcon
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserRole, UserStatus, UserRoleLabels, UserStatusLabels, CreateUserRequest } from '@/types/user';
import styles from './create.module.scss';

export default function CreateUserPage() {
    const router = useRouter();
    const { createUser } = useUsers();

    const [formData, setFormData] = useState<CreateUserRequest>({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: UserRole.SALES,
        status: UserStatus.ACTIVE
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Validation
        if (!formData.email?.trim()) {
            setFormError('Email không được để trống');
            return;
        }

        if (!formData.password || formData.password.length < 8) {
            setFormError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createUser(formData);
            if (result) {
                router.push('/users');
            } else {
                setFormError('Không thể tạo người dùng');
            }
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <h1 className={styles.title}>Thêm người dùng mới</h1>
                            <p className={styles.subtitle}>Tạo tài khoản người dùng mới trong hệ thống</p>
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
                        <div className={styles.gridTwo}>
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
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Mật khẩu <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <p className={styles.helpText}>Tối thiểu 8 ký tự</p>
                            </div>
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
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Tạo người dùng
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
