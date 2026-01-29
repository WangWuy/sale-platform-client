import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import { ProductType, ProductTypeInfo } from "@/types/pricing";
import {
    ProductTemplate,
    TemplateStats,
    TemplateFilterParams,
    TemplatesResponse,
    CreateTemplateRequest,
    UpdateTemplateRequest,
} from "@/types/product-template";

// =====================================================
// Product Template Service - Quản lý Product Templates API
// =====================================================

export const productTemplateService = {
    /**
     * GET /api/product-templates/stats
     * Lấy thống kê mẫu sản phẩm
     */
    async getStats(): Promise<TemplateStats> {
        try {
            const response = await apiServer.get<ApiResponse<TemplateStats>>("/product-templates/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return { totalTemplates: 0, countByProductType: [] };
        } catch (error) {
            console.error("Get template stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/product-templates/product-types
     * Lấy danh sách loại sản phẩm
     */
    async getProductTypes(): Promise<ProductTypeInfo[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductTypeInfo[]>>("/product-templates/product-types");

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
     * GET /api/product-templates/all
     * Lấy tất cả templates active
     */
    async getAllTemplates(): Promise<ProductTemplate[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductTemplate[]>>("/product-templates/all");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get all templates failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/product-templates
     * Lấy danh sách templates với pagination
     */
    async getTemplates(params?: TemplateFilterParams): Promise<TemplatesResponse> {
        try {
            const response = await apiServer.get<ApiResponse<TemplatesResponse>>("/product-templates", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    search: params?.search,
                    categoryId: params?.categoryId,
                    productType: params?.productType,
                    isActive: params?.isActive,
                    sortBy: params?.sortBy || "name",
                    sortOrder: params?.sortOrder || "asc",
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                templates: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get templates failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/product-templates/by-type/:productType
     * Lấy templates theo loại sản phẩm
     */
    async getTemplatesByType(productType: ProductType): Promise<ProductTemplate[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductTemplate[]>>(
                `/product-templates/by-type/${productType}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get templates by type ${productType} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-templates/by-category/:categoryId
     * Lấy templates theo danh mục
     */
    async getTemplatesByCategory(categoryId: number): Promise<ProductTemplate[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductTemplate[]>>(
                `/product-templates/by-category/${categoryId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get templates by category ${categoryId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-templates/:id
     * Lấy chi tiết template
     */
    async getTemplateById(id: number): Promise<ProductTemplate | null> {
        try {
            const response = await apiServer.get<ApiResponse<ProductTemplate>>(`/product-templates/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get template ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/product-templates
     * Tạo template mới
     */
    async createTemplate(data: CreateTemplateRequest): Promise<ProductTemplate> {
        try {
            const response = await apiServer.post<ApiResponse<ProductTemplate>>("/product-templates", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create template");
        } catch (error) {
            console.error("Create template failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/product-templates/:id
     * Cập nhật template
     */
    async updateTemplate(id: number, data: UpdateTemplateRequest): Promise<ProductTemplate> {
        try {
            const response = await apiServer.put<ApiResponse<ProductTemplate>>(`/product-templates/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update template");
        } catch (error) {
            console.error(`Update template ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * PUT /api/product-templates/:id/toggle-active
     * Bật/tắt trạng thái active
     */
    async toggleActive(id: number, isActive: boolean): Promise<ProductTemplate> {
        try {
            const response = await apiServer.put<ApiResponse<ProductTemplate>>(
                `/product-templates/${id}/toggle-active`,
                { isActive }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to toggle template active status");
        } catch (error) {
            console.error(`Toggle template ${id} active failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/product-templates/:id
     * Xóa template
     */
    async deleteTemplate(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/product-templates/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete template ${id} failed:`, error);
            throw error;
        }
    },
};

export default productTemplateService;
