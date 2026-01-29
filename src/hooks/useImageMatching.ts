'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import imageMatchingService, {
    ScanResponse,
    ImageMatchingStatus,
    UploadResponse,
    ExtractedAttributes,
    ProductWithScore
} from '@/services/image-matching.service';

// ============================================
// Query Keys
// ============================================

export const imageMatchingKeys = {
    all: ['image-matching'] as const,
    status: () => [...imageMatchingKeys.all, 'status'] as const,
    images: (page: number, limit: number) => [...imageMatchingKeys.all, 'images', { page, limit }] as const,
};

// ============================================
// Queries
// ============================================

/**
 * Hook để lấy status của AI providers (OpenAI/Gemini)
 */
export function useImageMatchingStatus() {
    return useQuery({
        queryKey: imageMatchingKeys.status(),
        queryFn: () => imageMatchingService.getStatus(),
        staleTime: 5 * 60 * 1000, // 5 phút
        retry: 1,
    });
}

/**
 * Hook để lấy danh sách ảnh đã upload
 */
export function useUploadedImages(page = 1, limit = 20) {
    return useQuery({
        queryKey: imageMatchingKeys.images(page, limit),
        queryFn: () => imageMatchingService.getUploadedImages(page, limit),
        staleTime: 2 * 60 * 1000, // 2 phút
    });
}

// ============================================
// Mutations
// ============================================

/**
 * Hook để upload ảnh lên S3
 */
export function useUploadImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { file: File; folderName?: string }) =>
            imageMatchingService.uploadImage(params.file, params.folderName),
        onSuccess: () => {
            // Invalidate images list after upload
            queryClient.invalidateQueries({ queryKey: imageMatchingKeys.all });
        },
    });
}

/**
 * Hook để scan ảnh từ imageId (sau khi upload S3)
 */
export function useScanImage() {
    return useMutation({
        mutationFn: (params: { imageId: string; provider?: string }) =>
            imageMatchingService.scanImage(params.imageId, params.provider),
    });
}

/**
 * Hook để scan ảnh trực tiếp từ base64 (không cần upload S3)
 */
export function useScanBase64() {
    return useMutation({
        mutationFn: (params: { imageBase64: string; provider?: string }) =>
            imageMatchingService.scanBase64(params.imageBase64, params.provider),
    });
}

/**
 * Hook để scan ảnh từ URL
 */
export function useScanImageByUrl() {
    return useMutation({
        mutationFn: (params: { imageUrl: string; provider?: string }) =>
            imageMatchingService.scanImageByUrl(params.imageUrl, params.provider),
    });
}

/**
 * Hook để extract attributes (không search products)
 */
export function useExtractAttributes() {
    return useMutation({
        mutationFn: (imageId: string) => imageMatchingService.extractAttributes(imageId),
    });
}

/**
 * Hook để tìm sản phẩm tương tự
 */
export function useFindSimilar() {
    return useMutation({
        mutationFn: (params: { productId: number; limit?: number }) =>
            imageMatchingService.findSimilar(params.productId, params.limit),
    });
}

/**
 * Hook để tìm kiếm theo mô tả text
 */
export function useSearchByText() {
    return useMutation({
        mutationFn: (params: { description: string; limit?: number }) =>
            imageMatchingService.searchByText(params.description, params.limit),
    });
}

// ============================================
// Combined Hook for Scanner Flow
// ============================================

export interface ScannerState {
    isUploading: boolean;
    isScanning: boolean;
    uploadResult: UploadResponse | null;
    scanResult: ScanResponse | null;
    error: string | null;
}

/**
 * Combined hook cho flow: Upload → Scan → Display Results
 * Hỗ trợ cả 2 flow: S3 upload + scan, hoặc direct base64 scan
 */
export function useImageScanner() {
    const uploadMutation = useUploadImage();
    const scanMutation = useScanImage();
    const scanBase64Mutation = useScanBase64();

    const state: ScannerState = {
        isUploading: uploadMutation.isPending,
        isScanning: scanMutation.isPending || scanBase64Mutation.isPending,
        uploadResult: uploadMutation.data || null,
        scanResult: scanMutation.data || scanBase64Mutation.data || null,
        error:
            uploadMutation.error?.message ||
            scanMutation.error?.message ||
            scanBase64Mutation.error?.message ||
            null,
    };

    const reset = () => {
        uploadMutation.reset();
        scanMutation.reset();
        scanBase64Mutation.reset();
    };

    return {
        ...state,
        uploadImage: uploadMutation.mutateAsync,
        scanImage: scanMutation.mutateAsync,
        scanBase64: scanBase64Mutation.mutateAsync,
        reset,
    };
}
