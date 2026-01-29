import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ProductImageResponseModel extends BaseResponseModel {
    productId: number = 0;
    imageId: string = "";
    imageUrl: string = "";
    thumbnailUrl?: string | null;
    isPrimary: boolean = false;
    displayOrder: number = 0;
    fileName: string = "";
    fileSize: number = 0;
    mimeType: string = "";
    isDelete: boolean = false;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ProductImageModel extends BaseModel {
    productId: number = 0;
    imageId: string = "";
    imageUrl: string = "";
    thumbnailUrl: string | null = null;
    isPrimary: boolean = false;
    displayOrder: number = 0;
    fileName: string = "";
    fileSize: number = 0;
    mimeType: string = "";
    isDelete: boolean = false;

    constructor(resModel: ProductImageResponseModel) {
        super(resModel);
        if (resModel) {
            this.productId = resModel.productId;
            this.imageId = resModel.imageId;
            this.imageUrl = resModel.imageUrl;
            this.thumbnailUrl = resModel.thumbnailUrl || null;
            this.isPrimary = resModel.isPrimary;
            this.displayOrder = resModel.displayOrder;
            this.fileName = resModel.fileName;
            this.fileSize = resModel.fileSize;
            this.mimeType = resModel.mimeType;
            this.isDelete = resModel.isDelete;
        }
    }

    /**
     * Lấy URL hiển thị (ưu tiên thumbnail)
     */
    getDisplayUrl(): string {
        return this.thumbnailUrl || this.imageUrl;
    }

    /**
     * Format file size
     */
    getFileSizeString(): string {
        const sizes = ["Bytes", "KB", "MB", "GB"];
        if (this.fileSize === 0) return "0 Bytes";
        const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
        return `${(this.fileSize / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * Lấy extension từ mimeType
     */
    getExtension(): string {
        const mimeToExt: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp"
        };
        return mimeToExt[this.mimeType] || "img";
    }

    /**
     * Kiểm tra là ảnh JPEG
     */
    isJpeg(): boolean {
        return this.mimeType === "image/jpeg";
    }

    /**
     * Kiểm tra là ảnh PNG
     */
    isPng(): boolean {
        return this.mimeType === "image/png";
    }
}
