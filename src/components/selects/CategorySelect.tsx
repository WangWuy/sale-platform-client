'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import styles from './EntitySelect.module.scss';

export interface CategorySelectProps {
    value?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    error?: string;
    placeholder?: string;
}

export function CategorySelect({
    value,
    onChange,
    disabled = false,
    required = false,
    label = 'Danh mục',
    error,
    placeholder = 'Chọn danh mục'
}: CategorySelectProps) {
    const { data: response, isLoading, error: fetchError } = useQuery({
        queryKey: ['categories-all'],
        queryFn: () => categoryService.getCategories({ limit: 100 }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const categories = response?.categories || [];

    if (isLoading) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    Đang tải danh mục...
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <select className={styles.select} disabled>
                    <option>Lỗi tải danh mục</option>
                </select>
                <span className={styles.error}>
                    Không thể tải danh sách danh mục
                </span>
            </div>
        );
    }

    return (
        <div className={styles.field}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <select
                value={value || ''}
                onChange={(e) => onChange(Number(e.target.value))}
                className={styles.select}
                disabled={disabled}
                required={required}
            >
                <option value="">{placeholder}</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}

export default CategorySelect;
