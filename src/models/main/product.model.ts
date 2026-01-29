import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum ProductCategory {
    BAN = 1,
    GHE = 2,
    SOFA = 3,
    TU = 4,
    KE = 5,
    KHAC = 6
}

export enum ProductMaterial {
    GO_TU_NHIEN = 1,
    GO_CONG_NGHIEP = 2,
    SAT = 3,
    NHUA = 4,
    VAI = 5,
    DA = 6,
    KHAC = 7
}

export enum ProductStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3,
    ARCHIVED = 4
}

export interface ProductDimensions {
    length?: number | null;
    width?: number | null;
    height?: number | null;
    unit: "cm";
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ProductResponseModel extends BaseResponseModel {
    code: string = "";
    name: string = "";
    category: number = ProductCategory.BAN;
    material: number = ProductMaterial.GO_TU_NHIEN;
    dimensions: ProductDimensions | null = null;
    basePrice: number = 0;
    currentPrice: number = 0;
    minPrice: number = 0;
    maxPrice: number = 0;
    description?: string | null;
    notes?: string | null;
    status: number = ProductStatus.PENDING;
    approvedBy?: number | null;
    approvedAt?: Date | null;
    createdBy: number = 0;
    updatedBy?: number | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ProductModel extends BaseModel {
    code: string = "";
    name: string = "";
    category: number = ProductCategory.BAN;
    material: number = ProductMaterial.GO_TU_NHIEN;
    dimensions: ProductDimensions | null = null;
    basePrice: number = 0;
    currentPrice: number = 0;
    minPrice: number = 0;
    maxPrice: number = 0;
    description: string | null = null;
    notes: string | null = null;
    status: number = ProductStatus.PENDING;
    approvedBy: number | null = null;
    approvedAt: Date | null = null;
    createdBy: number = 0;
    updatedBy: number | null = null;

    constructor(resModel: ProductResponseModel) {
        super(resModel);
        if (resModel) {
            this.code = resModel.code;
            this.name = resModel.name;
            this.category = resModel.category;
            this.material = resModel.material;
            this.dimensions = resModel.dimensions;
            this.basePrice = resModel.basePrice;
            this.currentPrice = resModel.currentPrice;
            this.minPrice = resModel.minPrice;
            this.maxPrice = resModel.maxPrice;
            this.description = resModel.description || null;
            this.notes = resModel.notes || null;
            this.status = resModel.status;
            this.approvedBy = resModel.approvedBy || null;
            this.approvedAt = resModel.approvedAt || null;
            this.createdBy = resModel.createdBy;
            this.updatedBy = resModel.updatedBy || null;
        }
    }

    /**
     * Kiểm tra trạng thái pending
     */
    isPending(): boolean {
        return this.status === ProductStatus.PENDING;
    }

    /**
     * Kiểm tra trạng thái approved
     */
    isApproved(): boolean {
        return this.status === ProductStatus.APPROVED;
    }

    /**
     * Kiểm tra trạng thái rejected
     */
    isRejected(): boolean {
        return this.status === ProductStatus.REJECTED;
    }

    /**
     * Kiểm tra trạng thái archived
     */
    isArchived(): boolean {
        return this.status === ProductStatus.ARCHIVED;
    }

    /**
     * Lấy tên category
     */
    getCategoryName(): string {
        const names: Record<number, string> = {
            [ProductCategory.BAN]: "Bàn",
            [ProductCategory.GHE]: "Ghế",
            [ProductCategory.SOFA]: "Sofa",
            [ProductCategory.TU]: "Tủ",
            [ProductCategory.KE]: "Kệ",
            [ProductCategory.KHAC]: "Khác"
        };
        return names[this.category] || "Unknown";
    }

    /**
     * Lấy tên material
     */
    getMaterialName(): string {
        const names: Record<number, string> = {
            [ProductMaterial.GO_TU_NHIEN]: "Gỗ tự nhiên",
            [ProductMaterial.GO_CONG_NGHIEP]: "Gỗ công nghiệp",
            [ProductMaterial.SAT]: "Sắt",
            [ProductMaterial.NHUA]: "Nhựa",
            [ProductMaterial.VAI]: "Vải",
            [ProductMaterial.DA]: "Da",
            [ProductMaterial.KHAC]: "Khác"
        };
        return names[this.material] || "Unknown";
    }

    /**
     * Lấy tên status
     */
    getStatusName(): string {
        const names: Record<number, string> = {
            [ProductStatus.PENDING]: "Chờ duyệt",
            [ProductStatus.APPROVED]: "Đã duyệt",
            [ProductStatus.REJECTED]: "Từ chối",
            [ProductStatus.ARCHIVED]: "Lưu trữ"
        };
        return names[this.status] || "Unknown";
    }

    /**
     * Lấy màu badge cho status
     */
    getStatusColor(): string {
        switch (this.status) {
            case ProductStatus.PENDING:
                return "warning";
            case ProductStatus.APPROVED:
                return "success";
            case ProductStatus.REJECTED:
                return "error";
            case ProductStatus.ARCHIVED:
                return "default";
            default:
                return "default";
        }
    }

    /**
     * Format giá tiền
     */
    formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(price);
    }

    /**
     * Lấy kích thước dạng string
     */
    getDimensionsString(): string {
        if (!this.dimensions) return "N/A";
        const { length, width, height, unit } = this.dimensions;
        const parts = [];
        if (length) parts.push(`D${length}`);
        if (width) parts.push(`R${width}`);
        if (height) parts.push(`C${height}`);
        return parts.length > 0 ? `${parts.join(" x ")} ${unit}` : "N/A";
    }
}
