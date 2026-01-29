import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    AuditLog,
    AuditLogStats,
    AuditLogFilterParams,
    AuditLogsResponse,
} from "@/types/audit-log";

// =====================================================
// Audit Log Service - Quản lý Audit Logs API
// =====================================================

export const auditLogService = {
    /**
     * GET /api/audit-logs/stats
     * Lấy thống kê hoạt động
     */
    async getStats(fromDate?: string, toDate?: string): Promise<AuditLogStats> {
        try {
            const response = await apiServer.get<ApiResponse<AuditLogStats>>("/audit-logs/stats", {
                params: { fromDate, toDate },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                total: 0,
                byAction: { CREATE: 0, UPDATE: 0, DELETE: 0, RESTORE: 0 },
            };
        } catch (error) {
            console.error("Get audit log stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/audit-logs/recent
     * Lấy hoạt động gần đây
     */
    async getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
        try {
            const response = await apiServer.get<ApiResponse<AuditLog[]>>("/audit-logs/recent", {
                params: { limit },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get recent activity failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/audit-logs
     * Lấy danh sách logs với pagination
     */
    async getLogs(params?: AuditLogFilterParams): Promise<AuditLogsResponse> {
        try {
            const response = await apiServer.get<ApiResponse<AuditLogsResponse>>("/audit-logs", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    entityType: params?.entityType,
                    entityId: params?.entityId,
                    action: params?.action,
                    performedBy: params?.performedBy,
                    fromDate: params?.fromDate,
                    toDate: params?.toDate,
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                logs: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get audit logs failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/audit-logs/:id
     * Lấy chi tiết một log entry
     */
    async getLogById(id: number): Promise<AuditLog> {
        try {
            const response = await apiServer.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Audit log not found');
        } catch (error) {
            console.error(`Get audit log ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/audit-logs/entity/:entityType/:entityId
     * Lấy lịch sử của entity cụ thể
     */
    async getEntityHistory(entityType: string, entityId: number): Promise<AuditLog[]> {
        try {
            const response = await apiServer.get<ApiResponse<AuditLog[]>>(
                `/audit-logs/entity/${entityType}/${entityId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get entity history for ${entityType}/${entityId} failed:`, error);
            throw error;
        }
    },

    /**
     * GET /api/audit-logs/user/:userId
     * Lấy hoạt động của user
     */
    async getUserActivity(userId: number, limit: number = 50): Promise<AuditLog[]> {
        try {
            const response = await apiServer.get<ApiResponse<AuditLog[]>>(
                `/audit-logs/user/${userId}`,
                { params: { limit } }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(`Get user activity for ${userId} failed:`, error);
            throw error;
        }
    },
};

export default auditLogService;
