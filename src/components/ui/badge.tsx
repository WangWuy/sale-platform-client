import React from "react";

interface BadgeProps {
    variant?: "default" | "outline" | "secondary";
    className?: string;
    children: React.ReactNode;
}

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
    const baseClasses = "ui-badge inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none transition-colors";

    const variantClasses = {
        default: "bg-primary text-primary-foreground",
        outline: "border",
        secondary: "bg-secondary text-secondary-foreground",
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
}
