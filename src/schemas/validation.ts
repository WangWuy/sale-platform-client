import { z } from 'zod';

/**
 * Material Validation Schema
 */
export const materialSchema = z.object({
    name: z.string()
        .min(2, 'Tên vật liệu phải có ít nhất 2 ký tự')
        .max(100, 'Tên vật liệu không được vượt quá 100 ký tự')
        .trim(),
    supplierId: z.number().nullable().optional(),
    materialGroup: z.number()
        .min(1, 'Vui lòng chọn nhóm vật liệu')
        .max(2, 'Nhóm vật liệu không hợp lệ')
        .optional(),
    tier: z.number()
        .min(1, 'Vui lòng chọn phân khúc')
        .max(5, 'Phân khúc không hợp lệ')
        .optional(),
    costPerUnit: z.number()
        .min(0, 'Giá mỗi đơn vị không được âm')
        .max(2147483647, 'Giá không được vượt quá 2,147,483,647 VND'),
    unit: z.string()
        .min(1, 'Vui lòng chọn đơn vị')
        .optional(),
    description: z.string()
        .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
        .optional()
});

export type MaterialFormData = z.infer<typeof materialSchema>;

/**
 * Category Validation Schema
 */
export const categorySchema = z.object({
    name: z.string()
        .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
        .max(50, 'Tên danh mục không được vượt quá 50 ký tự')
        .trim(),
    description: z.string()
        .max(500, 'Mô tả không được vượt quá 500 ký tự')
        .optional()
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Supplier Validation Schema
 */
export const supplierSchema = z.object({
    name: z.string()
        .min(2, 'Tên nhà cung cấp phải có ít nhất 2 ký tự')
        .max(100, 'Tên nhà cung cấp không được vượt quá 100 ký tự')
        .trim(),
    contact: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    phone: z.string()
        .regex(/^[\d\s\-\+\(\)]+$/, 'Số điện thoại không hợp lệ')
        .min(8, 'Số điện thoại phải có ít nhất 8 ký tự')
        .optional()
        .or(z.literal('')),
    email: z.string()
        .email('Email không hợp lệ')
        .optional()
        .or(z.literal(''))
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

/**
 * Product Validation Schema
 */
export const productSchema = z.object({
    name: z.string()
        .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
        .trim(),
    categoryId: z.number()
        .min(1, 'Vui lòng chọn danh mục'),
    materialId: z.number()
        .min(1, 'Vui lòng chọn vật liệu'),
    basePrice: z.number()
        .min(0, 'Giá gốc không được âm'),
    currentPrice: z.number()
        .min(0, 'Giá hiện tại không được âm'),
    minPrice: z.number()
        .min(0, 'Giá tối thiểu không được âm')
        .optional(),
    maxPrice: z.number()
        .min(0, 'Giá tối đa không được âm')
        .optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    originalId: z.number().optional(),
    feature: z.string().optional(),
    status: z.enum(['active', 'inactive', 'discontinued']).optional(),
    dimensions: z.object({
        length: z.number().min(0).optional(),
        width: z.number().min(0).optional(),
        height: z.number().min(0).optional(),
        unit: z.enum(['cm', 'm']).optional()
    }).optional()
}).refine(
    (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
    {
        message: 'Giá tối thiểu không được lớn hơn giá tối đa',
        path: ['minPrice']
    }
);

export type ProductFormData = z.infer<typeof productSchema>;

/**
 * Customer Validation Schema
 */
export const customerSchema = z.object({
    name: z.string()
        .min(2, 'Tên khách hàng phải có ít nhất 2 ký tự')
        .max(100, 'Tên khách hàng không được vượt quá 100 ký tự')
        .trim(),
    email: z.string()
        .email('Email không hợp lệ')
        .optional()
        .or(z.literal('')),
    phone: z.string()
        .regex(/^[\d\s\-\+\(\)]+$/, 'Số điện thoại không hợp lệ')
        .min(8, 'Số điện thoại phải có ít nhất 8 ký tự')
        .optional()
        .or(z.literal('')),
    address: z.string()
        .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
        .optional(),
    customerType: z.string().optional(),
    notes: z.string()
        .max(1000, 'Ghi chú không được vượt quá 1000 ký tự')
        .optional()
});

export type CustomerFormData = z.infer<typeof customerSchema>;
