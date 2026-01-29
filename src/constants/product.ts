import { ProductStatus } from '@/types/product';
import { ProductTemplateType, PRODUCT_TEMPLATE_TYPE_LABELS } from '@/types/product-template';

export const PRODUCT_STATUS_LABELS: Record<number, string> = {
    [ProductStatus.PENDING]: 'Chờ duyệt',
    [ProductStatus.APPROVED]: 'Đã duyệt',
    [ProductStatus.REJECTED]: 'Từ chối',
};

export const PRODUCT_STATUS_COLORS: Record<number, string> = {
    [ProductStatus.PENDING]: 'warning',
    [ProductStatus.APPROVED]: 'success',
    [ProductStatus.REJECTED]: 'error',
};

// Re-export for backward compatibility
export { ProductTemplateType, PRODUCT_TEMPLATE_TYPE_LABELS };
