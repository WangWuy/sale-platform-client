import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// INTERFACES
// =====================================================

export interface VariantDimensions {
    length: number;
    width: number;
    height: number;
    unit?: string;
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ProductVariantResponseModel extends BaseResponseModel {
    productId: number = 0;
    materialId?: number | null;
    variantName: string = "";
    sku?: string | null;
    dimensions?: VariantDimensions | null;
    price: string = "0";
    notes?: string | null;
    isDelete: boolean = false;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ProductVariantModel extends BaseModel {
    productId: number = 0;
    materialId: number | null = null;
    variantName: string = "";
    sku: string | null = null;
    dimensions: VariantDimensions | null = null;
    price: number = 0;
    notes: string | null = null;
    isDelete: boolean = false;

    constructor(resModel: ProductVariantResponseModel) {
        super(resModel);
        if (resModel) {
            this.productId = resModel.productId;
            this.materialId = resModel.materialId || null;
            this.variantName = resModel.variantName;
            this.sku = resModel.sku || null;
            this.dimensions = resModel.dimensions || null;
            this.price = parseFloat(resModel.price) || 0;
            this.notes = resModel.notes || null;
            this.isDelete = resModel.isDelete;
        }
    }

    /**
     * Format giá
     */
    formatPrice(): string {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(this.price);
    }

    /**
     * Kiểm tra có dimensions không
     */
    hasDimensions(): boolean {
        return !!(this.dimensions &&
            (this.dimensions.length || this.dimensions.width || this.dimensions.height));
    }

    /**
     * Format dimensions
     */
    getDimensionsString(): string {
        if (!this.hasDimensions()) return "N/A";
        const { length, width, height, unit } = this.dimensions!;
        const parts: string[] = [];
        if (length) parts.push(`D${length}`);
        if (width) parts.push(`R${width}`);
        if (height) parts.push(`C${height}`);
        return parts.length > 0 ? `${parts.join(" x ")} ${unit || "cm"}` : "N/A";
    }

    /**
     * Kiểm tra có SKU không
     */
    hasSku(): boolean {
        return !!this.sku;
    }
}
