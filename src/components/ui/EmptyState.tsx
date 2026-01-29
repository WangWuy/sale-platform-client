import React from 'react';

interface EmptyStateProps {
    className?: string;
    width?: number;
    height?: number;
}

export function EmptyDataIllustration({ className = '', width = 200, height = 200 }: EmptyStateProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Oval Gradient Background */}
            <ellipse cx="100" cy="120" rx="80" ry="30" fill="url(#paint0_radial)" fillOpacity="0.5" />

            {/* Abstract Elements */}
            <circle cx="100" cy="90" r="60" fill="url(#paint1_linear)" fillOpacity="0.05" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />

            {/* Folder/Box Icon */}
            <path
                d="M70 60H95L105 70H130C135.523 70 140 74.4772 140 80V130C140 135.523 135.523 140 130 140H70C64.4772 140 60 135.523 60 130V70C60 64.4772 64.4772 60 70 60Z"
                fill="white"
                stroke="#94A3B8"
                strokeWidth="2"
            />

            {/* Ghost Lines */}
            <rect x="75" y="85" width="50" height="6" rx="3" fill="#E2E8F0" />
            <rect x="75" y="100" width="30" height="6" rx="3" fill="#E2E8F0" />
            <rect x="75" y="115" width="40" height="6" rx="3" fill="#E2E8F0" />

            {/* Floating Search Icon */}
            <g filter="url(#filter0_d)" transform="translate(10, -10)">
                <circle cx="130" cy="130" r="24" fill="white" stroke="#3B82F6" strokeWidth="4" />
                <path d="M148 148L160 160" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
                <path d="M122 130H138" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </g>

            <defs>
                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 120) rotate(90) scale(30 80)">
                    <stop stopColor="#3B82F6" stopOpacity="0.2" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="paint1_linear" x1="100" y1="30" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E2E8F0" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <filter id="filter0_d" x="90" y="90" width="90" height="90" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="6" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.231373 0 0 0 0 0.509804 0 0 0 0 0.964706 0 0 0 0.15 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                </filter>
            </defs>
        </svg>
    );
}

export default EmptyDataIllustration;
