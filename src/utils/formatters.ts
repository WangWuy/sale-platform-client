// =====================================================
// Formatting Utilities
// Common formatting functions used across the application
// =====================================================

/**
 * Format số tiền VND với dấu phẩy (x,xxx,xxx đ)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US').format(amount) + ' đ';
}

/**
 * Format số tiền với options
 */
export function formatPrice(price: number, options?: {
    showCurrency?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}): string {
    const { showCurrency = false, minimumFractionDigits = 0, maximumFractionDigits = 0 } = options || {};

    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits,
        maximumFractionDigits
    }).format(price);

    return showCurrency ? `${formatted} ₫` : formatted;
}

/**
 * Format ngày giờ theo tiếng Việt
 */
export function formatDateTime(dateString: string | Date, options?: {
    showTime?: boolean;
    showSeconds?: boolean;
}): string {
    const { showTime = true, showSeconds = false } = options || {};
    const date = new Date(dateString);

    const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    if (showTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
        if (showSeconds) {
            dateOptions.second = '2-digit';
        }
    }

    return date.toLocaleString('vi-VN', dateOptions);
}

/**
 * Format ngày (không có giờ)
 */
export function formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Truncate text với ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Format số lượng với đơn vị
 */
export function formatQuantity(quantity: number, unit?: string): string {
    const formatted = new Intl.NumberFormat('vi-VN').format(quantity);
    return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format kích thước (DxRxC)
 */
export function formatDimensions(dimensions: {
    length?: number | null;
    width?: number | null;
    height?: number | null;
    unit?: string;
} | null): string {
    if (!dimensions) return 'N/A';

    const { length, width, height, unit = 'cm' } = dimensions;
    const parts = [];

    if (length) parts.push(`D${length}`);
    if (width) parts.push(`R${width}`);
    if (height) parts.push(`C${height}`);

    return parts.length > 0 ? `${parts.join(' x ')} ${unit}` : 'N/A';
}

/**
 * Format số điện thoại VN
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return 'N/A';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as VN phone
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
