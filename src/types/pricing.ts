// =====================================================
// Pricing Types - Types cho Smart Pricing API
// =====================================================

// ==================== Enums ====================

export enum ProductType {
    TABLE = 1,
    CHAIR = 2,
    SOFA = 3,
    CABINET = 4,
    SHELF = 5,
}

export const PRODUCT_TYPE_NAMES: Record<ProductType, string> = {
    [ProductType.TABLE]: "Bàn",
    [ProductType.CHAIR]: "Ghế",
    [ProductType.SOFA]: "Sofa",
    [ProductType.CABINET]: "Tủ",
    [ProductType.SHELF]: "Kệ",
};

export enum SurchargeScope {
    SEAT_ONLY = 1,
    FULL = 2,
}

export const SURCHARGE_SCOPE_NAMES: Record<SurchargeScope, string> = {
    [SurchargeScope.SEAT_ONLY]: "Chỉ nệm ngồi",
    [SurchargeScope.FULL]: "Cả nệm và tựa",
};

export enum PriceLevel {
    RETAIL = 1,
    WHOLESALE = 2,
    BULK = 3,
}

export const PRICE_LEVEL_NAMES: Record<PriceLevel, string> = {
    [PriceLevel.RETAIL]: "Bán lẻ",
    [PriceLevel.WHOLESALE]: "Bán sỉ",
    [PriceLevel.BULK]: "Đơn hàng lớn",
};

// ==================== Request Types ====================

export interface CustomDimensions {
    width?: number;
    length?: number;
    height?: number;
    unit?: string;
}

export interface PriceCalculationRequest {
    productId: number;
    quantity: number;
    customDimensions?: CustomDimensions;
    materialOverride?: number;
    productType?: ProductType;
}

export interface PriceRangeRequest {
    productId: number;
    quantity?: number;
}

export interface MaterialOptionsParams {
    sourceMaterialId: number;
    scope: SurchargeScope;
    productType?: ProductType;
}

// ==================== Response Types ====================

export interface PriceBreakdown {
    basePrice: number;
    quantityDiscount: number;
    quantityDiscountPercent: number;
    sizeAdjustment: number;
    materialAdjustment: number;
    thresholdSurcharges: number;
}

export interface PriceCalculationResult {
    basePrice: number;
    finalPrice: number;
    breakdown: PriceBreakdown;
    priceLevel: PriceLevel;
    priceLevelName: string;
    warnings: string[];
    thresholdDetails: unknown[];
}

export interface PriceRange {
    min: number;
    max: number;
    suggested: number;
}

export interface MaterialOptions {
    sourceMaterialId: number;
    scope: SurchargeScope;
    scopeName: string;
    options: Record<string, number>; // materialId -> surcharge amount
}

export interface QuantityTier {
    minQuantity: number;
    maxQuantity: number | null;
    discountPercent: number;
    priceLevel: PriceLevel;
    priceLevelName: string;
}

export interface QuantityTiersResponse {
    productType: ProductType;
    tiers: QuantityTier[];
}

export interface ProductTypeInfo {
    id: ProductType;
    name: string;
    code: string;
}

export interface SurchargeScopeInfo {
    id: SurchargeScope;
    name: string;
    code: string;
}
