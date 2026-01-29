import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// RESPONSE MODEL
// =====================================================

export class InventoryResponseModel extends BaseResponseModel {
    productId: number = 0;
    quantityAvailable: number = 0;
    quantityReserved: number = 0;
    reorderLevel?: number | null;
    maxStockLevel?: number | null;
    notes?: string | null;
    lastRestockDate?: string | null;
    nextExpectedRestock?: string | null;
    // Populated
    productName?: string;
    productCode?: string;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class InventoryModel extends BaseModel {
    productId: number = 0;
    quantityAvailable: number = 0;
    quantityReserved: number = 0;
    reorderLevel: number | null = null;
    maxStockLevel: number | null = null;
    notes: string | null = null;
    lastRestockDate: string | null = null;
    nextExpectedRestock: string | null = null;
    // Populated
    productName: string | null = null;
    productCode: string | null = null;

    constructor(resModel: InventoryResponseModel) {
        super(resModel);
        if (resModel) {
            this.productId = resModel.productId;
            this.quantityAvailable = resModel.quantityAvailable || 0;
            this.quantityReserved = resModel.quantityReserved || 0;
            this.reorderLevel = resModel.reorderLevel || null;
            this.maxStockLevel = resModel.maxStockLevel || null;
            this.notes = resModel.notes || null;
            this.lastRestockDate = resModel.lastRestockDate || null;
            this.nextExpectedRestock = resModel.nextExpectedRestock || null;
            this.productName = resModel.productName || null;
            this.productCode = resModel.productCode || null;
        }
    }

    /**
     * Tổng số lượng (available + reserved)
     */
    getTotalQuantity(): number {
        return this.quantityAvailable + this.quantityReserved;
    }

    /**
     * Kiểm tra hết hàng
     */
    isOutOfStock(): boolean {
        return this.quantityAvailable <= 0;
    }

    /**
     * Kiểm tra sắp hết hàng
     */
    isLowStock(): boolean {
        if (!this.reorderLevel) return false;
        return this.quantityAvailable <= this.reorderLevel;
    }

    /**
     * Kiểm tra vượt mức tồn kho tối đa
     */
    isOverstock(): boolean {
        if (!this.maxStockLevel) return false;
        return this.getTotalQuantity() > this.maxStockLevel;
    }

    /**
     * Lấy trạng thái tồn kho
     */
    getStockStatus(): "out_of_stock" | "low_stock" | "in_stock" | "overstock" {
        if (this.isOutOfStock()) return "out_of_stock";
        if (this.isLowStock()) return "low_stock";
        if (this.isOverstock()) return "overstock";
        return "in_stock";
    }

    /**
     * Lấy tên trạng thái
     */
    getStockStatusName(): string {
        const status = this.getStockStatus();
        const names: Record<string, string> = {
            out_of_stock: "Hết hàng",
            low_stock: "Sắp hết",
            in_stock: "Còn hàng",
            overstock: "Vượt mức"
        };
        return names[status] || "Unknown";
    }

    /**
     * Lấy màu badge cho trạng thái
     */
    getStockStatusColor(): string {
        const status = this.getStockStatus();
        switch (status) {
            case "out_of_stock":
                return "error";
            case "low_stock":
                return "warning";
            case "in_stock":
                return "success";
            case "overstock":
                return "info";
            default:
                return "default";
        }
    }

    /**
     * Format ngày
     */
    formatDate(dateString: string | null): string {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }
}
