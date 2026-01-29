// =====================================================
// Inventory Types - Types cho Inventory API
// =====================================================

export interface Inventory {
    id: number;
    productId: number;
    quantityAvailable: number;
    location?: string | null;
    minStockLevel: number;
    maxStockLevel?: number | null;
    lastUpdated: string;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryStats {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalQuantity: number;
}

export interface InventoryFilterParams {
    page?: number;
    limit?: number;
    productId?: number;
    location?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
}

export interface InventoryResponse {
    inventory: Inventory[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateInventoryRequest {
    productId: number;
    quantityAvailable?: number;
    location?: string;
    minStockLevel?: number;
    maxStockLevel?: number;
}

export interface UpdateInventoryRequest {
    quantityAvailable?: number;
    location?: string;
    minStockLevel?: number;
    maxStockLevel?: number;
}

export interface AdjustInventoryRequest {
    productId: number;
    delta: number;
    reason?: string;
}

// Stock Status helpers
export type StockStatus = 'out_of_stock' | 'low_stock' | 'normal' | 'over_stock';

export function getStockStatus(inventory: Inventory): StockStatus {
    if (inventory.quantityAvailable === 0) {
        return 'out_of_stock';
    }
    if (inventory.quantityAvailable <= inventory.minStockLevel) {
        return 'low_stock';
    }
    if (inventory.maxStockLevel && inventory.quantityAvailable >= inventory.maxStockLevel) {
        return 'over_stock';
    }
    return 'normal';
}
