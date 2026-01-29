// =====================================================
// Audit Log Types - Types cho Audit Logs API
// =====================================================

// Audit Action Enum (matches api-audit-logs.md)
export enum AuditAction {
    CREATE = 1,
    UPDATE = 2,
    DELETE = 3,
    RESTORE = 4,
}

export const AuditActionLabels: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'Tạo mới',
    [AuditAction.UPDATE]: 'Cập nhật',
    [AuditAction.DELETE]: 'Xóa',
    [AuditAction.RESTORE]: 'Khôi phục',
};

export const AuditActionColors: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'green',
    [AuditAction.UPDATE]: 'blue',
    [AuditAction.DELETE]: 'red',
    [AuditAction.RESTORE]: 'orange',
};

export interface AuditLog {
    id: number;
    entityType: string;
    entityId: number;
    action: string;
    actionCode: AuditAction;
    oldValue?: object | null;
    newValue?: object | null;
    changedFields?: string[] | null;
    performedBy: number;
    ipAddress?: string | null;
    userAgent?: string | null;
    reason?: string | null;
    createdAt: string;
}

export interface AuditLogStats {
    total: number;
    byAction: {
        CREATE: number;
        UPDATE: number;
        DELETE: number;
        RESTORE: number;
    };
}

export interface AuditLogFilterParams {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: number;
    action?: AuditAction;
    performedBy?: number;
    fromDate?: string;
    toDate?: string;
}

export interface AuditLogsResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
}
