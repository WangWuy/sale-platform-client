/**
 * Barrel exports for constants
 * Import all constants from a single location: import { ... } from '@/constants'
 */

export * from './product';
export * from './customer';
export * from './audit-log';
export * from './chat';
export * from './common';
export * from './inventory';

// Re-export constants from types for convenience
export {
    QuoteStatus,
    QuoteStatusLabels,
    QuoteStatusColors
} from '@/types/quote';

export {
    ProductStatus,
    ProductStatusLabels,
    ProductStatusColors
} from '@/types/product';

export {
    CUSTOMER_TYPES,
    type CustomerType
} from '@/types/customer';

export {
    UserRole,
    UserRoleLabels,
    UserStatus,
    UserStatusLabels,
    type UserRoleString,
    USER_ROLES,
    USER_ROLE_LABELS
} from '@/types/user';

export {
    AuditAction,
    AuditActionLabels,
    AuditActionColors
} from '@/types/audit-log';

export {
    type StockStatus,
    getStockStatus
} from '@/types/inventory';
