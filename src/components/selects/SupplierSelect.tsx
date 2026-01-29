'use client';

import { useQuery } from '@tanstack/react-query';
import { supplierService } from '@/services/supplier.service';
import styles from './EntitySelect.module.scss';

export interface SupplierSelectProps {
    value?: number | null;
    onChange: (value: number | null) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    error?: string;
    placeholder?: string;
    allowNull?: boolean;
}

export function SupplierSelect({
    value,
    onChange,
    disabled = false,
    required = false,
    label = 'Nhà cung cấp',
    error,
    placeholder = 'Chọn nhà cung cấp',
    allowNull = true
}: SupplierSelectProps) {
    const { data: suppliers, isLoading, error: fetchError } = useQuery({
        queryKey: ['suppliers-all'],
        queryFn: () => supplierService.getAllSuppliers(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    Đang tải nhà cung cấp...
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.field}>
                {label && <label className={styles.label}>{label}</label>}
                <select className={styles.select} disabled>
                    <option>Lỗi tải nhà cung cấp</option>
                </select>
                <span className={styles.error}>
                    Không thể tải danh sách nhà cung cấp
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
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val ? Number(val) : null);
                }}
                className={styles.select}
                disabled={disabled}
                required={required}
            >
                {allowNull && <option value="">{placeholder}</option>}
                {suppliers?.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                    </option>
                ))}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}

export default SupplierSelect;
