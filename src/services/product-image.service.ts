import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    ProductImage,
    CreateImageRequest,
    ReorderImagesRequest,
} from "@/types/product-image";

// =====================================================
// Product Image Service - Quản lý Product Images API
// =====================================================

export const productImageService = {
    /**
     * GET /api/product-images/product/:productId
     * Lấy ảnh của sản phẩm
     */
    async getImagesByProduct(productId: number): Promise<ProductImage[]> {
        try {
            const response = await apiServer.get<ApiResponse<ProductImage[]>>(
                `/product-images/product/${productId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get images for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-images/product/:productId/primary
     * Lấy ảnh chính của sản phẩm
     */
    async getPrimaryImage(productId: number): Promise<ProductImage | null> {
        try {
            const response = await apiServer.get<ApiResponse<ProductImage>>(
                `/product-images/product/${productId}/primary`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get primary image for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-images/product/:productId/count
     * Đếm số ảnh của sản phẩm
     */
    async getImageCount(productId: number): Promise<number> {
        try {
            const response = await apiServer.get<ApiResponse<{ count: number }>>(
                `/product-images/product/${productId}/count`
            );

            if (response.data.success && response.data.data) {
                return response.data.data.count;
            }

            return 0;
        } catch (error) {
            console.error(`Get image count for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/product-images/:id
     * Lấy chi tiết ảnh
     */
    async getImageById(id: number): Promise<ProductImage | null> {
        try {
            const response = await apiServer.get<ApiResponse<ProductImage>>(`/product-images/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get image ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/product-images
     * Thêm ảnh mới
     */
    async addImage(data: CreateImageRequest): Promise<ProductImage> {
        try {
            const response = await apiServer.post<ApiResponse<ProductImage>>("/product-images", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to add image");
        } catch (error) {
            console.error("Add image failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/product-images/:id/set-primary
     * Đặt ảnh chính
     */
    async setPrimaryImage(id: number, productId: number): Promise<ProductImage> {
        try {
            const response = await apiServer.put<ApiResponse<ProductImage>>(
                `/product-images/${id}/set-primary`,
                { productId }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to set primary image");
        } catch (error) {
            console.error(`Set primary image ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * PUT /api/product-images/:id/order
     * Cập nhật thứ tự hiển thị
     */
    async updateDisplayOrder(id: number, displayOrder: number): Promise<ProductImage> {
        try {
            const response = await apiServer.put<ApiResponse<ProductImage>>(
                `/product-images/${id}/order`,
                { displayOrder }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update display order");
        } catch (error) {
            console.error(`Update display order for image ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * PUT /api/product-images/product/:productId/reorder
     * Sắp xếp lại tất cả ảnh
     */
    async reorderImages(productId: number, imageIds: number[]): Promise<boolean> {
        try {
            const response = await apiServer.put<ApiResponse<void>>(
                `/product-images/product/${productId}/reorder`,
                { imageIds } as ReorderImagesRequest
            );

            return response.data.success;
        } catch (error) {
            console.error(`Reorder images for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/product-images/:id
     * Xóa ảnh
     */
    async deleteImage(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/product-images/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete image ${id} failed:`, error);
            throw error;
        }
    },
};

export default productImageService;
