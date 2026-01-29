import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    PriceCalculationRequest,
    PriceCalculationResult,
    PriceRangeRequest,
    PriceRange,
    MaterialOptionsParams,
    MaterialOptions,
    QuantityTiersResponse,
    ProductTypeInfo,
    SurchargeScopeInfo,
    ProductType,
} from "@/types/pricing";

// =====================================================
// Pricing Service - Smart Pricing Engine API
// =====================================================

export const pricingService = {
    /**
     * POST /api/pricing/calculate
     * Tính giá cho sản phẩm với Smart Pricing Engine
     */
    async calculatePrice(data: PriceCalculationRequest): Promise<PriceCalculationResult> {
        try {
            const response = await apiServer.post<ApiResponse<PriceCalculationResult>>(
                "/pricing/calculate",
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to calculate price");
        } catch (error) {
            console.error("Calculate price failed:", error);
            throw error;
        }
    },

    /**
     * POST /api/pricing/calculate-range
     * Tính khoảng giá đề xuất (min, max, suggested)
     */
    async calculatePriceRange(data: PriceRangeRequest): Promise<PriceRange> {
        try {
            const response = await apiServer.post<ApiResponse<PriceRange>>(
                "/pricing/calculate-range",
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to calculate price range");
        } catch (error) {
            console.error("Calculate price range failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/pricing/material-options
     * Lấy danh sách material options với surcharges
     */
    async getMaterialOptions(params: MaterialOptionsParams): Promise<MaterialOptions> {
        try {
            const response = await apiServer.get<ApiResponse<MaterialOptions>>(
                "/pricing/material-options",
                {
                    params: {
                        sourceMaterialId: params.sourceMaterialId,
                        scope: params.scope,
                        productType: params.productType,
                    },
                }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to get material options");
        } catch (error) {
            console.error("Get material options failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/pricing/quantity-tiers
     * Lấy danh sách quantity pricing tiers
     */
    async getQuantityTiers(productType?: ProductType): Promise<QuantityTiersResponse> {
        try {
            const response = await apiServer.get<ApiResponse<QuantityTiersResponse>>(
                "/pricing/quantity-tiers",
                {
                    params: productType ? { productType } : undefined,
                }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to get quantity tiers");
        } catch (error) {
            console.error("Get quantity tiers failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/pricing/product-types
     * Lấy danh sách product types
     */
    async getProductTypes(): Promise<ProductTypeInfo[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductTypeInfo[]>>(
                "/pricing/product-types"
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get product types failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/pricing/surcharge-scopes
     * Lấy danh sách surcharge scopes
     */
    async getSurchargeScopes(): Promise<SurchargeScopeInfo[]> {
        try {
            const response = await apiServer.get<ApiResponse<SurchargeScopeInfo[]>>(
                "/pricing/surcharge-scopes"
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get surcharge scopes failed:", error);
            throw error;
        }
    },

    // =====================================================
    // PRICING RULES CRUD
    // =====================================================

    async getPricingRules(): Promise<PricingRule[]> {
        try {
            const response = await apiServer.get<ApiResponse<PricingRule[]>>('/pricing/rules');
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get pricing rules failed:', error);
            throw error;
        }
    },

    async createPricingRule(data: CreatePricingRuleRequest): Promise<PricingRule> {
        try {
            const response = await apiServer.post<ApiResponse<PricingRule>>('/pricing/rules', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create pricing rule');
        } catch (error) {
            console.error('Create pricing rule failed:', error);
            throw error;
        }
    },

    async updatePricingRule(id: number, data: UpdatePricingRuleRequest): Promise<PricingRule> {
        try {
            const response = await apiServer.put<ApiResponse<PricingRule>>(`/pricing/rules/${id}`, data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update pricing rule');
        } catch (error) {
            console.error('Update pricing rule failed:', error);
            throw error;
        }
    },

    async deletePricingRule(id: number): Promise<void> {
        try {
            const response = await apiServer.delete<ApiResponse<any>>(`/pricing/rules/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete pricing rule');
            }
        } catch (error) {
            console.error('Delete pricing rule failed:', error);
            throw error;
        }
    },

    async togglePricingRule(id: number): Promise<PricingRule> {
        try {
            const response = await apiServer.patch<ApiResponse<PricingRule>>(`/pricing/rules/${id}/toggle`);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to toggle pricing rule');
        } catch (error) {
            console.error('Toggle pricing rule failed:', error);
            throw error;
        }
    },

    // =====================================================
    // MATERIAL SURCHARGES CRUD
    // =====================================================

    async getMaterialSurcharges(filters?: { sourceMaterialId?: number; targetMaterialId?: number; productType?: number }): Promise<MaterialSurcharge[]> {
        try {
            const response = await apiServer.get<ApiResponse<MaterialSurcharge[]>>('/pricing/material-surcharges', { params: filters });
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get material surcharges failed:', error);
            throw error;
        }
    },

    async createMaterialSurcharge(data: CreateMaterialSurchargeRequest): Promise<MaterialSurcharge> {
        try {
            const response = await apiServer.post<ApiResponse<MaterialSurcharge>>('/pricing/material-surcharges', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create material surcharge');
        } catch (error) {
            console.error('Create material surcharge failed:', error);
            throw error;
        }
    },

    async updateMaterialSurcharge(id: number, data: UpdateMaterialSurchargeRequest): Promise<MaterialSurcharge> {
        try {
            const response = await apiServer.put<ApiResponse<MaterialSurcharge>>(`/pricing/material-surcharges/${id}`, data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update material surcharge');
        } catch (error) {
            console.error('Update material surcharge failed:', error);
            throw error;
        }
    },

    async deleteMaterialSurcharge(id: number): Promise<void> {
        try {
            const response = await apiServer.delete<ApiResponse<any>>(`/pricing/material-surcharges/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete material surcharge');
            }
        } catch (error) {
            console.error('Delete material surcharge failed:', error);
            throw error;
        }
    },

    async toggleMaterialSurcharge(id: number): Promise<MaterialSurcharge> {
        try {
            const response = await apiServer.patch<ApiResponse<MaterialSurcharge>>(`/pricing/material-surcharges/${id}/toggle`);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to toggle material surcharge');
        } catch (error) {
            console.error('Toggle material surcharge failed:', error);
            throw error;
        }
    },

    // =====================================================
    // QUANTITY TIERS CRUD
    // =====================================================

    async createQuantityTier(data: CreateQuantityTierRequest): Promise<QuantityTier> {
        try {
            const response = await apiServer.post<ApiResponse<QuantityTier>>('/pricing/quantity-tiers', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create quantity tier');
        } catch (error) {
            console.error('Create quantity tier failed:', error);
            throw error;
        }
    },

    async updateQuantityTier(id: number, data: UpdateQuantityTierRequest): Promise<QuantityTier> {
        try {
            const response = await apiServer.put<ApiResponse<QuantityTier>>(`/pricing/quantity-tiers/${id}`, data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update quantity tier');
        } catch (error) {
            console.error('Update quantity tier failed:', error);
            throw error;
        }
    },

    async deleteQuantityTier(id: number): Promise<void> {
        try {
            const response = await apiServer.delete<ApiResponse<any>>(`/pricing/quantity-tiers/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete quantity tier');
            }
        } catch (error) {
            console.error('Delete quantity tier failed:', error);
            throw error;
        }
    },

    async toggleQuantityTier(id: number): Promise<QuantityTier> {
        try {
            const response = await apiServer.patch<ApiResponse<QuantityTier>>(`/pricing/quantity-tiers/${id}/toggle`);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to toggle quantity tier');
        } catch (error) {
            console.error('Toggle quantity tier failed:', error);
            throw error;
        }
    },

    // =====================================================
    // SIZE THRESHOLDS CRUD
    // =====================================================

    async getSizeThresholds(filters?: { productType?: number; dimensionType?: number; action?: number }): Promise<SizeThreshold[]> {
        try {
            const response = await apiServer.get<ApiResponse<SizeThreshold[]>>('/pricing/size-thresholds', { params: filters });
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get size thresholds failed:', error);
            throw error;
        }
    },

    async createSizeThreshold(data: CreateSizeThresholdRequest): Promise<SizeThreshold> {
        try {
            const response = await apiServer.post<ApiResponse<SizeThreshold>>('/pricing/size-thresholds', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create size threshold');
        } catch (error) {
            console.error('Create size threshold failed:', error);
            throw error;
        }
    },

    async updateSizeThreshold(id: number, data: UpdateSizeThresholdRequest): Promise<SizeThreshold> {
        try {
            const response = await apiServer.put<ApiResponse<SizeThreshold>>(`/pricing/size-thresholds/${id}`, data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update size threshold');
        } catch (error) {
            console.error('Update size threshold failed:', error);
            throw error;
        }
    },

    async deleteSizeThreshold(id: number): Promise<void> {
        try {
            const response = await apiServer.delete<ApiResponse<any>>(`/pricing/size-thresholds/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete size threshold');
            }
        } catch (error) {
            console.error('Delete size threshold failed:', error);
            throw error;
        }
    },

    async toggleSizeThreshold(id: number): Promise<SizeThreshold> {
        try {
            const response = await apiServer.patch<ApiResponse<SizeThreshold>>(`/pricing/size-thresholds/${id}/toggle`);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to toggle size threshold');
        } catch (error) {
            console.error('Toggle size threshold failed:', error);
            throw error;
        }
    },
};

// =====================================================
// INTERFACES FOR CRUD
// =====================================================

export interface PricingRule {
    id: number;
    templateId: number | null;
    productType: ProductType | null;
    condition: number;
    incrementUnit: number;
    surchargeAmount: number;
    materialModifier: number | null;
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePricingRuleRequest {
    templateId?: number | null;
    productType?: number | null;
    condition: number;
    incrementUnit: number;
    surchargeAmount: number;
    materialModifier?: number | null;
    priority?: number;
}

export interface UpdatePricingRuleRequest {
    templateId?: number | null;
    productType?: number | null;
    condition?: number;
    incrementUnit?: number;
    surchargeAmount?: number;
    materialModifier?: number | null;
    priority?: number;
    isActive?: boolean;
}

export interface MaterialSurcharge {
    id: number;
    sourceMaterialId: number;
    targetMaterialId: number;
    scope: number;
    surchargeAmount: number;
    productType: ProductType | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    sourceMaterial?: { id: number; name: string };
    targetMaterial?: { id: number; name: string };
}

export interface CreateMaterialSurchargeRequest {
    sourceMaterialId: number;
    targetMaterialId: number;
    scope: number;
    surchargeAmount: number;
    productType?: number | null;
}

export interface UpdateMaterialSurchargeRequest {
    sourceMaterialId?: number;
    targetMaterialId?: number;
    scope?: number;
    surchargeAmount?: number;
    productType?: number | null;
    isActive?: boolean;
}

export interface QuantityTier {
    id: number;
    templateId: number | null;
    productType: ProductType | null;
    minQuantity: number;
    maxQuantity: number | null;
    discountPercent: number;
    priceLevel: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuantityTierRequest {
    templateId?: number | null;
    productType?: number | null;
    minQuantity: number;
    maxQuantity?: number | null;
    discountPercent: number;
    priceLevel: number;
}

export interface UpdateQuantityTierRequest {
    templateId?: number | null;
    productType?: number | null;
    minQuantity?: number;
    maxQuantity?: number | null;
    discountPercent?: number;
    priceLevel?: number;
    isActive?: boolean;
}

export interface SizeThreshold {
    id: number;
    productType: ProductType;
    dimensionType: number;
    thresholdValue: number;
    action: number;
    surchargeAmount: number | null;
    message: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSizeThresholdRequest {
    productType: number;
    dimensionType: number;
    thresholdValue: number;
    action: number;
    surchargeAmount?: number | null;
    message?: string | null;
}

export interface UpdateSizeThresholdRequest {
    productType?: number;
    dimensionType?: number;
    thresholdValue?: number;
    action?: number;
    surchargeAmount?: number | null;
    message?: string | null;
    isActive?: boolean;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export enum PricingCondition {
    SIZE_INCREMENT = 1,
    MATERIAL_CHANGE = 2
}

export enum MaterialModifier {
    WOOD_STEEL = 1,
    STONE = 2,
    ALL = 3
}

export enum SurchargeScope {
    SEAT_ONLY = 1,
    FULL = 2
}

export enum PriceLevel {
    RETAIL = 1,
    WHOLESALE = 2,
    BULK = 3
}

export enum DimensionType {
    WIDTH = 1,
    LENGTH = 2,
    HEIGHT = 3
}

export enum ThresholdAction {
    AUTO_SURCHARGE = 1,
    WARNING = 2,
    MANUAL_QUOTE = 3
}

export const getPricingConditionLabel = (condition: number): string => {
    switch (condition) {
        case PricingCondition.SIZE_INCREMENT: return 'Tăng kích thước';
        case PricingCondition.MATERIAL_CHANGE: return 'Đổi vật liệu';
        default: return 'Không xác định';
    }
};

export const getMaterialModifierLabel = (modifier: number | null): string => {
    if (!modifier) return 'Tất cả';
    switch (modifier) {
        case MaterialModifier.WOOD_STEEL: return 'Gỗ/Sắt';
        case MaterialModifier.STONE: return 'Đá';
        case MaterialModifier.ALL: return 'Tất cả';
        default: return 'Không xác định';
    }
};

export const getSurchargeScopeLabel = (scope: number): string => {
    switch (scope) {
        case SurchargeScope.SEAT_ONLY: return 'Chỉ nệm ngồi';
        case SurchargeScope.FULL: return 'Toàn bộ';
        default: return 'Không xác định';
    }
};

export const getPriceLevelLabel = (level: number): string => {
    switch (level) {
        case PriceLevel.RETAIL: return 'Bán lẻ';
        case PriceLevel.WHOLESALE: return 'Bán sỉ';
        case PriceLevel.BULK: return 'Đại lý';
        default: return 'Không xác định';
    }
};

export const getProductTypeLabelPricing = (type: number | null): string => {
    if (!type) return 'Tất cả';
    switch (type) {
        case 1: return 'Ghế';
        case 2: return 'Bàn';
        case 3: return 'Sofa';
        case 4: return 'Giường';
        case 5: return 'Tủ';
        default: return 'Không xác định';
    }
};

export const getDimensionTypeLabel = (type: number): string => {
    switch (type) {
        case DimensionType.WIDTH: return 'Chiều rộng';
        case DimensionType.LENGTH: return 'Chiều dài';
        case DimensionType.HEIGHT: return 'Chiều cao';
        default: return 'Không xác định';
    }
};

export const getThresholdActionLabel = (action: number): string => {
    switch (action) {
        case ThresholdAction.AUTO_SURCHARGE: return 'Tự động cộng phí';
        case ThresholdAction.WARNING: return 'Hiển thị cảnh báo';
        case ThresholdAction.MANUAL_QUOTE: return 'Báo giá thủ công';
        default: return 'Không xác định';
    }
};

export default pricingService;

