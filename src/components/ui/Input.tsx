import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-foreground/90">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        id={inputId}
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            icon && "pl-10",
                            error && "border-red-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
