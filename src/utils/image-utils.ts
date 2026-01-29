/**
 * Image Processing Utilities
 * Smart compression, format detection, and optimization for AI Vision
 */

// ============================================
// Constants
// ============================================

export const IMAGE_CONSTANTS = {
    /** Target size for AI scan (bytes) */
    MAX_AI_SIZE: 300 * 1024, // 300KB

    /** Maximum dimension for AI processing */
    MAX_DIMENSION: 1200,

    /** Quality levels for different file sizes */
    QUALITY_LEVELS: {
        SMALL: 0.9,   // < 500KB
        MEDIUM: 0.8,  // 500KB - 2MB
        LARGE: 0.7,   // 2MB - 5MB
        XLARGE: 0.6,  // > 5MB
    },

    /** Base64 overhead multiplier */
    BASE64_OVERHEAD: 1.37,
};

// ============================================
// Types
// ============================================

export interface CompressionResult {
    dataUrl: string;
    originalSize: number;
    compressedSize: number;
    quality: number;
    format: 'jpeg' | 'webp';
    dimensions: { width: number; height: number };
    compressionRatio: number;
}

export interface CompressionOptions {
    targetSize?: number;
    maxDimension?: number;
    preferWebP?: boolean;
    minQuality?: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Calculate initial quality based on file size
 */
function getInitialQuality(fileSize: number): number {
    const { QUALITY_LEVELS } = IMAGE_CONSTANTS;

    if (fileSize < 500 * 1024) return QUALITY_LEVELS.SMALL;
    if (fileSize < 2 * 1024 * 1024) return QUALITY_LEVELS.MEDIUM;
    if (fileSize < 5 * 1024 * 1024) return QUALITY_LEVELS.LARGE;
    return QUALITY_LEVELS.XLARGE;
}

/**
 * Calculate optimal dimensions
 */
function calculateDimensions(
    width: number,
    height: number,
    maxDimension: number
): { width: number; height: number } {
    if (width <= maxDimension && height <= maxDimension) {
        return { width, height };
    }

    const ratio = width / height;

    if (width > height) {
        return {
            width: maxDimension,
            height: Math.round(maxDimension / ratio),
        };
    } else {
        return {
            width: Math.round(maxDimension * ratio),
            height: maxDimension,
        };
    }
}

// ============================================
// Main Compression Function
// ============================================

/**
 * Smart image compression with adaptive quality
 * Automatically chooses best format and quality based on file size
 */
export async function smartCompress(
    file: File,
    options: CompressionOptions = {}
): Promise<CompressionResult> {
    const {
        targetSize = IMAGE_CONSTANTS.MAX_AI_SIZE,
        maxDimension = IMAGE_CONSTANTS.MAX_DIMENSION,
        preferWebP = true,
        minQuality = 0.1,
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }

        img.onload = () => {
            try {
                // Calculate optimal dimensions
                const dimensions = calculateDimensions(img.width, img.height, maxDimension);
                canvas.width = dimensions.width;
                canvas.height = dimensions.height;

                // Draw image
                ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

                // Determine format
                const useWebP = preferWebP && supportsWebP();
                const format = useWebP ? 'webp' : 'jpeg';
                const mimeType = `image/${format}`;

                // Try compression with adaptive quality
                let quality = getInitialQuality(file.size);
                let dataUrl = canvas.toDataURL(mimeType, quality);
                let estimatedSize = dataUrl.length / IMAGE_CONSTANTS.BASE64_OVERHEAD;

                // Reduce quality until we hit target size
                while (estimatedSize > targetSize && quality > minQuality) {
                    quality -= 0.05;
                    dataUrl = canvas.toDataURL(mimeType, quality);
                    estimatedSize = dataUrl.length / IMAGE_CONSTANTS.BASE64_OVERHEAD;
                }

                const compressedSize = Math.round(estimatedSize);
                const compressionRatio = ((file.size - compressedSize) / file.size) * 100;

                console.log(`📸 Smart Compression:
- Original: ${(file.size / 1024).toFixed(1)}KB
- Compressed: ${(compressedSize / 1024).toFixed(1)}KB
- Format: ${format.toUpperCase()}
- Quality: ${(quality * 100).toFixed(0)}%
- Ratio: ${compressionRatio.toFixed(1)}% smaller
- Dimensions: ${dimensions.width}x${dimensions.height}`);

                resolve({
                    dataUrl,
                    originalSize: file.size,
                    compressedSize,
                    quality,
                    format,
                    dimensions,
                    compressionRatio,
                });
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => reject(new Error('Failed to load image'));

        // Load image
        const reader = new FileReader();
        reader.onload = () => {
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Convert file to base64 data URL without compression
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
