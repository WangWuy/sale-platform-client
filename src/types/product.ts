import { BaseModel } from './base.model';

// =====================================================
// ENUMS
// =====================================================

export enum ProductStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3,
    ARCHIVED = 4
}

// Product Status Labels
export const ProductStatusLabels: Record<ProductStatus, string> = {
    [ProductStatus.PENDING]: 'Chờ duyệt',
    [ProductStatus.APPROVED]: 'Đã duyệt',
    [ProductStatus.REJECTED]: 'Bị từ chối',
    [ProductStatus.ARCHIVED]: 'Đã lưu trữ',
};

// Product Status Colors
export const ProductStatusColors: Record<ProductStatus, string> = {
    [ProductStatus.PENDING]: 'yellow',
    [ProductStatus.APPROVED]: 'green',
    [ProductStatus.REJECTED]: 'red',
    [ProductStatus.ARCHIVED]: 'gray',
};

// =====================================================
// INTERFACES
// =====================================================

export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'm';
}

export interface CategoryInfo {
    id: number;
    name: string;
    description?: string;
}

export interface MaterialInfo {
    id: number;
    name: string;
    costPerUnit?: number;
}

export interface ProductImage {
    id: number;
    productId: number;
    imageId: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isPrimary: boolean;
    displayOrder: number;
}

export interface Product extends BaseModel {
    code: string;
    name: string;
    categoryId: number;
    materialId: number;
    originalId?: number | null;
    feature?: string | null;
    dimensions?: ProductDimensions | null;
    basePrice: number;
    currentPrice: number;
    minPrice: number;
    maxPrice: number;
    description?: string | null;
    notes?: string | null;
    status: ProductStatus;
    approvedBy?: number | null;
    approvedAt?: Date | null;
    createdBy?: number | null;
    updatedBy?: number | null;

    // Associations (populated when included)
    categoryInfo?: CategoryInfo;
    materialInfo?: MaterialInfo;
    images?: ProductImage[];
}

export interface ProductListParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    materialId?: number;
    status?: ProductStatus;
    sortBy?: 'name' | 'code' | 'price' | 'createdAt';
    sortOrder?: 'ASC' | 'DESC';
}

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateProductRequest {
    name: string;
    categoryId: number;
    materialId: number;
    originalId?: number;
    feature?: string;
    dimensions?: ProductDimensions;
    basePrice: number;
    currentPrice: number;
    minPrice?: number;
    maxPrice?: number;
    description?: string;
    notes?: string;
    imageIds?: string[]; // Array of S3Object IDs
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    status?: ProductStatus;
    imageIds?: string[]; // Array of S3Object IDs
}
