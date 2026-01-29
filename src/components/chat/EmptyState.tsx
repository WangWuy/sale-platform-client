import { MessageCircle } from 'lucide-react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
    title?: string;
    description?: string;
}

export default function EmptyState({
    title = 'Chat Nội Bộ',
    description = 'Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu'
}: EmptyStateProps) {
    return (
        <div className={styles.emptyStateContainer}>
            <div className={styles.emptyStateContent}>
                <div className={styles.iconWrapper}>
                    <MessageCircle />
                </div>
                <h2 className={styles.title}>
                    {title}
                </h2>
                <p className={styles.description}>
                    {description}
                </p>
            </div>
        </div>
    );
}
