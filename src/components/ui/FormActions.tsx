import React from 'react';
import Link from 'next/link';
import { Save, X, LucideIcon } from 'lucide-react';
import styles from './FormActions.module.scss';

interface FormActionsProps {
    cancelUrl: string;
    submitText?: string;
    submitIcon?: LucideIcon;
    loading?: boolean;
    loadingText?: string;
    disabled?: boolean;
}

export function FormActions({
    cancelUrl,
    submitText = 'Lưu',
    submitIcon: SubmitIcon = Save,
    loading = false,
    loadingText = 'Đang lưu...',
    disabled = false
}: FormActionsProps) {
    return (
        <div className={styles.actions}>
            <Link href={cancelUrl}>
                <button
                    type="button"
                    className={styles.buttonSecondary}
                    disabled={loading || disabled}
                >
                    <X className="w-4 h-4" />
                    Hủy
                </button>
            </Link>
            <button
                type="submit"
                className={styles.buttonPrimary}
                disabled={loading || disabled}
            >
                {loading ? (
                    <>
                        <span className={styles.spinner}></span>
                        {loadingText}
                    </>
                ) : (
                    <>
                        <SubmitIcon className="w-4 h-4" />
                        {submitText}
                    </>
                )}
            </button>
        </div>
    );
}
