import React, { useState, ImgHTMLAttributes } from 'react';
import { AvatarFallback, ProductImageFallback, BrokenImageIcon } from './ImageFallback';

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    fallbackType?: 'avatar' | 'product' | 'broken';
    fallbackText?: string;
}

/**
 * SafeImage - Component tự động hiển thị fallback khi ảnh bị lỗi
 * 
 * @example
 * // Avatar
 * <SafeImage src={user.avatar} alt={user.name} fallbackType="avatar" />
 * 
 * // Product
 * <SafeImage src={product.image} alt={product.name} fallbackType="product" />
 * 
 * // Custom text
 * <SafeImage src={url} alt="Image" fallbackText="SP" />
 */
export function SafeImage({
    src,
    alt,
    fallbackType = 'product',
    fallbackText,
    className = '',
    ...props
}: SafeImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    // Nếu không có src hoặc src rỗng, hiển thị fallback ngay
    if (!src || src.trim() === '') {
        return renderFallback();
    }

    // Nếu ảnh bị lỗi, hiển thị fallback
    if (hasError) {
        return renderFallback();
    }

    return (
        <>
            {isLoading && renderFallback()}
            <img
                src={src}
                alt={alt}
                className={`${className} ${isLoading ? 'hidden' : ''}`}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        </>
    );

    function renderFallback() {
        const width = props.width ? Number(props.width) : undefined;
        const height = props.height ? Number(props.height) : undefined;

        if (fallbackText) {
            return (
                <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500 font-semibold`} style={{ width, height }}>
                    {fallbackText}
                </div>
            );
        }

        switch (fallbackType) {
            case 'avatar':
                return <AvatarFallback className={className} width={width} height={height} />;
            case 'broken':
                return <BrokenImageIcon className={className} width={width} height={height} />;
            case 'product':
            default:
                return <ProductImageFallback className={className} width={width} height={height} />;
        }
    }
}

export default SafeImage;
