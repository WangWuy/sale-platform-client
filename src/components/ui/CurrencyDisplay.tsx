import React from 'react';

interface CurrencyDisplayProps {
    amount: number;
    className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, className = '' }) => {
    const formatted = new Intl.NumberFormat('en-US').format(amount);

    return (
        <span className={className}>
            {formatted} <span className="text-gray-400">đ</span>
        </span>
    );
};
