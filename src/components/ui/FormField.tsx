import React from 'react';
import styles from './FormField.module.scss';

interface FormFieldProps {
    label?: string;
    required?: boolean;
    helpText?: string;
    error?: string;
    children: React.ReactNode;
}

export function FormField({
    label,
    required = false,
    helpText,
    error,
    children
}: FormFieldProps) {
    return (
        <div className={styles.field}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            {children}
            {helpText && <p className={styles.helpText}>{helpText}</p>}
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
}
