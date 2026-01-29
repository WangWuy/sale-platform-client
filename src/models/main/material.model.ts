import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// RESPONSE MODEL
// =====================================================

export class MaterialResponseModel extends BaseResponseModel {
    name: string = "";
    supplierId?: number | null;
    costPerUnit: number = 0;
    description?: string | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class MaterialModel extends BaseModel {
    name: string = "";
    supplierId: number | null = null;
    costPerUnit: number = 0;
    description: string | null = null;

    constructor(resModel: MaterialResponseModel) {
        super(resModel);
        if (resModel) {
            this.name = resModel.name;
            this.supplierId = resModel.supplierId || null;
            this.costPerUnit = resModel.costPerUnit;
            this.description = resModel.description || null;
        }
    }

    /**
     * Kiểm tra có nhà cung cấp không
     */
    hasSupplier(): boolean {
        return this.supplierId !== null && this.supplierId !== undefined;
    }

    /**
     * Tính chi phí cho số lượng nhất định
     */
    getCostForQuantity(quantity: number): number {
        return Math.round(this.costPerUnit * quantity * 100) / 100;
    }

    /**
     * Format giá tiền
     */
    formatCost(): string {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(this.costPerUnit);
    }

    /**
     * Format chi phí cho số lượng
     */
    formatCostForQuantity(quantity: number): string {
        const cost = this.getCostForQuantity(quantity);
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(cost);
    }

    /**
     * Lấy tên hiển thị
     */
    getDisplayName(): string {
        return this.name;
    }

    /**
     * Lấy mô tả ngắn
     */
    getShortDescription(maxLength: number = 50): string {
        if (!this.description) return "Không có mô tả";
        if (this.description.length <= maxLength) return this.description;
        return this.description.substring(0, maxLength) + "...";
    }

    /**
     * Tạo object cho API request (tạo mới)
     */
    toCreateRequest(): {
        name: string;
        supplierId?: number | null;
        costPerUnit: number;
        description?: string | null;
    } {
        return {
            name: this.name,
            supplierId: this.supplierId,
            costPerUnit: this.costPerUnit,
            description: this.description
        };
    }

    /**
     * Tạo object cho API request (cập nhật)
     */
    toUpdateRequest(): {
        name?: string;
        supplierId?: number | null;
        costPerUnit?: number;
        description?: string | null;
    } {
        return {
            name: this.name,
            supplierId: this.supplierId,
            costPerUnit: this.costPerUnit,
            description: this.description
        };
    }

    /**
     * Clone model
     */
    clone(): MaterialModel {
        return new MaterialModel(this.toResponseModel());
    }

    /**
     * Chuyển về Response Model
     */
    toResponseModel(): MaterialResponseModel {
        return {
            id: this.id,
            name: this.name,
            supplierId: this.supplierId,
            costPerUnit: this.costPerUnit,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Validate dữ liệu
     */
    validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.name || !this.name.trim()) {
            errors.push("Tên vật liệu không được để trống");
        } else if (this.name.trim().length < 2) {
            errors.push("Tên vật liệu phải có ít nhất 2 ký tự");
        } else if (this.name.trim().length > 100) {
            errors.push("Tên vật liệu không được vượt quá 100 ký tự");
        }

        if (this.costPerUnit < 0) {
            errors.push("Giá mỗi đơn vị không được âm");
        }

        if (this.description && this.description.length > 1000) {
            errors.push("Mô tả không được vượt quá 1000 ký tự");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
