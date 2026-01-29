'use client';

import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
    children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-lg hover:shadow-xl',
    ghost: 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300'
};


const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
};

const iconSizes: Record<ButtonSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const widthStyle = fullWidth ? 'w-full' : '';

    const combinedClassName = cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyle,
        className
    );

    const iconClassName = iconSizes[size];

    return (
        <button
            className={combinedClassName}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className={cn(iconClassName, 'animate-spin')} />}
            {!loading && Icon && iconPosition === 'left' && <Icon className={iconClassName} />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className={iconClassName} />}
        </button>
    );
};

// Icon-only button variant
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
    icon: LucideIcon;
    title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    title,
    className = '',
    loading = false,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const iconOnlyVariantStyles: Record<ButtonVariant, string> = {
        primary: 'text-primary-600 hover:bg-primary-50',
        secondary: 'text-gray-600 hover:bg-gray-100',
        danger: 'text-red-600 hover:bg-red-50',
        success: 'text-green-600 hover:bg-green-50',
        warning: 'text-amber-600 hover:bg-amber-50',
        ghost: 'text-gray-600 hover:bg-gray-100'
    };

    const iconOnlySizes: Record<ButtonSize, string> = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    };

    const combinedClassName = cn(
        baseStyles,
        iconOnlyVariantStyles[variant],
        iconOnlySizes[size],
        className
    );

    const iconClassName = iconSizes[size];

    return (
        <button
            className={combinedClassName}
            title={title}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Loader2 className={cn(iconClassName, 'animate-spin')} /> : <Icon className={iconClassName} />}
        </button>
    );
};
