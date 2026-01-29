'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Tag,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { designTagService } from '@/services/design-tag.service';
import { CreateTagRequest, TagBehavior, TAG_BEHAVIOR_NAMES } from '@/types/design-tag';
import styles from './create.module.scss';

export default function CreateDesignTagPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<CreateTagRequest>({
        code: '',
        name: '',
        behavior: TagBehavior.AUTO_SURCHARGE,
        surchargeAmount: undefined,
        surchargePercent: undefined,
        description: ''
    });

    const [errors, setErrors] = useState<string[]>([]);

    const validateForm = (): boolean => {
        const validationErrors: string[] = [];

        if (!formData.code || !formData.code.trim()) {
            validationErrors.push('Mã tag không được để trống');
        } else if (formData.code.trim().length < 2) {
            validationErrors.push('Mã tag phải có ít nhất 2 ký tự');
        } else if (formData.code.trim().length > 20) {
            validationErrors.push('Mã tag không được vượt quá 20 ký tự');
        } else if (!/^[A-Z0-9_]+$/.test(formData.code.trim())) {
            validationErrors.push('Mã tag chỉ được chứa chữ in hoa, số và dấu gạch dưới');
        }

        if (!formData.name || !formData.name.trim()) {
            validationErrors.push('Tên tag không được để trống');
        } else if (formData.name.trim().length < 2) {
            validationErrors.push('Tên tag phải có ít nhất 2 ký tự');
        } else if (formData.name.trim().length > 100) {
            validationErrors.push('Tên tag không được vượt quá 100 ký tự');
        }

        if (formData.behavior === TagBehavior.AUTO_SURCHARGE) {
            if (!formData.surchargeAmount && !formData.surchargePercent) {
                validationErrors.push('Phải nhập ít nhất một trong hai: Phụ thu cố định hoặc Phụ thu theo %');
            }
            if (formData.surchargeAmount && formData.surchargeAmount < 0) {
                validationErrors.push('Phụ thu cố định không được âm');
            }
            if (formData.surchargePercent && (formData.surchargePercent < 0 || formData.surchargePercent > 100)) {
                validationErrors.push('Phụ thu theo % phải từ 0-100');
            }
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleInputChange = (field: keyof CreateTagRequest, value: any) => {
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
            const payload: CreateTagRequest = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                behavior: formData.behavior,
                description: formData.description?.trim() || undefined
            };

            if (formData.behavior === TagBehavior.AUTO_SURCHARGE) {
                if (formData.surchargeAmount) {
                    payload.surchargeAmount = formData.surchargeAmount;
                }
                if (formData.surchargePercent) {
                    payload.surchargePercent = formData.surchargePercent;
                }
            }

            await designTagService.createTag(payload);
            setSuccess(true);

            setTimeout(() => {
                router.push('/design-tags');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Không thể tạo design tag');
            console.error('Create design tag error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <Link href="/design-tags">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerBadge}>
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={styles.title}>Tạo Design Tag Mới</h1>
                            <p className={styles.subtitle}>Thêm tag thiết kế mới vào hệ thống</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className={`${styles.notice} ${styles.noticeSuccess}`}>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p>Tạo design tag thành công! Đang chuyển hướng...</p>
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
                        <div className={styles.gridTwo}>
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Mã tag <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    className={`${styles.input} ${styles.inputMono}`}
                                    placeholder="VD: LAMINATE, EMBOSS..."
                                    disabled={loading || success}
                                    maxLength={20}
                                />
                                <p className={styles.helpText}>2-20 ký tự, chỉ chữ in hoa, số và dấu gạch dưới</p>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Tên tag <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={styles.input}
                                    placeholder="Nhập tên tag..."
                                    disabled={loading || success}
                                    maxLength={100}
                                />
                                <p className={styles.helpText}>2-100 ký tự</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Hành vi & Phụ thu</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Hành vi <span className={styles.required}>*</span>
                            </label>
                            <select
                                value={formData.behavior}
                                onChange={(e) => handleInputChange('behavior', Number(e.target.value) as TagBehavior)}
                                className={styles.select}
                                disabled={loading || success}
                            >
                                {Object.entries(TAG_BEHAVIOR_NAMES).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>

                        {/* Surcharge Fields */}
                        {formData.behavior === TagBehavior.AUTO_SURCHARGE && (
                            <div className={styles.surchargeBox}>
                                <div className={styles.gridTwo}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Phụ thu cố định (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={formData.surchargeAmount || ''}
                                            onChange={(e) => handleInputChange('surchargeAmount', e.target.value ? Number(e.target.value) : undefined)}
                                            className={styles.input}
                                            placeholder="0"
                                            disabled={loading || success}
                                            min="0"
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Phụ thu theo % (%)</label>
                                        <input
                                            type="number"
                                            value={formData.surchargePercent || ''}
                                            onChange={(e) => handleInputChange('surchargePercent', e.target.value ? Number(e.target.value) : undefined)}
                                            className={styles.input}
                                            placeholder="0"
                                            disabled={loading || success}
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Mô tả</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>Mô tả chi tiết</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className={styles.input}
                                placeholder="Nhập mô tả..."
                                disabled={loading || success}
                                maxLength={500}
                                style={{ resize: 'vertical' }}
                            />
                            <p className={styles.helpText}>Tối đa 500 ký tự</p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/design-tags">
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
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Tạo design tag
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
