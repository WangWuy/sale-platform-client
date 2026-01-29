import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum AuditAction {
    CREATE = 1,
    UPDATE = 2,
    DELETE = 3,
    RESTORE = 4
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class AuditLogResponseModel extends BaseResponseModel {
    entityType: string = "";
    entityId: number = 0;
    action: string = "";
    actionCode: AuditAction = AuditAction.CREATE;
    oldValue?: object | null;
    newValue?: object | null;
    changedFields?: string[] | null;
    performedBy: number = 0;
    ipAddress?: string | null;
    userAgent?: string | null;
    reason?: string | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class AuditLogModel extends BaseModel {
    entityType: string = "";
    entityId: number = 0;
    action: string = "";
    actionCode: AuditAction = AuditAction.CREATE;
    oldValue: object | null = null;
    newValue: object | null = null;
    changedFields: string[] | null = null;
    performedBy: number = 0;
    ipAddress: string | null = null;
    userAgent: string | null = null;
    reason: string | null = null;

    constructor(resModel: AuditLogResponseModel) {
        super(resModel);
        if (resModel) {
            this.entityType = resModel.entityType;
            this.entityId = resModel.entityId;
            this.action = resModel.action;
            this.actionCode = resModel.actionCode;
            this.oldValue = resModel.oldValue || null;
            this.newValue = resModel.newValue || null;
            this.changedFields = resModel.changedFields || null;
            this.performedBy = resModel.performedBy;
            this.ipAddress = resModel.ipAddress || null;
            this.userAgent = resModel.userAgent || null;
            this.reason = resModel.reason || null;
        }
    }

    /**
     * Lấy tên action
     */
    getActionName(): string {
        const names: Record<AuditAction, string> = {
            [AuditAction.CREATE]: "Tạo mới",
            [AuditAction.UPDATE]: "Cập nhật",
            [AuditAction.DELETE]: "Xóa",
            [AuditAction.RESTORE]: "Khôi phục"
        };
        return names[this.actionCode] || this.action;
    }

    /**
     * Lấy màu badge cho action
     */
    getActionColor(): string {
        switch (this.actionCode) {
            case AuditAction.CREATE:
                return "success";
            case AuditAction.UPDATE:
                return "primary";
            case AuditAction.DELETE:
                return "error";
            case AuditAction.RESTORE:
                return "warning";
            default:
                return "default";
        }
    }

    /**
     * Lấy icon cho action
     */
    getActionIcon(): string {
        switch (this.actionCode) {
            case AuditAction.CREATE:
                return "plus-circle";
            case AuditAction.UPDATE:
                return "edit";
            case AuditAction.DELETE:
                return "trash";
            case AuditAction.RESTORE:
                return "refresh-cw";
            default:
                return "info";
        }
    }

    /**
     * Kiểm tra có changed fields không
     */
    hasChangedFields(): boolean {
        return !!(this.changedFields && this.changedFields.length > 0);
    }

    /**
     * Format changed fields
     */
    getChangedFieldsString(): string {
        if (!this.hasChangedFields()) return "";
        return this.changedFields!.join(", ");
    }

    /**
     * Format thời gian
     */
    formatTime(): string {
        if (!this.createdAt) return "N/A";
        return new Date(this.createdAt).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    /**
     * Tạo entity link
     */
    getEntityLink(): string {
        const entityRoutes: Record<string, string> = {
            Product: "/products",
            Quote: "/quotes",
            Customer: "/customers",
            User: "/users",
            Material: "/materials",
            Category: "/categories"
        };
        const baseRoute = entityRoutes[this.entityType] || "";
        return baseRoute ? `${baseRoute}/${this.entityId}` : "";
    }
}
