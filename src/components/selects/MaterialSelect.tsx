'use client';

import { useQuery } from '@tanstack/react-query';
import { materialService } from '@/services/material.service';
import styles from './EntitySelect.module.scss';

export interface MaterialSelectProps {
    value?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    error?: string;
    placeholder?: string;
}

export function MaterialSelect({
    value,
    onChange,
    disabled = false,
    required = false,
    label = 'Vật liệu',
    error,
    placeholder = 'Chọn vật liệu'
}: MaterialSelectProps) {
    const { data: materials, isLoading, error: fetchError } = useQuery({
        queryKey: ['materials-all'],
        queryFn: () => materialService.getMaterials(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    Đang tải vật liệu...
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <select className={styles.select} disabled>
                    <option>Lỗi tải vật liệu</option>
                </select>
                <span className={styles.error}>
                    Không thể tải danh sách vật liệu
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
                {materials?.map((material) => (
                    <option key={material.id} value={material.id}>
                        {material.name}
                    </option>
                ))}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}

export default MaterialSelect;
