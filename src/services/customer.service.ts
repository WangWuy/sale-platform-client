import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    Customer,
    CustomerStats,
    CustomerFilterParams,
    CustomersResponse,
    CreateCustomerRequest,
    UpdateCustomerRequest,
} from "@/types/customer";

// =====================================================
// Customer Service - Quản lý Customers API
// =====================================================

export const customerService = {
    /**
     * GET /api/customers/stats
     * Lấy thống kê khách hàng
     */
    async getStats(): Promise<CustomerStats> {
        try {
            const response = await apiServer.get<ApiResponse<CustomerStats>>("/customers/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                totalCustomers: 0,
                countByType: [],
                customerTypes: [],
            };
        } catch (error) {
            console.error("Get customer stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/customers
     * Lấy danh sách khách hàng với pagination và filters
     */
    async getCustomers(params?: CustomerFilterParams): Promise<CustomersResponse> {
        try {
            const response = await apiServer.get<ApiResponse<CustomersResponse>>("/customers", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    search: params?.search,
                    name: params?.name,
                    phone: params?.phone,
                    email: params?.email,
                    customerType: params?.customerType,
                    sortBy: params?.sortBy || "name",
                    sortOrder: params?.sortOrder || "asc",
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                customers: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get customers failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/customers/search
     * Tìm kiếm nhanh cho dropdown/autocomplete
     */
    async searchCustomers(query: string): Promise<Customer[]> {
        try {
            if (query.length < 2) {
                return [];
            }

            const response = await apiServer.get<ApiResponse<Customer[]>>("/customers/search", {
                params: { q: query },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Search customers failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/customers/types
     * Lấy danh sách các loại khách hàng
     */
    async getCustomerTypes(): Promise<string[]> {
        try {
            const response = await apiServer.get<ApiResponse<string[]>>("/customers/types");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get customer types failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/customers/type/:customerType
     * Lấy khách hàng theo loại
     */
    async getCustomersByType(customerType: string): Promise<Customer[]> {
        try {
            const response = await apiServer.get<ApiResponse<Customer[]>>(
                `/customers/type/${encodeURIComponent(customerType)}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get customers by type ${customerType} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/customers/:id
     * Lấy chi tiết khách hàng
     */
    async getCustomerById(id: number): Promise<Customer | null> {
        try {
            const response = await apiServer.get<ApiResponse<Customer>>(`/customers/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get customer ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/customers
     * Tạo khách hàng mới
     */
    async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
        try {
            const response = await apiServer.post<ApiResponse<Customer>>("/customers", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to create customer");
        } catch (error) {
            console.error("Create customer failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/customers/:id
     * Cập nhật khách hàng
     */
    async updateCustomer(id: number, data: UpdateCustomerRequest): Promise<Customer> {
        try {
            const response = await apiServer.put<ApiResponse<Customer>>(`/customers/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update customer");
        } catch (error) {
            console.error(`Update customer ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/customers/:id
     * Xóa khách hàng (soft delete)
     */
    async deleteCustomer(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/customers/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete customer ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/customers/:id/restore
     * Khôi phục khách hàng đã xóa
     */
    async restoreCustomer(id: number): Promise<Customer> {
        try {
            const response = await apiServer.post<ApiResponse<Customer>>(
                `/customers/${id}/restore`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to restore customer");
        } catch (error) {
            console.error(`Restore customer ${id} failed:`, error);
            throw error;
        }
    },
};

export default customerService;
