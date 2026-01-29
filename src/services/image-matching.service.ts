import apiServer, { apiFile } from '@/lib/api';
import { ApiResponse } from '@/types/api-response.model';
import { Product } from '@/types/product';

// ============================================
// Types
// ============================================

export interface ExtractedAttributes {
    category?: string;
    material?: string;
    color?: string;
    style?: string;
    dimensions?: {
        estimatedWidth?: string;
        estimatedHeight?: string;
        estimatedDepth?: string;
    };
    features?: string[];
    confidence: number;
    rawDescription?: string;
}

export interface S3ObjectInfo {
    id: string;
    url: string;
    originalName: string;
    size: string;
    mimeType?: string;
    createdAt?: string;
}

export interface UploadResponse {
    id: string;
    url: string;
    bucketName: string;
    objectKey: string;
    originalName: string;
    alternativeName: string;
    extension: string;
    size: number;
    mimeType: string;
}

/**
 * Product with similarity score from AI matching
 */
export interface ProductWithScore extends Product {
    matchScore: number; // 0-100 percentage
}

export interface ScanResponse {
    success: boolean;
    extractedAttributes: ExtractedAttributes | null;
    matchingProducts: ProductWithScore[];
    totalMatches: number;
    mappedCategoryId?: number;
    mappedMaterialId?: number;
    imageId?: string;
    imageUrl?: string;
    s3Object?: S3ObjectInfo;
    isSimulation?: boolean;
    processingTimeMs?: number;
    message?: string;
    provider?: string;
}

export interface ImageMatchingStatus {
    openaiConfigured: boolean;
    visionModel: string;
    maxImageMB: number;
    serverFileUrl: string;
    message: string;
}

// ============================================
// Service
// ============================================

export const imageMatchingService = {
    /**
     * GET /api/image-matching/status
     * Kiểm tra trạng thái cấu hình OpenAI
     */
    async getStatus(): Promise<ImageMatchingStatus> {
        try {
            const response = await apiServer.get<ApiResponse<ImageMatchingStatus>>(
                '/image-matching/status'
            );
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error('Failed to get status');
        } catch (error) {
            console.error('Get status failed:', error);
            throw error;
        }
    },

    /**
     * 🔵 BUTTON 1: Upload image to S3
     * POST /api/upload/image (ServerFile)
     */
    async uploadImage(file: File, folderName: string = 'ai-scan'): Promise<UploadResponse> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folderName', folderName);

            const response = await apiFile.post<ApiResponse<UploadResponse>>(
                '/upload/image',
                formData
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to upload image');
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    },

    /**
     * 🟢 BUTTON 2: Scan image with AI
     * POST /api/image-matching/scan (Server)
     * @param imageId S3Object ID from upload
     */
    async scanImage(imageId: string, provider?: string): Promise<ScanResponse> {
        try {
            const response = await apiServer.post<ApiResponse<ScanResponse>>(
                '/image-matching/scan',
                { imageId, provider }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to scan image');
        } catch (error) {
            console.error('Image scan failed:', error);
            throw error;
        }
    },

    /**
     * 🧪 TEST: Scan trực tiếp từ base64 (không cần upload S3)
     * POST /api/image-matching/scan-base64
     * @param imageBase64 Data URL của ảnh (data:image/jpeg;base64,...)
     */
    async scanBase64(imageBase64: string, provider?: string): Promise<ScanResponse> {
        try {
            const response = await apiServer.post<ApiResponse<ScanResponse>>(
                '/image-matching/scan-base64',
                { imageBase64, provider }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to scan image');
        } catch (error) {
            console.error('Base64 scan failed:', error);
            throw error;
        }
    },

    /**
     * Scan image from URL (không cần upload trước)
     * @param imageUrl Public URL of image
     */
    async scanImageByUrl(imageUrl: string, provider?: string): Promise<ScanResponse> {
        try {
            const response = await apiServer.post<ApiResponse<ScanResponse>>(
                '/image-matching/scan',
                { imageUrl, provider }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to scan image');
        } catch (error) {
            console.error('Image scan failed:', error);
            throw error;
        }
    },

    /**
     * Extract attributes only (không search products)
     * POST /api/image-matching/extract
     */
    async extractAttributes(imageId: string): Promise<{ extractedAttributes: ExtractedAttributes }> {
        try {
            const response = await apiServer.post<ApiResponse<any>>(
                '/image-matching/extract',
                { imageId }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to extract attributes');
        } catch (error) {
            console.error('Extract attributes failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/image-matching/images
     * Lấy danh sách ảnh đã upload
     */
    async getUploadedImages(page: number = 1, limit: number = 20): Promise<{
        images: S3ObjectInfo[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        try {
            const response = await apiServer.get<ApiResponse<any>>(
                '/image-matching/images',
                { params: { page, limit } }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to get uploaded images');
        } catch (error) {
            console.error('Get uploaded images failed:', error);
            throw error;
        }
    },

    /**
     * Find similar products by product ID
     */
    async findSimilar(productId: number, limit: number = 5): Promise<any> {
        try {
            const response = await apiServer.post<ApiResponse<any>>(
                '/image-matching/find-similar',
                { productId, limit }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to find similar products');
        } catch (error) {
            console.error('Find similar failed:', error);
            throw error;
        }
    },

    /**
     * Search products by text description
     */
    async searchByText(description: string, limit: number = 10): Promise<any> {
        try {
            const response = await apiServer.post<ApiResponse<any>>(
                '/image-matching/search-by-text',
                { description, limit }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to search by text');
        } catch (error) {
            console.error('Text search failed:', error);
            throw error;
        }
    },
};

export default imageMatchingService;
