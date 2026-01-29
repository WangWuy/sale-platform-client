import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    DesignTag,
    DesignTagStats,
    TagBehaviorInfo,
    TagFilterParams,
    TagsResponse,
    CreateTagRequest,
    UpdateTagRequest,
} from "@/types/design-tag";

// =====================================================
// Design Tag Service - Quản lý Design Tags API
// =====================================================

export const designTagService = {
    /**
     * GET /api/design-tags/stats
     * Lấy thống kê tags
     */
    async getStats(): Promise<DesignTagStats> {
        try {
            const response = await apiServer.get<ApiResponse<DesignTagStats>>("/design-tags/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return { countByBehavior: [] };
        } catch (error) {
            console.error("Get design tag stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/design-tags/behaviors
     * Lấy danh sách loại behavior
     */
    async getBehaviors(): Promise<TagBehaviorInfo[]> {
        try {
            const response = await apiServer.get<ApiResponse<TagBehaviorInfo[]>>("/design-tags/behaviors");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get tag behaviors failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/design-tags/all
     * Lấy tất cả tags active
     */
    async getAllTags(): Promise<DesignTag[]> {
        try {
            const response = await apiServer.get<ApiResponse<DesignTag[]>>("/design-tags/all");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get all design tags failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/design-tags
     * Lấy danh sách tags với pagination
     */
    async getTags(params?: TagFilterParams): Promise<TagsResponse> {
        try {
            const response = await apiServer.get<ApiResponse<TagsResponse>>("/design-tags", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    search: params?.search,
                    behavior: params?.behavior,
                    isActive: params?.isActive,
                    sortBy: params?.sortBy || "name",
                    sortOrder: params?.sortOrder || "asc",
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                tags: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get design tags failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/design-tags/:id
     * Lấy chi tiết tag
     */
    async getTagById(id: number): Promise<DesignTag | null> {
        try {
            const response = await apiServer.get<ApiResponse<DesignTag>>(`/design-tags/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get design tag ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/design-tags
     * Tạo tag mới
     */
    async createTag(data: CreateTagRequest): Promise<DesignTag> {
        try {
            const response = await apiServer.post<ApiResponse<DesignTag>>("/design-tags", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create design tag");
        } catch (error) {
            console.error("Create design tag failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/design-tags/:id
     * Cập nhật tag
     */
    async updateTag(id: number, data: UpdateTagRequest): Promise<DesignTag> {
        try {
            const response = await apiServer.put<ApiResponse<DesignTag>>(`/design-tags/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update design tag");
        } catch (error) {
            console.error(`Update design tag ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/design-tags/:id
     * Xóa tag
     */
    async deleteTag(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/design-tags/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete design tag ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/design-tags/product/:productId
     * Lấy tags của sản phẩm
     */
    async getTagsForProduct(productId: number): Promise<DesignTag[]> {
        try {
            const response = await apiServer.get<ApiResponse<DesignTag[]>>(
                `/design-tags/product/${productId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get tags for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/design-tags/product/:productId/tag/:tagId
     * Gắn tag vào sản phẩm
     */
    async addTagToProduct(productId: number, tagId: number): Promise<boolean> {
        try {
            const response = await apiServer.post<ApiResponse<void>>(
                `/design-tags/product/${productId}/tag/${tagId}`
            );
            return response.data.success;
        } catch (error) {
            console.error(`Add tag ${tagId} to product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/design-tags/product/:productId/tag/:tagId
     * Gỡ tag khỏi sản phẩm
     */
    async removeTagFromProduct(productId: number, tagId: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(
                `/design-tags/product/${productId}/tag/${tagId}`
            );
            return response.data.success;
        } catch (error) {
            console.error(`Remove tag ${tagId} from product ${productId} failed:`, error);
            throw error;
        }
    },
};

export default designTagService;
