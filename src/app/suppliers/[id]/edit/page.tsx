'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Truck,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { supplierService } from '@/services/supplier.service';
import { UpdateSupplierRequest } from '@/types/supplier';
import styles from './edit.module.scss';

export default function EditSupplierPage() {
    const router = useRouter();
    const params = useParams();
    const supplierId = parseInt(params.id as string);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<UpdateSupplierRequest>({
        name: '',
        contact: '',
        address: '',
        phone: '',
        email: ''
    });

    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const supplier = await supplierService.getSupplierById(supplierId);
                if (supplier) {
                    setFormData({
                        name: supplier.name,
                        contact: supplier.contact || '',
                        address: supplier.address || '',
                        phone: supplier.phone || '',
                        email: supplier.email || ''
                    });
                } else {
                    setError('Không tìm thấy nhà cung cấp');
                }
            } catch (err) {
                setError('Không thể tải thông tin nhà cung cấp');
                console.error('Fetch supplier error:', err);
            } finally {
                setFetchingData(false);
            }
        };

        if (supplierId) {
            fetchSupplier();
        }
    }, [supplierId]);

    const validateForm = (): boolean => {
        const validationErrors: string[] = [];

        if (formData.name && !formData.name.trim()) {
            validationErrors.push('Tên nhà cung cấp không được để trống');
        } else if (formData.name && formData.name.trim().length < 2) {
            validationErrors.push('Tên nhà cung cấp phải có ít nhất 2 ký tự');
        } else if (formData.name && formData.name.trim().length > 100) {
            validationErrors.push('Tên nhà cung cấp không được vượt quá 100 ký tự');
        }

        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                validationErrors.push('Email không hợp lệ');
            }
        }

        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(formData.phone.trim()) || formData.phone.trim().length < 8) {
                validationErrors.push('Số điện thoại không hợp lệ');
            }
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleInputChange = (field: keyof UpdateSupplierRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
        setErrors([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const updateData: UpdateSupplierRequest = {};

            if (formData.name && formData.name.trim()) {
                updateData.name = formData.name.trim();
            }
            if (formData.contact && formData.contact.trim()) {
                updateData.contact = formData.contact.trim();
            }
            if (formData.address && formData.address.trim()) {
                updateData.address = formData.address.trim();
            }
            if (formData.phone && formData.phone.trim()) {
                updateData.phone = formData.phone.trim();
            }
            if (formData.email && formData.email.trim()) {
                updateData.email = formData.email.trim();
            }

            await supplierService.updateSupplier(supplierId, updateData);
            setSuccess(true);

            setTimeout(() => {
                router.push('/suppliers');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Không thể cập nhật nhà cung cấp');
            console.error('Update supplier error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className={styles.loadingText}>Đang tải thông tin nhà cung cấp...</span>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <Link href="/suppliers">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerBadge}>
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={styles.title}>Chỉnh Sửa Nhà Cung Cấp</h1>
                            <p className={styles.subtitle}>Cập nhật thông tin nhà cung cấp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className={`${styles.notice} ${styles.noticeSuccess}`}>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p>Cập nhật nhà cung cấp thành công! Đang chuyển hướng...</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error}</p>
                </div>
            )}

            {/* Validation Errors */}
            {errors.length > 0 && (
                <div className={`${styles.notice} ${styles.noticeWarning}`}>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                        <p className={styles.noticeTitle}>Vui lòng sửa các lỗi sau:</p>
                        <ul className={styles.errorList}>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Tên nhà cung cấp <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={styles.input}
                                placeholder="Nhập tên nhà cung cấp..."
                                disabled={loading || success}
                                maxLength={100}
                            />
                            <p className={styles.helpText}>2-100 ký tự</p>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Người liên hệ</label>
                            <input
                                type="text"
                                value={formData.contact || ''}
                                onChange={(e) => handleInputChange('contact', e.target.value)}
                                className={styles.input}
                                placeholder="Nhập tên người liên hệ..."
                                disabled={loading || success}
                                maxLength={100}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin liên hệ</h3>
                        <div className={styles.gridTwo}>
                            <div className={styles.field}>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={styles.input}
                                    placeholder="Nhập email..."
                                    disabled={loading || success}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={styles.input}
                                    placeholder="Nhập số điện thoại..."
                                    disabled={loading || success}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Địa chỉ</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>Địa chỉ chi tiết</label>
                            <textarea
                                value={formData.address || ''}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={3}
                                className={styles.input}
                                placeholder="Nhập địa chỉ..."
                                disabled={loading || success}
                                maxLength={500}
                                style={{ resize: 'vertical' }}
                            />
                            <p className={styles.helpText}>Tối đa 500 ký tự</p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/suppliers">
                            <button
                                type="button"
                                className={styles.buttonSecondary}
                                disabled={loading || success}
                            >
                                Hủy
                            </button>
                        </Link>
                        <button
                            type="submit"
                            className={styles.buttonPrimary}
                            disabled={loading || success}
                        >
                            {loading ? (
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
