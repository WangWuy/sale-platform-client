// =====================================================
// Product Variant Types - Types cho Product Variants API
// =====================================================

export interface VariantDimensions {
    length: number;
    width: number;
    height: number;
    unit?: string;
}

export interface ProductVariant {
    id: number;
    productId: number;
    materialId?: number | null;
    variantName: string;
    sku?: string | null;
    dimensions?: VariantDimensions | null;
    price: string;
    notes?: string | null;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface VariantFilterParams {
    page?: number;
    limit?: number;
    productId?: number;
    materialId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface VariantsResponse {
    variants: ProductVariant[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateVariantRequest {
    productId: number;
    variantName: string;
    price: number;
    sku?: string;
    materialId?: number;
    dimensions?: VariantDimensions;
    notes?: string;
}

export interface UpdateVariantRequest {
    variantName?: string;
    price?: number;
    sku?: string;
    materialId?: number;
    dimensions?: VariantDimensions;
    notes?: string;
}

export interface VariantPriceRange {
    min: number;
    max: number;
}
