'use client';

import React from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
    className?: string;
}

export function Skeleton({
    width,
    height,
    variant = 'rectangular',
    className = ''
}: SkeletonProps) {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={style}
            aria-busy="true"
            aria-live="polite"
        />
    );
}

export function StatCardSkeleton() {
    return (
        <div className={styles.statCard}>
            <div className={styles.statHeader}>
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="text" width="40%" height={16} />
            </div>
            <Skeleton variant="text" width="60%" height={32} className={styles.mt8} />
        </div>
    );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
    return (
        <div className={styles.tableRow}>
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} variant="text" height={20} />
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
    return (
        <div className={styles.table}>
            {/* Header */}
            <div className={styles.tableHeader}>
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} variant="text" height={16} width="80%" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </div>
    );
}
