import { QuoteStatus, QuoteStatusLabels, QuoteStatusColors } from "@/types/quote";
import { Badge } from "@/components/ui/badge";

interface QuoteStatusBadgeProps {
    status: QuoteStatus;
    className?: string;
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
    const label = QuoteStatusLabels[status];
    const color = QuoteStatusColors[status];

    // Map colors to Tailwind classes
    const colorClasses = {
        gray: "bg-gray-100 text-gray-800",
        blue: "bg-blue-100 text-blue-800",
        green: "bg-green-100 text-green-800",
        red: "bg-red-100 text-red-800",
        orange: "bg-orange-100 text-orange-800",
    };

    return (
        <Badge
            variant="default"
            className={`${colorClasses[color as keyof typeof colorClasses]} ${className || ""}`}
        >
            {label}
        </Badge>
    );
}
