import { z } from 'zod';

// =====================================================
// PRICING RULE SCHEMA
// =====================================================
export const pricingRuleSchema = z.object({
    templateId: z.number().nullable().optional(),
    productType: z.number().nullable().optional(),
    condition: z.number().min(1, 'Vui lòng chọn điều kiện'),
    incrementUnit: z.number().min(1, 'Đơn vị tăng phải >= 1'),
    surchargeAmount: z.number().min(0, 'Phụ phí phải >= 0'),
    materialModifier: z.number().nullable().optional(),
    priority: z.number().min(1).default(1),
});

export type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

// =====================================================
// MATERIAL SURCHARGE SCHEMA
// =====================================================
export const materialSurchargeSchema = z.object({
    sourceMaterialId: z.number().min(1, 'Vui lòng chọn vật liệu nguồn'),
    targetMaterialId: z.number().min(1, 'Vui lòng chọn vật liệu đích'),
    scope: z.number().min(1, 'Vui lòng chọn phạm vi'),
    surchargeAmount: z.number().min(0, 'Phụ phí phải >= 0'),
    productType: z.number().nullable().optional(),
});

export type MaterialSurchargeFormData = z.infer<typeof materialSurchargeSchema>;

// =====================================================
// QUANTITY TIER SCHEMA
// =====================================================
export const quantityTierSchema = z.object({
    templateId: z.number().nullable().optional(),
    productType: z.number().nullable().optional(),
    minQuantity: z.number().min(1, 'Số lượng tối thiểu phải >= 1'),
    maxQuantity: z.number().nullable().optional(),
    discountPercent: z.number().min(0).max(100, 'Phần trăm phải từ 0-100'),
    priceLevel: z.number().min(1, 'Vui lòng chọn mức giá'),
});

export type QuantityTierFormData = z.infer<typeof quantityTierSchema>;

// =====================================================
// SIZE THRESHOLD SCHEMA
// =====================================================
export const sizeThresholdSchema = z.object({
    productType: z.number().min(1, 'Vui lòng chọn loại sản phẩm'),
    dimensionType: z.number().min(1, 'Vui lòng chọn loại chiều'),
    thresholdValue: z.number().min(1, 'Ngưỡng phải >= 1'),
    action: z.number().min(1, 'Vui lòng chọn hành động'),
    surchargeAmount: z.number().nullable().optional(),
    message: z.string().max(500).optional(),
});

export type SizeThresholdFormData = z.infer<typeof sizeThresholdSchema>;
