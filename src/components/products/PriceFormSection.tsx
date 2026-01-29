'use client';

import { formatCurrency } from '@/utils/formatters';
import styles from './PriceFormSection.module.scss';

export interface PriceFormSectionProps {
    /** Base price */
    basePrice: number;
    /** Current/selling price */
    currentPrice: number;
    /** Minimum price (optional) */
    minPrice?: number;
    /** Maximum price (optional) */
    maxPrice?: number;
    /** Callback when any price changes */
    onChange: (field: 'basePrice' | 'currentPrice' | 'minPrice' | 'maxPrice', value: number) => void;
    /** Disable all inputs */
    disabled?: boolean;
    /** Show min/max price fields */
    showMinMax?: boolean;
    /** Section title */
    title?: string;
}

export function PriceFormSection({
    basePrice,
    currentPrice,
    minPrice = 0,
    maxPrice = 0,
    onChange,
    disabled = false,
    showMinMax = true,
    title = 'Thông tin giá'
}: PriceFormSectionProps) {
    const handleChange = (field: 'basePrice' | 'currentPrice' | 'minPrice' | 'maxPrice', value: string) => {
        onChange(field, Number(value) || 0);
    };

    return (
        <div>
            <h3 className={styles.sectionTitle}>{title}</h3>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>
                        Giá gốc <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => handleChange('basePrice', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                    />
                    <span className={styles.helpText}>{formatCurrency(basePrice)}</span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Giá hiện tại <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => handleChange('currentPrice', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                    />
                    <span className={styles.helpText}>{formatCurrency(currentPrice)}</span>
                </div>
            </div>

            {showMinMax && (
                <div className={styles.gridTight} style={{ marginTop: '1rem' }}>
                    <div className={styles.field}>
                        <label className={styles.label}>Giá tối thiểu</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => handleChange('minPrice', e.target.value)}
                            className={styles.input}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            disabled={disabled}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Giá tối đa</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => handleChange('maxPrice', e.target.value)}
                            className={styles.input}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            disabled={disabled}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default PriceFormSection;
