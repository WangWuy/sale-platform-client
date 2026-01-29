import apiServer from '@/lib/api';
import { ApiResponse } from '@/types/api-response.model';
import {
    Product,
    ProductListParams,
    ProductListResponse,
    CreateProductRequest,
    UpdateProductRequest
} from '@/types/product';

// =====================================================
// Product Service - Quản lý Products API
// =====================================================

export const productService = {
    /**
     * GET /api/products
     * Lấy danh sách products với pagination và filters
     */
    async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
        try {
            const response = await apiServer.get<ApiResponse<ProductListResponse>>('/products', {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    search: params?.search,
                    categoryId: params?.categoryId,
                    materialId: params?.materialId,
                    status: params?.status,
                    sortBy: params?.sortBy || 'createdAt',
                    sortOrder: params?.sortOrder || 'DESC'
                }
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            // Return empty result if no data
            return {
                products: [],
                total: 0,
                page: params?.page || 1,
                limit: params?.limit || 20,
                totalPages: 0
            };
        } catch (error) {
            console.error('Get products failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/products/:id
     * Lấy chi tiết một product
     */
    async getProductById(id: number): Promise<Product | null> {
        try {
            const response = await apiServer.get<ApiResponse<Product>>(`/products/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Get product ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/products
     * Tạo product mới
     */
    async createProduct(data: CreateProductRequest): Promise<Product | null> {
        try {
            const response = await apiServer.post<ApiResponse<Product>>('/products', data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Create product failed:', error);
            throw error;
        }
    },

    /**
     * PUT /api/products/:id
     * Cập nhật product
     */
    async updateProduct(id: number, data: UpdateProductRequest): Promise<Product | null> {
        try {
            const response = await apiServer.put<ApiResponse<Product>>(`/products/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Update product ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/products/:id
     * Xóa product (soft delete)
     */
    async deleteProduct(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/products/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete product ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/products/stats
     * Lấy thống kê products
     */
    async getProductStats(): Promise<{
        totalProducts: number;
        lowStock: number;
        totalValue: number;
        categories: number;
    }> {
        try {
            const response = await apiServer.get<ApiResponse<{
                totalProducts: number;
                lowStock: number;
                totalValue: number;
                categories: number;
            }>>('/products/stats');

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                totalProducts: 0,
                lowStock: 0,
                totalValue: 0,
                categories: 0
            };
        } catch (error) {
            console.error('Get product stats failed:', error);
            throw error;
        }
    }
};

export default productService;
