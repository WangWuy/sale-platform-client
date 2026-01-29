import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";

export interface Material {
    id: number;
    name: string;
    supplierId?: number | null;
    materialGroup: number;  // 1=UPHOLSTERY, 2=STRUCTURE
    tier: number;           // 1=BUDGET, 2=STANDARD, 3=BASE, 4=MID, 5=PREMIUM
    costPerUnit: number;
    unit: string;           // piece, m2, kg, meter
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMaterialRequest {
    name: string;
    supplierId?: number | null;
    materialGroup?: number;
    tier?: number;
    costPerUnit: number;
    unit?: string;
    description?: string | null;
}

export interface UpdateMaterialRequest {
    name?: string;
    supplierId?: number | null;
    materialGroup?: number;
    tier?: number;
    costPerUnit?: number;
    unit?: string;
    description?: string | null;
}

export interface MaterialFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    name?: string;
    supplierId?: number;
    materialGroup?: number;
    tier?: number;
    unit?: string;
    minCost?: number;
    maxCost?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface MaterialStatistics {
    totalCount: number;
    countBySupplier: { supplierId: number | null; count: number }[];
}

export const materialService = {
    /**
     * GET /api/materials
     * Get all materials
     */
    async getMaterials(): Promise<Material[]> {
        try {
            const response = await apiServer.get<ApiResponse<Material[]>>("/materials");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get materials failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/materials/paginated
     * Get materials with filters and pagination
     */
    async getMaterialsPaginated(params: MaterialFilterParams): Promise<{
        data: Material[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }> {
        try {
            const response = await apiServer.get<ApiResponse<any>>("/materials/paginated", { params });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        } catch (error) {
            console.error("Get materials paginated failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/materials/:id
     * Get material by ID
     */
    async getMaterialById(id: number): Promise<Material | null> {
        try {
            const response = await apiServer.get<ApiResponse<Material>>(`/materials/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get material ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/materials
     * Create new material
     */
    async createMaterial(data: CreateMaterialRequest): Promise<Material> {
        try {
            const response = await apiServer.post<ApiResponse<Material>>("/materials", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create material");
        } catch (error) {
            console.error("Create material failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/materials/:id
     * Update material
     */
    async updateMaterial(id: number, data: UpdateMaterialRequest): Promise<Material> {
        try {
            const response = await apiServer.put<ApiResponse<Material>>(`/materials/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update material");
        } catch (error) {
            console.error(`Update material ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/materials/:id
     * Delete material (soft delete)
     */
    async deleteMaterial(id: number): Promise<void> {
        try {
            const response = await apiServer.delete<ApiResponse<any>>(`/materials/${id}`);

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to delete material");
            }
        } catch (error) {
            console.error(`Delete material ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/materials/:id/restore
     * Restore deleted material
     */
    async restoreMaterial(id: number): Promise<Material> {
        try {
            const response = await apiServer.post<ApiResponse<Material>>(`/materials/${id}/restore`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to restore material");
        } catch (error) {
            console.error(`Restore material ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/materials/supplier/:supplierId
     * Get materials by supplier
     */
    async getMaterialsBySupplier(supplierId: number): Promise<Material[]> {
        try {
            const response = await apiServer.get<ApiResponse<Material[]>>(`/materials/supplier/${supplierId}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get materials by supplier ${supplierId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/materials/statistics
     * Get material statistics
     */
    async getStatistics(): Promise<MaterialStatistics> {
        try {
            const response = await apiServer.get<ApiResponse<MaterialStatistics>>("/materials/statistics");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return { totalCount: 0, countBySupplier: [] };
        } catch (error) {
            console.error("Get material statistics failed:", error);
            throw error;
        }
    },

    /**
     * Search materials by name
     */
    async searchMaterials(query: string, limit: number = 20): Promise<Material[]> {
        try {
            const response = await this.getMaterialsPaginated({
                search: query,
                limit,
                page: 1
            });
            return response.data;
        } catch (error) {
            console.error("Search materials failed:", error);
            return [];
        }
    }
};

export default materialService;
