import { useState, useCallback } from 'react';
import { productVariantService } from '@/services/product-variant.service';
import {
    ProductVariant,
    CreateVariantRequest,
    UpdateVariantRequest,
    VariantPriceRange
} from '@/types/product-variant';

export function useProductVariants(productId: number | null) {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVariants = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await productVariantService.getVariantsByProduct(productId);
            setVariants(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch variants';
            setError(errorMessage);
            console.error('Fetch variants error:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const getVariantCount = useCallback(async (prodId?: number): Promise<number> => {
        const targetId = prodId || productId;
        if (!targetId) return 0;

        setLoading(true);
        setError(null);
        try {
            const count = await productVariantService.getVariantCount(targetId);
            return count;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get variant count';
            setError(errorMessage);
            console.error('Get variant count error:', err);
            return 0;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const getPriceRange = useCallback(async (prodId?: number): Promise<VariantPriceRange | null> => {
        const targetId = prodId || productId;
        if (!targetId) return null;

        setLoading(true);
        setError(null);
        try {
            const range = await productVariantService.getPriceRange(targetId);
            return range;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get price range';
            setError(errorMessage);
            console.error('Get price range error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const createVariant = useCallback(async (data: CreateVariantRequest) => {
        setLoading(true);
        setError(null);
        try {
            const newVariant = await productVariantService.createVariant(data);
            setVariants(prev => [...prev, newVariant]);
            return newVariant;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create variant';
            setError(errorMessage);
            console.error('Create variant error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateVariant = useCallback(async (id: number, data: UpdateVariantRequest) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await productVariantService.updateVariant(id, data);
            setVariants(prev => prev.map(v => v.id === id ? updated : v));
            return updated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update variant';
            setError(errorMessage);
            console.error('Update variant error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteVariant = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const success = await productVariantService.deleteVariant(id);
            if (success) {
                setVariants(prev => prev.filter(v => v.id !== id));
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete variant';
            setError(errorMessage);
            console.error('Delete variant error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        variants,
        loading,
        error,
        fetchVariants,
        getVariantCount,
        getPriceRange,
        createVariant,
        updateVariant,
        deleteVariant
    };
}
