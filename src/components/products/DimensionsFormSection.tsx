'use client';

import styles from './DimensionsFormSection.module.scss';

export interface Dimensions {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'm';
}

export interface DimensionsFormSectionProps {
    /** Current dimensions values */
    dimensions: Dimensions;
    /** Callback when any dimension field changes */
    onChange: (dimensions: Partial<Dimensions>) => void;
    /** Disable all inputs */
    disabled?: boolean;
    /** Section title */
    title?: string;
}

export function DimensionsFormSection({
    dimensions,
    onChange,
    disabled = false,
    title = 'Kích thước'
}: DimensionsFormSectionProps) {
    const handleChange = (field: keyof Dimensions, value: string) => {
        if (field === 'unit') {
            onChange({ unit: value as 'cm' | 'm' });
        } else {
            onChange({ [field]: Number(value) || 0 });
        }
    };

    return (
        <div>
            <h3 className={styles.sectionTitle}>{title}</h3>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Chiều dài</label>
                    <input
                        type="number"
                        value={dimensions.length || ''}
                        onChange={(e) => handleChange('length', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        disabled={disabled}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Chiều rộng</label>
                    <input
                        type="number"
                        value={dimensions.width || ''}
                        onChange={(e) => handleChange('width', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        disabled={disabled}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Chiều cao</label>
                    <input
                        type="number"
                        value={dimensions.height || ''}
                        onChange={(e) => handleChange('height', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        disabled={disabled}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Đơn vị</label>
                    <select
                        value={dimensions.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        className={styles.select}
                        disabled={disabled}
                    >
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default DimensionsFormSection;
