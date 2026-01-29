import React from 'react';

interface ImageFallbackProps {
    className?: string;
    width?: number;
    height?: number;
}

/**
 * Avatar Fallback - Hiển thị khi ảnh avatar bị lỗi
 */
export function AvatarFallback({ className = '', width = 80, height = 80 }: ImageFallbackProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="40" cy="40" r="40" fill="url(#avatar_gradient)" />
            <g clipPath="url(#clip_avatar)">
                {/* Body/Shoulders */}
                <ellipse cx="40" cy="80" rx="30" ry="25" fill="white" fillOpacity="0.9" />
                {/* Head */}
                <circle cx="40" cy="35" r="14" fill="white" fillOpacity="0.9" />

                {/* Subtle Highlight */}
                <circle cx="40" cy="35" r="12" stroke="url(#avatar_highlight)" strokeWidth="1" fill="none" opacity="0.5" />
            </g>

            <defs>
                <linearGradient id="avatar_gradient" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" /> {/* primary-400 */}
                    <stop offset="1" stopColor="#2563EB" /> {/* primary-600 */}
                </linearGradient>
                <linearGradient id="avatar_highlight" x1="28" y1="23" x2="52" y2="47" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#93C5FD" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <clipPath id="clip_avatar">
                    <circle cx="40" cy="40" r="40" />
                </clipPath>
            </defs>
        </svg>
    );
}

/**
 * Product Image Fallback - Hiển thị khi ảnh sản phẩm bị lỗi
 */
export function ProductImageFallback({ className = '', width = 120, height = 120 }: ImageFallbackProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background */}
            <rect width="120" height="120" fill="#F3F4F6" rx="8" />

            {/* Image Icon */}
            <g transform="translate(30, 30)">
                {/* Frame */}
                <rect x="0" y="0" width="60" height="60" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="white" />

                {/* Mountain/Landscape */}
                <path
                    d="M10 45L20 30L30 40L40 25L50 35V50H10V45Z"
                    fill="#E5E7EB"
                />

                {/* Sun/Circle */}
                <circle cx="45" cy="15" r="6" fill="#D1D5DB" />
            </g>

            {/* Package Icon Overlay (Optional) */}
            <g transform="translate(75, 75)" opacity="0.6">
                <rect x="0" y="0" width="35" height="35" rx="17.5" fill="white" />
                <path
                    d="M17.5 10L12 13V22L17.5 25L23 22V13L17.5 10Z"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinejoin="round"
                />
                <path d="M17.5 10V17.5M17.5 17.5L12 20M17.5 17.5L23 20" stroke="#3B82F6" strokeWidth="1.5" />
            </g>
        </svg>
    );
}

/**
 * Broken Image Icon - Hiển thị khi ảnh bị lỗi (compact version)
 */
export function BrokenImageIcon({ className = '', width = 48, height = 48 }: ImageFallbackProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background */}
            <rect width="48" height="48" rx="4" fill="#FEE2E2" />

            {/* Broken Image Icon */}
            <g transform="translate(12, 12)">
                <path
                    d="M2 2L22 22M22 2L2 22"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <rect
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                    rx="2"
                    stroke="#DC2626"
                    strokeWidth="2"
                    fill="none"
                />
            </g>
        </svg>
    );
}

/**
 * Generic Image Placeholder with custom text
 */
interface ImagePlaceholderProps extends ImageFallbackProps {
    text?: string;
    bgColor?: string;
    textColor?: string;
}

export function ImagePlaceholder({
    className = '',
    width = 120,
    height = 120,
    text = '?',
    bgColor = '#E5E7EB',
    textColor = '#6B7280'
}: ImagePlaceholderProps) {
    const fontSize = Math.min(width, height) * 0.4;

    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width={width} height={height} fill={bgColor} rx="8" />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill={textColor}
                fontSize={fontSize}
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
            >
                {text}
            </text>
        </svg>
    );
}

export default {
    AvatarFallback,
    ProductImageFallback,
    BrokenImageIcon,
    ImagePlaceholder
};
