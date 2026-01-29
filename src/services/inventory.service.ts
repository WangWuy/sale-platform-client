import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    Inventory,
    InventoryStats,
    InventoryFilterParams,
    InventoryResponse,
    CreateInventoryRequest,
    UpdateInventoryRequest,
    AdjustInventoryRequest,
} from "@/types/inventory";

// =====================================================
// Inventory Service - Quản lý Inventory API
// =====================================================

export const inventoryService = {
    /**
     * GET /api/inventory/stats
     * Lấy thống kê tồn kho
     */
    async getStats(): Promise<InventoryStats> {
        try {
            const response = await apiServer.get<ApiResponse<InventoryStats>>("/inventory/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                totalItems: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                totalQuantity: 0,
            };
        } catch (error) {
            console.error("Get inventory stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/inventory/low-stock
     * Lấy danh sách sản phẩm sắp hết hàng
     */
    async getLowStock(): Promise<Inventory[]> {
        try {
            const response = await apiServer.get<ApiResponse<Inventory[]>>("/inventory/low-stock");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get low stock items failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/inventory/out-of-stock
     * Lấy danh sách sản phẩm hết hàng
     */
    async getOutOfStock(): Promise<Inventory[]> {
        try {
            const response = await apiServer.get<ApiResponse<Inventory[]>>("/inventory/out-of-stock");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get out of stock items failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/inventory
     * Lấy danh sách inventory với pagination và filters
     */
    async getInventory(params?: InventoryFilterParams): Promise<InventoryResponse> {
        try {
            const response = await apiServer.get<ApiResponse<InventoryResponse>>("/inventory", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    productId: params?.productId,
                    location: params?.location,
                    lowStock: params?.lowStock,
                    outOfStock: params?.outOfStock,
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                inventory: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get inventory failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/inventory/:id
     * Lấy chi tiết inventory
     */
    async getInventoryById(id: number): Promise<Inventory | null> {
        try {
            const response = await apiServer.get<ApiResponse<Inventory>>(`/inventory/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get inventory ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/inventory/product/:productId
     * Lấy inventory theo product ID
     */
    async getInventoryByProductId(productId: number): Promise<Inventory | null> {
        try {
            const response = await apiServer.get<ApiResponse<Inventory>>(
                `/inventory/product/${productId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get inventory for product ${productId} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/inventory
     * Tạo hoặc cập nhật inventory
     */
    async createOrUpdateInventory(data: CreateInventoryRequest): Promise<Inventory> {
        try {
            const response = await apiServer.post<ApiResponse<Inventory>>("/inventory", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create inventory");
        } catch (error) {
            console.error("Create inventory failed:", error);
            throw error;
        }
    },

    /**
     * POST /api/inventory/adjust
     * Điều chỉnh số lượng inventory (thêm hoặc bớt)
     */
    async adjustInventory(data: AdjustInventoryRequest): Promise<Inventory> {
        try {
            const response = await apiServer.post<ApiResponse<Inventory>>(
                "/inventory/adjust",
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to adjust inventory");
        } catch (error) {
            console.error("Adjust inventory failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/inventory/:id
     * Cập nhật inventory
     */
    async updateInventory(id: number, data: UpdateInventoryRequest): Promise<Inventory> {
        try {
            const response = await apiServer.put<ApiResponse<Inventory>>(`/inventory/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update inventory");
        } catch (error) {
            console.error(`Update inventory ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/inventory/:id
     * Xóa inventory
     */
    async deleteInventory(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/inventory/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete inventory ${id} failed:`, error);
            throw error;
        }
    },
};

export default inventoryService;
