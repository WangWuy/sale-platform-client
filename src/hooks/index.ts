/**
 * Barrel exports for hooks
 * Import all hooks from a single location: import { useProducts, useUser } from '@/hooks'
 */

export { useProducts, useProductStats } from './useProducts';
export { useUser, useUserPreferences } from './useUser';
export { useUsers } from './useUsers';
export { useCustomers, useCustomerStats, useCustomersByType } from './useCustomers';
export { useCategories } from './useCategories';
export { useInventory } from './useInventory';
export { useAuditLogs, useAuditStats } from './useAuditLogs';
export { useSuppliers } from './useSuppliers';
export { useProductImages } from './useProductImages';
export { useProductTemplates } from './useProductTemplates';
export { useProductVariants } from './useProductVariants';
export { useDesignTags, useProductTags } from './useDesignTags';
export { useMessageCache } from './useMessageCache';
export { useTokenRefresh } from './useTokenRefresh';
export { usePricing } from './usePricing';
export { useQuotes } from './useQuotes';

