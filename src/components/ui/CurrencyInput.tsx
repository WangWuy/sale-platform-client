import React, { useState, useEffect, useRef, forwardRef } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onChange, onFocus, onBlur, className, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState<string>('');
        const [isFocused, setIsFocused] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);

        // Format number with commas (Vietnamese style)
        const formatNumber = (num: number): string => {
            if (num === 0) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        // Parse formatted string to number
        const parseNumber = (str: string): number => {
            const cleaned = str.replace(/,/g, '');
            return cleaned === '' ? 0 : parseInt(cleaned, 10);
        };

        // Update display value when prop value changes (only when not focused)
        useEffect(() => {
            if (!isFocused) {
                setDisplayValue(formatNumber(value));
            }
        }, [value, isFocused]);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            // Clear "0" when focused
            if (value === 0) {
                setDisplayValue('');
            }
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            const numValue = parseNumber(displayValue);
            onChange(numValue);
            setDisplayValue(formatNumber(numValue));
            onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target;
            const inputValue = input.value;
            const cursorPosition = input.selectionStart || 0;

            // Remove all non-digits
            const cleaned = inputValue.replace(/[^\d]/g, '');

            // If empty, set to empty string (will show placeholder)
            if (cleaned === '') {
                setDisplayValue('');
                onChange(0);
                return;
            }

            // Parse to number
            const numValue = parseInt(cleaned, 10);

            // Check max value (PostgreSQL INTEGER max)
            const MAX_VALUE = 2147483647;
            if (numValue > MAX_VALUE) {
                // Don't update if exceeds max
                return;
            }

            // Format with commas
            const formatted = formatNumber(numValue);

            // Calculate new cursor position
            const oldCommaCount = (displayValue.slice(0, cursorPosition).match(/,/g) || []).length;
            const newCommaCount = (formatted.slice(0, cursorPosition).match(/,/g) || []).length;
            const newCursorPosition = cursorPosition + (newCommaCount - oldCommaCount);

            setDisplayValue(formatted);
            onChange(numValue);

            // Restore cursor position after React updates
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                }
            }, 0);
        };

        return (
            <input
                ref={(node) => {
                    // Handle both refs
                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
                    }
                    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
                }}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={className}
                {...props}
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';
