import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import styles from './FormPageLayout.module.scss';

interface FormPageLayoutProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    backUrl: string;
    children: React.ReactNode;
}

export function FormPageLayout({
    title,
    subtitle,
    icon: Icon,
    backUrl,
    children
}: FormPageLayoutProps) {
    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <Link href={backUrl}>
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerBadge}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={styles.title}>{title}</h1>
                            <p className={styles.subtitle}>{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
