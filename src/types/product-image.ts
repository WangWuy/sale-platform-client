// =====================================================
// Product Image Types - Types cho Product Images API
// =====================================================

export interface ProductImage {
    id: number;
    productId: number;
    imageId: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    isPrimary: boolean;
    displayOrder: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateImageRequest {
    productId: number;
    imageId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isPrimary?: boolean;
}

export interface ReorderImagesRequest {
    imageIds: number[];
}
