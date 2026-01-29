import { AuditAction, AuditActionLabels, AuditActionColors } from '@/types/audit-log';

// Re-export for convenience
export { AuditAction, AuditActionLabels, AuditActionColors };

// Legacy constants (kept for backward compatibility)
export const AUDIT_ACTION_LABELS: Record<number, string> = {
    [AuditAction.CREATE]: 'Tạo mới',
    [AuditAction.UPDATE]: 'Cập nhật',
    [AuditAction.DELETE]: 'Xóa',
    [AuditAction.RESTORE]: 'Khôi phục',
};

export const AUDIT_ACTION_COLORS: Record<number, string> = {
    [AuditAction.CREATE]: 'success',
    [AuditAction.UPDATE]: 'primary',
    [AuditAction.DELETE]: 'error',
    [AuditAction.RESTORE]: 'warning',
};
