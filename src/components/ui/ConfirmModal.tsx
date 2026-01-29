'use client';

import React, { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            modalRef.current?.focus();
        } else {
            previousFocusRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
            <div
                ref={modalRef}
                className={`${styles.modal} ${styles[variant]}`}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Close dialog"
                >
                    <X className={styles.closeIcon} />
                </button>

                <div className={styles.iconWrapper}>
                    <AlertCircle className={styles.icon} aria-hidden="true" />
                </div>

                <h2 id="modal-title" className={styles.title}>
                    {title}
                </h2>

                <p id="modal-description" className={styles.message}>
                    {message}
                </p>

                <div className={styles.actions}>
                    <button
                        onClick={onClose}
                        className={styles.cancelButton}
                        autoFocus
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={styles.confirmButton}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
