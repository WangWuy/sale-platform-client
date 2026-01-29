import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.scss';

export interface StatCardProps {
    /**
     * Title/label of the stat
     */
    title: string;

    /**
     * Main value to display
     */
    value: string | number;

    /**
     * Icon component from lucide-react
     */
    icon: LucideIcon;

    /**
     * Color variant for the card
     * @default 'blue'
     */
    variant?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'amber' | 'pink' | 'emerald';

    /**
     * Optional change percentage or text (e.g., '+12%', '-5%')
     */
    change?: string;

    /**
     * Optional subtitle or description
     */
    subtitle?: string;

    /**
     * Card style variant (deprecated; cards render with Users page style)
     * @default 'default'
     */
    style?: 'default' | 'gradient' | 'minimal';

    /**
     * Optional click handler
     */
    onClick?: () => void;

    /**
     * Custom className for additional styling
     */
    className?: string;
}

const variantClassMap = {
    blue: styles.blue,
    green: styles.green,
    purple: styles.purple,
    orange: styles.orange,
    red: styles.red,
    cyan: styles.cyan,
    amber: styles.amber,
    pink: styles.pink,
    emerald: styles.emerald,
} satisfies Record<NonNullable<StatCardProps['variant']>, string>;

/**
 * StatCard Component
 * 
 * A reusable statistics card component with color options.
 * Cards render with the Users page style and handle text overflow with truncation.
 * 
 * @example
 * // Default style
 * <StatCard
 *   title="Total Products"
 *   value={234}
 *   icon={Package}
 *   variant="blue"
 *   change="+12%"
 * />
 * 
 * @example
 * // Users page style
 * <StatCard
 *   title="Revenue"
 *   value="245M"
 *   icon={DollarSign}
 *   variant="green"
 *   subtitle="This month"
 * />
 */
export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    variant = 'blue',
    change,
    subtitle,
    onClick,
    className = '',
}) => {
    const variantClass = variantClassMap[variant];

    // Determine if change is positive or negative
    const isPositiveChange = change && (change.startsWith('+') || !change.startsWith('-'));
    const changeColor = isPositiveChange ? 'text-green-600' : 'text-red-600';

    return (
        <div
            className={`${styles.statCard} ${variantClass} ${onClick ? styles.clickable : ''} ${className}`}
            onClick={onClick}
        >
            <div className={styles.iconWrapper}>
                <Icon className={styles.icon} />
            </div>
            <div className={styles.statInfo}>
                <p className={`${styles.statLabel} truncate`} title={title}>{title}</p>
                <p className={`${styles.statValue} truncate`} title={String(value)}>{value}</p>
                {change && (
                    <p className={`${styles.statChange} ${changeColor} truncate`}>{change}</p>
                )}
                {subtitle && <p className={`${styles.statSubtitle} truncate`} title={subtitle}>{subtitle}</p>}
            </div>
        </div>
    );
};

export default StatCard;
