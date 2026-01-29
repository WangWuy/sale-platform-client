import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    Supplier,
    SupplierStats,
    SupplierFilterParams,
    SuppliersResponse,
    CreateSupplierRequest,
    UpdateSupplierRequest,
} from "@/types/supplier";

// =====================================================
// Supplier Service - Quản lý Suppliers API
// =====================================================

export const supplierService = {
    /**
     * GET /api/suppliers/stats
     * Lấy thống kê nhà cung cấp
     */
    async getStats(): Promise<SupplierStats> {
        try {
            const response = await apiServer.get<ApiResponse<SupplierStats>>("/suppliers/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return { totalSuppliers: 0 };
        } catch (error) {
            console.error("Get supplier stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/suppliers/all
     * Lấy tất cả nhà cung cấp (cho dropdown)
     */
    async getAllSuppliers(): Promise<Supplier[]> {
        try {
            const response = await apiServer.get<ApiResponse<Supplier[]>>("/suppliers/all");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get all suppliers failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/suppliers
     * Lấy danh sách nhà cung cấp với pagination
     */
    async getSuppliers(params?: SupplierFilterParams): Promise<SuppliersResponse> {
        try {
            const response = await apiServer.get<ApiResponse<SuppliersResponse>>("/suppliers", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    search: params?.search,
                    name: params?.name,
                    sortBy: params?.sortBy || "name",
                    sortOrder: params?.sortOrder || "asc",
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                suppliers: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get suppliers failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/suppliers/:id
     * Lấy chi tiết nhà cung cấp
     */
    async getSupplierById(id: number): Promise<Supplier | null> {
        try {
            const response = await apiServer.get<ApiResponse<Supplier>>(`/suppliers/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get supplier ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/suppliers
     * Tạo nhà cung cấp mới
     */
    async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
        try {
            const response = await apiServer.post<ApiResponse<Supplier>>("/suppliers", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create supplier");
        } catch (error) {
            console.error("Create supplier failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/suppliers/:id
     * Cập nhật nhà cung cấp
     */
    async updateSupplier(id: number, data: UpdateSupplierRequest): Promise<Supplier> {
        try {
            const response = await apiServer.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update supplier");
        } catch (error) {
            console.error(`Update supplier ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/suppliers/:id
     * Xóa nhà cung cấp
     */
    async deleteSupplier(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/suppliers/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete supplier ${id} failed:`, error);
            throw error;
        }
    },
};

export default supplierService;
