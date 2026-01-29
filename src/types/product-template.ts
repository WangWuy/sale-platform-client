// =====================================================
// Product Template Types - Types cho Product Templates API
// =====================================================

// Product Template Type Enum (STANDARD, CUSTOM, BUNDLE)
export enum ProductTemplateType {
    STANDARD = 1,
    CUSTOM = 2,
    BUNDLE = 3
}

export const PRODUCT_TEMPLATE_TYPE_LABELS: Record<ProductTemplateType, string> = {
    [ProductTemplateType.STANDARD]: 'Tiêu chuẩn',
    [ProductTemplateType.CUSTOM]: 'Tùy chỉnh',
    [ProductTemplateType.BUNDLE]: 'Combo',
};

import { ProductType } from './pricing';

export interface DefaultMaterial {
    materialId: number;
    name: string;
}

export interface ProductTemplate {
    id: number;
    name: string;
    categoryId: number;
    productType: ProductType;
    basePrice: string;
    baseSize: string;
    baseSizeValue: number;
    defaultMaterials?: DefaultMaterial[] | null;
    description?: string | null;
    isActive: boolean;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateStats {
    totalTemplates: number;
    countByProductType: {
        productType: ProductType;
        productTypeName: string;
        count: number;
    }[];
}

export interface TemplateFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    productType?: ProductType;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface TemplatesResponse {
    templates: ProductTemplate[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateTemplateRequest {
    name: string;
    categoryId: number;
    productType: ProductType;
    basePrice: number;
    baseSize: string;
    baseSizeValue: number;
    defaultMaterials?: DefaultMaterial[];
    description?: string;
}

export interface UpdateTemplateRequest {
    name?: string;
    categoryId?: number;
    productType?: ProductType;
    basePrice?: number;
    baseSize?: string;
    baseSizeValue?: number;
    defaultMaterials?: DefaultMaterial[];
    description?: string;
    isActive?: boolean;
}
