/**
 * Permission Constants for Frontend
 * This file mirrors the backend permissions to keep them in sync
 */

// =====================================================
// PERMISSION DEFINITIONS
// =====================================================

export const PERMISSIONS = {
    // User Management
    USERS: {
        VIEW: 'users.view',
        CREATE: 'users.create',
        UPDATE: 'users.update',
        DELETE: 'users.delete',
    },

    // Materials Management
    MATERIALS: {
        VIEW: 'materials.view',
        CREATE: 'materials.create',
        UPDATE: 'materials.update',
        DELETE: 'materials.delete',
    },

    // Products Management
    PRODUCTS: {
        VIEW: 'products.view',
        CREATE: 'products.create',
        UPDATE: 'products.update',
        DELETE: 'products.delete',
    },

    // Categories Management
    CATEGORIES: {
        VIEW: 'categories.view',
        CREATE: 'categories.create',
        UPDATE: 'categories.update',
        DELETE: 'categories.delete',
    },

    // Quotes Management
    QUOTES: {
        VIEW: 'quotes.view',
        CREATE: 'quotes.create',
        UPDATE: 'quotes.update',
        UPDATE_OWN: 'quotes.update_own',
        DELETE: 'quotes.delete',
        APPROVE: 'quotes.approve',
    },

    // Pricing Settings
    PRICING: {
        VIEW: 'pricing.view',
        RULES_MANAGE: 'pricing.rules.manage',
        SURCHARGES_MANAGE: 'pricing.surcharges.manage',
        TIERS_MANAGE: 'pricing.tiers.manage',
        THRESHOLDS_MANAGE: 'pricing.thresholds.manage',
    },

    // Customers Management
    CUSTOMERS: {
        VIEW: 'customers.view',
        CREATE: 'customers.create',
        UPDATE: 'customers.update',
        DELETE: 'customers.delete',
    },

    // Suppliers Management
    SUPPLIERS: {
        VIEW: 'suppliers.view',
        CREATE: 'suppliers.create',
        UPDATE: 'suppliers.update',
        DELETE: 'suppliers.delete',
    },

    // Inventory Management
    INVENTORY: {
        VIEW: 'inventory.view',
        CREATE: 'inventory.create',
        UPDATE: 'inventory.update',
        DELETE: 'inventory.delete',
        ADJUST: 'inventory.adjust',
    },

    // Audit Logs
    AUDIT_LOGS: {
        VIEW: 'audit_logs.view',
        EXPORT: 'audit_logs.export',
    },

    // Settings
    SETTINGS: {
        VIEW: 'settings.view',
        MANAGE: 'settings.manage',
    },

    // Image Matching / AI Features
    IMAGE_MATCHING: {
        USE: 'image_matching.use',
        VIEW_HISTORY: 'image_matching.view_history',
    },
} as const;

// =====================================================
// TYPE DEFINITIONS
// =====================================================

type PermissionValues<T> = T extends object
    ? T extends readonly unknown[]
    ? never
    : { [K in keyof T]: PermissionValues<T[K]> }[keyof T]
    : T;

export type Permission = PermissionValues<typeof PERMISSIONS>;

// All permission values as flat array
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS).flatMap(
    (category) => Object.values(category)
) as Permission[];

// =====================================================
// USER ROLES
// =====================================================

export enum UserRole {
    ADMIN = 1,
    MANAGER = 2,
    SALES = 3,
}

export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.SALES]: 'Sales',
};

// =====================================================
// ROLE PERMISSIONS MAPPING
// =====================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // ADMIN - Full access to everything
    [UserRole.ADMIN]: ALL_PERMISSIONS,

    // MANAGER - Can manage operations but not users/settings
    [UserRole.MANAGER]: [
        // Materials - full access except delete
        PERMISSIONS.MATERIALS.VIEW,
        PERMISSIONS.MATERIALS.CREATE,
        PERMISSIONS.MATERIALS.UPDATE,

        // Products - full access except delete
        PERMISSIONS.PRODUCTS.VIEW,
        PERMISSIONS.PRODUCTS.CREATE,
        PERMISSIONS.PRODUCTS.UPDATE,

        // Categories - full access except delete
        PERMISSIONS.CATEGORIES.VIEW,
        PERMISSIONS.CATEGORIES.CREATE,
        PERMISSIONS.CATEGORIES.UPDATE,

        // Quotes - full access
        PERMISSIONS.QUOTES.VIEW,
        PERMISSIONS.QUOTES.CREATE,
        PERMISSIONS.QUOTES.UPDATE,
        PERMISSIONS.QUOTES.APPROVE,

        // Pricing - view only
        PERMISSIONS.PRICING.VIEW,

        // Customers - full access
        PERMISSIONS.CUSTOMERS.VIEW,
        PERMISSIONS.CUSTOMERS.CREATE,
        PERMISSIONS.CUSTOMERS.UPDATE,
        PERMISSIONS.CUSTOMERS.DELETE,

        // Suppliers - full access except delete
        PERMISSIONS.SUPPLIERS.VIEW,
        PERMISSIONS.SUPPLIERS.CREATE,
        PERMISSIONS.SUPPLIERS.UPDATE,

        // Inventory - full access
        PERMISSIONS.INVENTORY.VIEW,
        PERMISSIONS.INVENTORY.CREATE,
        PERMISSIONS.INVENTORY.UPDATE,
        PERMISSIONS.INVENTORY.ADJUST,

        // Audit logs - view only
        PERMISSIONS.AUDIT_LOGS.VIEW,

        // Settings - view only
        PERMISSIONS.SETTINGS.VIEW,

        // AI Features
        PERMISSIONS.IMAGE_MATCHING.USE,
        PERMISSIONS.IMAGE_MATCHING.VIEW_HISTORY,
    ],

    // SALES - Limited access for sales operations
    [UserRole.SALES]: [
        // Materials - view only
        PERMISSIONS.MATERIALS.VIEW,

        // Products - view only
        PERMISSIONS.PRODUCTS.VIEW,

        // Categories - view only
        PERMISSIONS.CATEGORIES.VIEW,

        // Quotes - create and update own
        PERMISSIONS.QUOTES.VIEW,
        PERMISSIONS.QUOTES.CREATE,
        PERMISSIONS.QUOTES.UPDATE_OWN,

        // Pricing - view only
        PERMISSIONS.PRICING.VIEW,

        // Customers - full CRUD except delete
        PERMISSIONS.CUSTOMERS.VIEW,
        PERMISSIONS.CUSTOMERS.CREATE,
        PERMISSIONS.CUSTOMERS.UPDATE,

        // Suppliers - view only
        PERMISSIONS.SUPPLIERS.VIEW,

        // Inventory - view only
        PERMISSIONS.INVENTORY.VIEW,

        // Settings - view basic settings
        PERMISSIONS.SETTINGS.VIEW,

        // AI Features
        PERMISSIONS.IMAGE_MATCHING.USE,
    ],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
    return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 */
export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
    return getRolePermissions(role).includes(permission);
};

/**
 * Check if a role has ALL of the specified permissions
 */
export const roleHasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
    const rolePermissions = getRolePermissions(role);
    return permissions.every((perm) => rolePermissions.includes(perm));
};

/**
 * Check if a role has ANY of the specified permissions
 */
export const roleHasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
    const rolePermissions = getRolePermissions(role);
    return permissions.some((perm) => rolePermissions.includes(perm));
};

/**
 * Check permission for a user object
 */
export const userHasPermission = (
    user: { role?: UserRole } | null | undefined,
    permission: Permission
): boolean => {
    if (!user?.role) return false;
    return roleHasPermission(user.role, permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const userHasAnyPermission = (
    user: { role?: UserRole } | null | undefined,
    permissions: Permission[]
): boolean => {
    if (!user?.role) return false;
    return roleHasAnyPermission(user.role, permissions);
};

/**
 * Check if user has all of the specified permissions
 */
export const userHasAllPermissions = (
    user: { role?: UserRole } | null | undefined,
    permissions: Permission[]
): boolean => {
    if (!user?.role) return false;
    return roleHasAllPermissions(user.role, permissions);
};
