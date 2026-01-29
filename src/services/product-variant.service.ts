import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    ProductVariant,
    VariantFilterParams,
    VariantsResponse,
    CreateVariantRequest,
    UpdateVariantRequest,
    VariantPriceRange,
} from "@/types/product-variant";

// =====================================================
// Product Variant Service - Quản lý Product Variants API
// =====================================================

export const productVariantService = {
    /**
     * GET /api/product-variants/product/:productId
     * Lấy variants của sản phẩm
     */
    async getVariantsByProduct(productId: number): Promise<ProductVariant[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductVariant[]>>(
                `/product-variants/product/${productId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get variants for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-variants/product/:productId/count
     * Đếm số variants của sản phẩm
     */
    async getVariantCount(productId: number): Promise<number> {
        try {
            const response = await apiServer.get<ApiResponse<{ count: number }>>(
                `/product-variants/product/${productId}/count`
            );

            if (response.data.success && response.data.data) {
                return response.data.data.count;
            }

            return 0;
        } catch (error) {
            console.error(`Get variant count for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-variants/product/:productId/price-range
     * Lấy khoảng giá của variants
     */
    async getPriceRange(productId: number): Promise<VariantPriceRange> {
        try {
            const response = await apiServer.get<ApiResponse<VariantPriceRange>>(
                `/product-variants/product/${productId}/price-range`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return { min: 0, max: 0 };
        } catch (error) {
            console.error(`Get price range for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-variants
     * Lấy danh sách variants với pagination
     */
    async getVariants(params?: VariantFilterParams): Promise<VariantsResponse> {
        try {
            const response = await apiServer.get<ApiResponse<VariantsResponse>>("/product-variants", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    productId: params?.productId,
                    materialId: params?.materialId,
                    search: params?.search,
                    minPrice: params?.minPrice,
                    maxPrice: params?.maxPrice,
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                variants: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get variants failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/product-variants/:id
     * Lấy chi tiết variant
     */
    async getVariantById(id: number): Promise<ProductVariant | null> {
        try {
            const response = await apiServer.get<ApiResponse<ProductVariant>>(`/product-variants/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get variant ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/product-variants
     * Tạo variant mới
     */
    async createVariant(data: CreateVariantRequest): Promise<ProductVariant> {
        try {
            const response = await apiServer.post<ApiResponse<ProductVariant>>("/product-variants", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create variant");
        } catch (error) {
            console.error("Create variant failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/product-variants/:id
     * Cập nhật variant
     */
    async updateVariant(id: number, data: UpdateVariantRequest): Promise<ProductVariant> {
        try {
            const response = await apiServer.put<ApiResponse<ProductVariant>>(`/product-variants/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update variant");
        } catch (error) {
            console.error(`Update variant ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/product-variants/:id
     * Xóa variant
     */
    async deleteVariant(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/product-variants/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete variant ${id} failed:`, error);
            throw error;
        }
    },
};

export default productVariantService;
