import { useState, useCallback } from 'react';
import { productImageService } from '@/services/product-image.service';
import {
    ProductImage,
    CreateImageRequest
} from '@/types/product-image';

export function useProductImages(productId: number | null) {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await productImageService.getImagesByProduct(productId);
            // Sort by displayOrder
            const sorted = data.sort((a, b) => a.displayOrder - b.displayOrder);
            setImages(sorted);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
            setError(errorMessage);
            console.error('Fetch images error:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const getPrimaryImage = useCallback(async (prodId?: number): Promise<ProductImage | null> => {
        const targetId = prodId || productId;
        if (!targetId) return null;

        setLoading(true);
        setError(null);
        try {
            const primaryImage = await productImageService.getPrimaryImage(targetId);
            return primaryImage;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get primary image';
            setError(errorMessage);
            console.error('Get primary image error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const getImageCount = useCallback(async (prodId?: number): Promise<number> => {
        const targetId = prodId || productId;
        if (!targetId) return 0;

        setLoading(true);
        setError(null);
        try {
            const count = await productImageService.getImageCount(targetId);
            return count;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get image count';
            setError(errorMessage);
            console.error('Get image count error:', err);
            return 0;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const addImage = useCallback(async (data: CreateImageRequest) => {
        setLoading(true);
        setError(null);
        try {
            const newImage = await productImageService.addImage(data);
            setImages(prev => [...prev, newImage].sort((a, b) => a.displayOrder - b.displayOrder));
            return newImage;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add image';
            setError(errorMessage);
            console.error('Add image error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const setPrimary = useCallback(async (imageId: number) => {
        if (!productId) return false;

        setLoading(true);
        setError(null);
        try {
            await productImageService.setPrimaryImage(imageId, productId);
            await fetchImages(); // Refresh to update all statuses
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to set primary image';
            setError(errorMessage);
            console.error('Set primary image error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [productId, fetchImages]);

    const updateOrder = useCallback(async (imageId: number, order: number) => {
        setLoading(true);
        setError(null);
        try {
            await productImageService.updateDisplayOrder(imageId, order);
            await fetchImages(); // Refresh to get correct order
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update image order';
            setError(errorMessage);
            console.error('Update image order error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchImages]);

    const reorderImages = useCallback(async (imageIds: number[], prodId?: number): Promise<boolean> => {
        const targetId = prodId || productId;
        if (!targetId) return false;

        setLoading(true);
        setError(null);
        try {
            const success = await productImageService.reorderImages(targetId, imageIds);
            if (success) {
                await fetchImages(); // Refresh to show new order
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reorder images';
            setError(errorMessage);
            console.error('Reorder images error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [productId, fetchImages]);

    const deleteImage = useCallback(async (imageId: number) => {
        setLoading(true);
        setError(null);
        try {
            const success = await productImageService.deleteImage(imageId);
            if (success) {
                setImages(prev => prev.filter(img => img.id !== imageId));
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
            setError(errorMessage);
            console.error('Delete image error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        images,
        loading,
        error,
        fetchImages,
        getPrimaryImage,
        getImageCount,
        addImage,
        setPrimary,
        updateOrder,
        reorderImages,
        deleteImage
    };
}
