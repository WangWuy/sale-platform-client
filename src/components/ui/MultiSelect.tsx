'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search, Loader2 } from 'lucide-react';
import styles from './MultiSelect.module.scss';

export interface MultiSelectOption {
    id: number;
    name: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    selectedValues: MultiSelectOption[];
    onChange: (selected: MultiSelectOption[]) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    searchable?: boolean;
    maxSelected?: number;
    className?: string;
}

export function MultiSelect({
    options,
    selectedValues,
    onChange,
    placeholder = 'Chọn...',
    label,
    required = false,
    disabled = false,
    loading = false,
    searchable = true,
    maxSelected,
    className = ''
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSelected = (option: MultiSelectOption) =>
        selectedValues.some(v => v.id === option.id);

    const handleToggleOption = (option: MultiSelectOption) => {
        if (isSelected(option)) {
            onChange(selectedValues.filter(v => v.id !== option.id));
        } else {
            if (maxSelected && selectedValues.length >= maxSelected) {
                return;
            }
            onChange([...selectedValues, option]);
        }
    };

    const handleRemove = (e: React.MouseEvent, option: MultiSelectOption) => {
        e.stopPropagation();
        onChange(selectedValues.filter(v => v.id !== option.id));
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            {label && (
                <label className={styles.label}>
                    {label} {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <div
                className={`${styles.selectBox} ${isOpen ? styles.selectBoxOpen : ''} ${disabled ? styles.selectBoxDisabled : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={styles.selectedItems}>
                    {selectedValues.length === 0 ? (
                        <span className={styles.placeholder}>{placeholder}</span>
                    ) : (
                        <>
                            {selectedValues.slice(0, 3).map(item => (
                                <span key={item.id} className={styles.tag}>
                                    {item.name}
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(e, item)}
                                        className={styles.tagRemove}
                                        disabled={disabled}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {selectedValues.length > 3 && (
                                <span className={styles.moreTag}>
                                    +{selectedValues.length - 3} khác
                                </span>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.actions}>
                    {selectedValues.length > 0 && !disabled && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className={styles.clearButton}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className={styles.dropdown}>
                    {searchable && (
                        <div className={styles.searchBox}>
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className={styles.searchInput}
                            />
                        </div>
                    )}

                    <div className={styles.optionsList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang tải...</span>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className={styles.empty}>
                                {searchQuery ? 'Không tìm thấy kết quả' : 'Không có dữ liệu'}
                            </div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    className={`${styles.option} ${isSelected(option) ? styles.optionSelected : ''}`}
                                    onClick={() => handleToggleOption(option)}
                                >
                                    <div className={styles.checkbox}>
                                        {isSelected(option) && <Check className="w-4 h-4" />}
                                    </div>
                                    <span className={styles.optionLabel}>{option.name}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {maxSelected && (
                        <div className={styles.footer}>
                            Đã chọn: {selectedValues.length}/{maxSelected}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MultiSelect;
