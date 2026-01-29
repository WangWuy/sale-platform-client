import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum ProductType {
    STANDARD = 1,
    CUSTOM = 2,
    BUNDLE = 3
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export interface DefaultMaterial {
    materialId: number;
    name: string;
}

export class ProductTemplateResponseModel extends BaseResponseModel {
    name: string = "";
    categoryId: number = 0;
    productType: ProductType = ProductType.STANDARD;
    basePrice: string = "0";
    baseSize: string = "";
    baseSizeValue: number = 0;
    defaultMaterials?: DefaultMaterial[] | null;
    description?: string | null;
    isActive: boolean = true;
    isDelete: boolean = false;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ProductTemplateModel extends BaseModel {
    name: string = "";
    categoryId: number = 0;
    productType: ProductType = ProductType.STANDARD;
    basePrice: number = 0;
    baseSize: string = "";
    baseSizeValue: number = 0;
    defaultMaterials: DefaultMaterial[] | null = null;
    description: string | null = null;
    isActive: boolean = true;
    isDelete: boolean = false;

    constructor(resModel: ProductTemplateResponseModel) {
        super(resModel);
        if (resModel) {
            this.name = resModel.name;
            this.categoryId = resModel.categoryId;
            this.productType = resModel.productType;
            this.basePrice = parseFloat(resModel.basePrice) || 0;
            this.baseSize = resModel.baseSize;
            this.baseSizeValue = resModel.baseSizeValue;
            this.defaultMaterials = resModel.defaultMaterials || null;
            this.description = resModel.description || null;
            this.isActive = resModel.isActive;
            this.isDelete = resModel.isDelete;
        }
    }

    /**
     * Lấy tên loại sản phẩm
     */
    getProductTypeName(): string {
        const names: Record<ProductType, string> = {
            [ProductType.STANDARD]: "Tiêu chuẩn",
            [ProductType.CUSTOM]: "Tùy chỉnh",
            [ProductType.BUNDLE]: "Combo"
        };
        return names[this.productType] || "Unknown";
    }

    /**
     * Lấy màu badge cho loại
     */
    getProductTypeColor(): string {
        switch (this.productType) {
            case ProductType.STANDARD:
                return "default";
            case ProductType.CUSTOM:
                return "primary";
            case ProductType.BUNDLE:
                return "success";
            default:
                return "default";
        }
    }

    /**
     * Format giá
     */
    formatPrice(): string {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(this.basePrice);
    }

    /**
     * Kiểm tra có default materials không
     */
    hasDefaultMaterials(): boolean {
        return !!(this.defaultMaterials && this.defaultMaterials.length > 0);
    }

    /**
     * Lấy danh sách tên materials
     */
    getMaterialNames(): string {
        if (!this.hasDefaultMaterials()) return "Không có";
        return this.defaultMaterials!.map(m => m.name).join(", ");
    }
}
