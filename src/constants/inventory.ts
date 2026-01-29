/**
 * Stock Status Constants
 * Using numeric enum for consistency with other constants
 */

export enum StockStatus {
    OUT_OF_STOCK = 0,
    LOW_STOCK = 1,
    IN_STOCK = 2,
    OVERSTOCK = 3
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
    [StockStatus.OUT_OF_STOCK]: 'Hết hàng',
    [StockStatus.LOW_STOCK]: 'Sắp hết',
    [StockStatus.IN_STOCK]: 'Còn hàng',
    [StockStatus.OVERSTOCK]: 'Vượt mức',
};

export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
    [StockStatus.OUT_OF_STOCK]: 'error',
    [StockStatus.LOW_STOCK]: 'warning',
    [StockStatus.IN_STOCK]: 'success',
    [StockStatus.OVERSTOCK]: 'info',
};

/**
 * Helper function to get stock status from inventory data
 */
export const getStockStatus = (
    quantityAvailable: number,
    reorderLevel: number | null,
    maxStockLevel: number | null,
    quantityReserved: number = 0
): StockStatus => {
    const totalQuantity = quantityAvailable + quantityReserved;

    if (quantityAvailable <= 0) return StockStatus.OUT_OF_STOCK;
    if (reorderLevel && quantityAvailable <= reorderLevel) return StockStatus.LOW_STOCK;
    if (maxStockLevel && totalQuantity > maxStockLevel) return StockStatus.OVERSTOCK;
    return StockStatus.IN_STOCK;
};
