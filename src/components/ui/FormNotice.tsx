import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import styles from './FormNotice.module.scss';

export type NoticeType = 'success' | 'error' | 'warning';

interface FormNoticeProps {
    type: NoticeType;
    message?: string;
    errors?: string[];
}

export function FormNotice({ type, message, errors }: FormNoticeProps) {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
            case 'warning':
                return <AlertCircle className={`w-5 h-5 ${type === 'error' ? 'text-red-600' : 'text-amber-600'}`} />;
        }
    };

    const getClassName = () => {
        switch (type) {
            case 'success':
                return `${styles.notice} ${styles.noticeSuccess}`;
            case 'error':
                return `${styles.notice} ${styles.noticeError}`;
            case 'warning':
                return `${styles.notice} ${styles.noticeWarning}`;
        }
    };

    if (!message && (!errors || errors.length === 0)) {
        return null;
    }

    return (
        <div className={getClassName()}>
            {getIcon()}
            <div>
                {message && <p className={styles.noticeMessage}>{message}</p>}
                {errors && errors.length > 0 && (
                    <>
                        {message && <p className={styles.noticeTitle}>Vui lòng sửa các lỗi sau:</p>}
                        <ul className={styles.errorList}>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}
